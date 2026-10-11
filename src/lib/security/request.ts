import { createHash } from "node:crypto";

/** Coarse client identifier for rate limiting. Hashed: raw IPs are never stored or logged. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * CSRF defence for state-changing JSON endpoints: the request must come from our
 * own origin. Browsers always send Origin on cross-origin POSTs, and
 * Sec-Fetch-Site on modern browsers.
 */
export function isSameOrigin(req: Request, siteUrl?: string): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    try {
      const o = new URL(origin);
      if (host && o.host === host) return true;
      if (siteUrl && o.origin === new URL(siteUrl).origin) return true;
    } catch {
      return false;
    }
    return false;
  }
  const site = req.headers.get("sec-fetch-site");
  return site === "same-origin" || site === "none";
}

export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: { "cache-control": "no-store", ...(init.headers ?? {}) },
  });
}

export function problem(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return json({ ok: false, error: { code, message, ...extra } }, { status });
}

/** Parse a JSON body with a hard size cap. */
export async function readJson(req: Request, maxBytes = 64_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) throw new BodyTooLargeError();
  const text = await req.text();
  if (text.length > maxBytes) throw new BodyTooLargeError();
  try {
    return JSON.parse(text);
  } catch {
    throw new InvalidJsonError();
  }
}
export class BodyTooLargeError extends Error {}
export class InvalidJsonError extends Error {}
