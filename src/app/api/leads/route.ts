import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getCalendar, getNotifier } from "@/lib/server";
import { submitRequest } from "@/lib/leads/submit";
import { rateLimit } from "@/lib/security/rate-limit";
import { BodyTooLargeError, InvalidJsonError, clientKey, isSameOrigin, json, problem, readJson } from "@/lib/security/request";
import { log, errorCode } from "@/lib/log";

export async function POST(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");
  const ip = clientKey(req);
  const r1 = rateLimit(`leads:ip:${ip}`, 6, 10 * 60_000);
  const r2 = rateLimit(`leads:ip-day:${ip}`, 30, 86_400_000);
  if (!r1.ok || !r2.ok) {
    return problem(429, "rate_limited", "Too many submissions from this connection. Please try again later.", {
      retryAfter: Math.max(r1.retryAfterSec, r2.retryAfterSec),
    });
  }

  let raw: unknown;
  try {
    raw = await readJson(req, 200_000);
  } catch (err) {
    if (err instanceof BodyTooLargeError) return problem(413, "too_large", "Submission is too large.");
    if (err instanceof InvalidJsonError) return problem(400, "invalid_json", "Invalid request.");
    throw err;
  }

  try {
    const db = await getDb();
    const outcome = await submitRequest(
      { db, calendar: getCalendar(), notifier: getNotifier(), timezone: env().CALENDAR_TIMEZONE },
      raw,
    );
    if (!outcome.ok) {
      return problem(outcome.status, outcome.code, outcome.message, outcome.fields ? { fields: outcome.fields } : {});
    }
    log.info("lead.submitted", { kind: outcome.kind, replayed: outcome.replayed, consultation: outcome.consultation?.status ?? null });
    return json(outcome, { status: outcome.replayed ? 200 : 201 });
  } catch (err) {
    // Never report success unless the database committed.
    log.error("lead.failed", { err: errorCode(err) });
    return problem(503, "save_failed", "We couldn't save your request. Nothing was submitted, so please try again.");
  }
}
