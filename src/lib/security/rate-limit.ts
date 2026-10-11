// Sliding-window rate limiter. In-memory per server instance; for multi-instance
// production deployments swap the store for Redis/Upstash behind the same API
// (documented in docs/DEPLOYMENT.md).

interface Window {
  hits: number[];
}

declare global {
  var __sgRate: Map<string, Window> | undefined;
}
const store = (globalThis.__sgRate ??= new Map());

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateResult {
  if (process.env.RATE_LIMIT_DISABLED === "true") return { ok: true, remaining: limit, retryAfterSec: 0 };
  const w = store.get(key) ?? { hits: [] };
  w.hits = w.hits.filter((t: number) => now - t < windowMs);
  if (w.hits.length >= limit) {
    store.set(key, w);
    const retry = Math.ceil((windowMs - (now - w.hits[0])) / 1000);
    return { ok: false, remaining: 0, retryAfterSec: Math.max(1, retry) };
  }
  w.hits.push(now);
  store.set(key, w);
  if (store.size > 50_000) prune(now);
  return { ok: true, remaining: limit - w.hits.length, retryAfterSec: 0 };
}

function prune(now: number) {
  for (const [k, w] of store) {
    if (!w.hits.length || now - w.hits[w.hits.length - 1] > 3_600_000) store.delete(k);
  }
}

export function resetRateLimits() {
  store.clear();
}
