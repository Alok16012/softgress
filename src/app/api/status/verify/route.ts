import { getDb } from "@/lib/db";
import { env, sessionSecret } from "@/lib/env";
import { consumeVerification, getPublicStatus } from "@/lib/db/repository";
import { codeHash, verifyCodeSchema } from "@/lib/leads/status";
import { sha256Hex } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientKey, isSameOrigin, json, problem, readJson } from "@/lib/security/request";
import { log, errorCode } from "@/lib/log";

export async function POST(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");
  if (!rateLimit(`status-verify:${clientKey(req)}`, 10, 15 * 60_000).ok) {
    return problem(429, "rate_limited", "Too many attempts. Please try again in a few minutes.");
  }
  const parsed = verifyCodeSchema.safeParse(await readJson(req, 2_000).catch(() => null));
  if (!parsed.success) return problem(422, "invalid", parsed.error.issues[0]?.message ?? "Invalid code.");
  const { reference, code } = parsed.data;
  try {
    const db = await getDb();
    const requestId = await consumeVerification(db, reference, sha256Hex(codeHash(reference, code, sessionSecret())));
    if (!requestId) return problem(401, "invalid_code", "That code is invalid or has expired. Request a new one.");
    return json({ ok: true, status: await getPublicStatus(db, requestId) });
  } catch (err) {
    log.error("status.verify_failed", { err: errorCode(err) });
    return problem(503, "unavailable", "Couldn't verify right now. Please try again.");
  }
}
