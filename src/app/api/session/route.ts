import { z } from "zod";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { deleteSession } from "@/lib/db/repository";
import { isSameOrigin, json, problem, readJson } from "@/lib/security/request";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientKey } from "@/lib/security/request";

const bodySchema = z.object({ sessionId: z.string().uuid() });

/** Privacy reset: removes the anonymous session's server-side metadata. Leads already submitted are kept. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");
  if (!rateLimit(`session-del:${clientKey(req)}`, 10, 60_000).ok) return problem(429, "rate_limited", "Please wait a moment.");
  const parsed = bodySchema.safeParse(await readJson(req, 2_000).catch(() => null));
  if (!parsed.success) return problem(422, "invalid", "Invalid session id.");
  try {
    const deleted = await deleteSession(await getDb(), parsed.data.sessionId);
    return json({ ok: true, deleted });
  } catch {
    return problem(503, "unavailable", "Couldn't reach the server. Your local data was still cleared.");
  }
}
