import { createHash, createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32 (no I, L, O, U)

/** Unguessable request reference, e.g. SG-7K3M-Q9TD (~40 bits of entropy). */
export function referenceCode(): string {
  const pick = () => Array.from({ length: 4 }, () => B32[randomInt(32)]).join("");
  return `SG-${pick()}-${pick()}`;
}

export function oneTimeCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function hmac(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// scrypt password hashes: scrypt$N$r$p$salt$hash (base64url)
export function hashPassword(password: string, N = 16384, r = 8, p = 1): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32, { N, r, p });
  return ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash, "base64url");
  const key = scryptSync(password, Buffer.from(salt, "base64url"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(key, expected);
}
