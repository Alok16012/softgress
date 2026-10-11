import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getProvider } from "@/lib/ai";
import { chatRequestSchema, runChat, type ChatSse } from "@/lib/ai/chat-service";
import { rateLimit } from "@/lib/security/rate-limit";
import { BodyTooLargeError, InvalidJsonError, clientKey, isSameOrigin, problem, readJson } from "@/lib/security/request";
import { log, errorCode } from "@/lib/log";

export async function POST(req: Request) {
  if (!isSameOrigin(req, env().SITE_URL)) return problem(403, "forbidden_origin", "Cross-origin requests are not allowed.");

  let raw: unknown;
  try {
    raw = await readJson(req, 96_000);
  } catch (err) {
    if (err instanceof BodyTooLargeError) return problem(413, "too_large", "Message history is too large.");
    if (err instanceof InvalidJsonError) return problem(400, "invalid_json", "Invalid request.");
    throw err;
  }
  const parsed = chatRequestSchema.safeParse(raw);
  if (!parsed.success) return problem(422, "invalid", parsed.error.issues[0]?.message ?? "Invalid request.");
  const body = parsed.data;

  // Abuse protection: per client (hashed IP) and per session; plus a daily token budget proxy.
  const ip = clientKey(req);
  for (const [key, limit, windowMs] of [
    [`chat:ip:${ip}`, 20, 60_000],
    [`chat:session:${body.sessionId}`, 12, 60_000],
    [`chat:session-day:${body.sessionId}`, 150, 86_400_000],
    [`chat:ip-day:${ip}`, 400, 86_400_000],
  ] as const) {
    const r = rateLimit(key, limit, windowMs);
    if (!r.ok) {
      return problem(429, "rate_limited", "You're sending messages quickly. Please wait a moment.", { retryAfter: r.retryAfterSec });
    }
  }

  let db;
  try {
    db = await getDb();
  } catch (err) {
    log.error("chat.db_unavailable", { err: errorCode(err) });
    return problem(503, "unavailable", "The virtual office is temporarily unavailable. Please try again shortly.");
  }

  const provider = getProvider();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: ChatSse) => controller.enqueue(encoder.encode(`event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`));
      try {
        for await (const e of runChat({ db, provider, timeoutMs: env().AI_TIMEOUT_MS }, body, req.signal)) send(e);
      } catch (err) {
        log.error("chat.stream_failed", { err: errorCode(err) });
        send({ event: "error", data: { code: "internal_error", message: "Something went wrong. Please try again.", retryable: true } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
