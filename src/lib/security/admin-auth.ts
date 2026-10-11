import "server-only";
import { cookies } from "next/headers";
import { env, isProduction, sessionSecret } from "@/lib/env";
import { hashPassword, hmac, safeEqual, verifyPassword } from "./crypto";

export type AdminRole = "owner" | "manager" | "viewer";
export interface AdminSession {
  id: string;
  email: string;
  role: AdminRole;
  exp: number;
}

export const ADMIN_COOKIE = "sg_admin";
const SESSION_TTL_SEC = 8 * 3600;
const RANK: Record<AdminRole, number> = { viewer: 0, manager: 1, owner: 2 };

export type Permission =
  | "leads:read"
  | "leads:write"
  | "leads:export"
  | "catalog:write"
  | "knowledge:write"
  | "knowledge:approve"
  | "audit:read";

const REQUIRED: Record<Permission, AdminRole> = {
  "leads:read": "viewer",
  "leads:write": "manager",
  "leads:export": "manager",
  "catalog:write": "owner",
  "knowledge:write": "manager",
  "knowledge:approve": "owner",
  "audit:read": "manager",
};

export function can(role: AdminRole, perm: Permission): boolean {
  return RANK[role] >= RANK[REQUIRED[perm]];
}

interface Account {
  email: string;
  role: AdminRole;
  hash: string | null;
  plaintext: string | null;
}

function accounts(): Account[] {
  const e = env();
  const list: Account[] = [];
  if (e.ADMIN_EMAIL) {
    const plaintext = !isProduction() && e.ADMIN_PASSWORD ? e.ADMIN_PASSWORD : null;
    list.push({ email: e.ADMIN_EMAIL.toLowerCase(), role: e.ADMIN_ROLE, hash: e.ADMIN_PASSWORD_HASH ?? null, plaintext });
  }
  // EXTRA_ADMINS="email:role:scrypt$...;email2:role:scrypt$..."
  for (const entry of (e.EXTRA_ADMINS ?? "").split(";").map((s) => s.trim()).filter(Boolean)) {
    const [email, role, hash] = entry.split(":");
    if (email && hash && (role === "owner" || role === "manager" || role === "viewer")) {
      list.push({ email: email.toLowerCase(), role, hash, plaintext: null });
    }
  }
  return list;
}

export function adminConfigured(): boolean {
  return accounts().some((a) => a.hash || a.plaintext);
}

// Used to keep timing similar when the account doesn't exist.
let dummyHash: string | null = null;

export function authenticate(email: string, password: string): { email: string; role: AdminRole } | null {
  const acct = accounts().find((a) => a.email === email.trim().toLowerCase());
  if (!acct) {
    dummyHash ??= hashPassword("not-a-real-password");
    verifyPassword(password, dummyHash);
    return null;
  }
  let ok = false;
  if (acct.hash) ok = verifyPassword(password, acct.hash);
  else if (acct.plaintext) ok = safeEqual(password, acct.plaintext);
  return ok ? { email: acct.email, role: acct.role } : null;
}

export function signSession(s: Omit<AdminSession, "exp">): { value: string; maxAge: number } {
  const payload: AdminSession = { ...s, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { value: `${body}.${hmac(sessionSecret(), body)}`, maxAge: SESSION_TTL_SEC };
}

export function verifySession(value: string | undefined | null): AdminSession | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(sessionSecret(), body))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminSession;
    if (typeof s.exp !== "number" || s.exp < Date.now() / 1000) return null;
    // Re-check the account still exists with the same role (revocation by config change).
    const acct = accounts().find((a) => a.email === s.email);
    if (!acct || acct.role !== s.role) return null;
    return s;
  } catch {
    return null;
  }
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure: isProduction(),
  path: "/",
  maxAge,
});

/** For server components (inside a Suspense boundary). */
export async function getAdmin(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

/** For route handlers: returns the session or null when unauthorised/forbidden. */
export function adminFromRequest(req: Request): AdminSession | null {
  const raw = req.headers.get("cookie") ?? "";
  const match = raw.split(/;\s*/).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  return verifySession(match ? decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1)) : null);
}
