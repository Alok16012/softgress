import { getDb } from "@/lib/db";
import { env, sessionSecret } from "@/lib/env";
import { getNotifier } from "@/lib/server";
import { createVerification, findRequestForContact, recentVerificationCount } from "@/lib/db/repository";
import { codeHash, requestCodeSchema } from "@/lib/leads/status";
import { oneTimeCode, sha256Hex } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientKey, isSameOrigin, json, problem, readJson } from "@/lib/security/request";
import { log, errorCode } from "@/lib/log";

export async function POST(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");
  if (!rateLimit(`status-code:${clientKey(req)}`, 5, 15 * 60_000).ok) {
    return problem(429, "rate_limited", "Too many attempts. Please try again in a few minutes.");
  }
  const parsed = requestCodeSchema.safeParse(await readJson(req, 2_000).catch(() => null));
  if (!parsed.success) return problem(422, "invalid", parsed.error.issues[0]?.message ?? "Check the reference and contact.");
  const { reference, email, phone } = parsed.data;

  const notifier = getNotifier();
  const delivery = notifier.delivers ? "delivers" : notifier.devOutbox ? "dev_outbox" : "none";
  // Identical response whether or not the details match (no enumeration).
  const generic = {
    ok: true,
    delivery,
    message:
      delivery === "none"
        ? "Code delivery isn't configured on this site yet. Please contact the Softgress team and quote your reference."
        : "If those details match a request, a 6-digit code has been sent to that contact. It expires in 10 minutes.",
  };
  if (delivery === "none") return json(generic);
  if (!rateLimit(`status-code-ref:${reference}`, 3, 15 * 60_000).ok) return json(generic);

  try {
    const db = await getDb();
    const match = await findRequestForContact(db, reference, { email, phone });
    if (match && (await recentVerificationCount(db, match.requestId, 15)) < 3) {
      const code = oneTimeCode();
      await createVerification(db, match.requestId, match.channel, sha256Hex(codeHash(reference, code, sessionSecret())), 10);
      await notifier.send({
        channel: match.channel,
        to: match.destination,
        subject: `Your Softgress status code: ${code}`,
        body: `Use code ${code} to view the status of ${reference}. It expires in 10 minutes. If you didn't request this, ignore this message.`,
      });
    }
    return json(generic);
  } catch (err) {
    log.error("status.code_failed", { err: errorCode(err) });
    return problem(503, "unavailable", "Couldn't process the request. Please try again.");
  }
}
