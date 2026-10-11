import { ADMIN_COOKIE } from "@/lib/security/admin-auth";
import { env } from "@/lib/env";
import { isSameOrigin, json, problem } from "@/lib/security/request";

export async function POST(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");
  const res = json({ ok: true });
  res.headers.append("set-cookie", `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`);
  return res;
}
