import { z } from "zod";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { upsertAdminUser } from "@/lib/db/repository";
import { ADMIN_COOKIE, adminConfigured, authenticate, cookieOptions, signSession } from "@/lib/security/admin-auth";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientKey, isSameOrigin, json, problem, readJson } from "@/lib/security/request";
import { log } from "@/lib/log";

const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");
  if (!adminConfigured()) return problem(503, "admin_not_configured", "Admin access isn't configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH.");
  const parsed = schema.safeParse(await readJson(req, 2_000).catch(() => null));
  if (!parsed.success) return problem(422, "invalid", "Enter your email and password.");
  const ip = clientKey(req);
  const limited = !rateLimit(`admin-login:${ip}`, 8, 15 * 60_000).ok || !rateLimit(`admin-login-acct:${parsed.data.email.toLowerCase()}`, 5, 15 * 60_000).ok;
  if (limited) return problem(429, "rate_limited", "Too many attempts. Try again in 15 minutes.");
  const acct = authenticate(parsed.data.email, parsed.data.password);
  if (!acct) {
    log.warn("admin.login_failed", {});
    return problem(401, "invalid_credentials", "Incorrect email or password.");
  }
  const id = await upsertAdminUser(await getDb(), acct.email, acct.role);
  const { value, maxAge } = signSession({ id, email: acct.email, role: acct.role });
  const res = json({ ok: true, role: acct.role });
  res.headers.append("set-cookie", serialize(ADMIN_COOKIE, value, cookieOptions(maxAge)));
  log.info("admin.login", { role: acct.role });
  return res;
}

function serialize(name: string, value: string, o: ReturnType<typeof cookieOptions>) {
  return `${name}=${encodeURIComponent(value)}; Path=${o.path}; Max-Age=${o.maxAge}; HttpOnly; SameSite=Strict${o.secure ? "; Secure" : ""}`;
}
