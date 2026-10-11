import { z } from "zod";
import type { Db } from "@/lib/db/driver";
import { getCatalog } from "@/lib/catalog";
import { recordConversationTurn } from "@/lib/db/repository";
import { staffById } from "@/content/staff";
import { briefSchema, clean } from "@/lib/leads/schema";
import { log, errorCode } from "@/lib/log";
import { detectLang } from "./lang";
import { corpusFor, search } from "./retrieval";
import { detectInjection, detectSensitive, redactSensitive, scanOutput } from "./guardrails";
import { ProviderError, type ChatProvider, type ChatTurn } from "./provider";

export const MAX_HISTORY = 12;
export const MAX_MESSAGE_CHARS = 2000;

export const chatRequestSchema = z.object({
  sessionId: z.string().uuid(),
  staffId: z.string().max(40),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(MAX_MESSAGE_CHARS * 3).transform((s) => clean(s).slice(0, MAX_MESSAGE_CHARS)),
      }),
    )
    .min(1)
    .max(60)
    .refine((m) => m[m.length - 1].role === "user", "Last message must be from the visitor")
    .refine((m) => m[m.length - 1].content.length > 0, "Message is empty"),
  sharedBrief: briefSchema.partial().nullable().default(null),
});
export type ChatRequestBody = z.infer<typeof chatRequestSchema>;

export type ChatSse =
  | { event: "meta"; data: { mode: "anthropic" | "demo"; model: string; staffId: string; grounding: { id: string; title: string }[]; lang: string } }
  | { event: "delta"; data: { text: string } }
  | { event: "brief"; data: { suggestion: Record<string, unknown> } }
  | { event: "route"; data: { department: string; reason: string } }
  | { event: "notice"; data: { codes: string[] } }
  | { event: "error"; data: { code: string; message: string; retryable: boolean } }
  | { event: "done"; data: { stopReason: string } };

/** Runs one guide turn and yields SSE-ready events. Never logs message bodies. */
export async function* runChat(
  deps: { db: Db; provider: ChatProvider; timeoutMs: number },
  body: ChatRequestBody,
  clientSignal: AbortSignal,
): AsyncGenerator<ChatSse> {
  const staff = staffById.get(body.staffId);
  if (!staff) {
    yield { event: "error", data: { code: "unknown_staff", message: "That guide isn't available.", retryable: false } };
    return;
  }
  const started = Date.now();
  const catalog = await getCatalog(deps.db);

  const history: ChatTurn[] = body.messages.slice(-MAX_HISTORY);
  const latestRaw = history[history.length - 1].content;
  const injection = detectInjection(latestRaw);
  const sensitive = detectSensitive(latestRaw);
  history[history.length - 1] = { role: "user", content: redactSensitive(latestRaw) };
  // Assistant turns are replayed as plain text; strip anything that looks like our tags.
  for (const turn of history) turn.content = turn.content.replace(/<\/?(visitor_message|retrieved_context|shared_brief|doc)[^>]*>/gi, "");

  const lang = detectLang(latestRaw);
  const prevUser = [...history].reverse().filter((h) => h.role === "user")[1]?.content ?? "";
  const hits = search(corpusFor(catalog.corpus, staff.departmentSlug), `${latestRaw} ${prevUser}`, {
    departmentSlug: staff.departmentSlug,
    k: 6,
  });

  yield {
    event: "meta",
    data: {
      mode: deps.provider.id,
      model: deps.provider.model,
      staffId: staff.id,
      grounding: hits.map((h) => ({ id: h.doc.id, title: h.doc.title })),
      lang,
    },
  };

  const timeout = AbortSignal.timeout(deps.timeoutMs);
  const signal = AbortSignal.any([clientSignal, timeout]);
  let text = "";
  let stopReason = "end_turn";
  try {
    for await (const ev of deps.provider.stream(
      {
        staff,
        departments: catalog.departments,
        services: catalog.services,
        history,
        hits,
        lang,
        sharedBrief: body.sharedBrief,
        injectionReasons: injection.reasons,
        sensitive,
      },
      signal,
    )) {
      if (ev.type === "text") {
        text += ev.text;
        yield { event: "delta", data: { text: ev.text } };
      } else if (ev.type === "brief") {
        yield { event: "brief", data: { suggestion: ev.suggestion } };
      } else if (ev.type === "route") {
        yield { event: "route", data: ev.suggestion };
      } else if (ev.type === "refusal") {
        yield {
          event: "error",
          data: { code: "refusal", message: "I can't help with that request. I'm happy to answer questions about Softgress's services.", retryable: false },
        };
      } else if (ev.type === "done") {
        stopReason = ev.stopReason;
        log.info("chat.turn", {
          staff: staff.id,
          provider: deps.provider.id,
          ms: Date.now() - started,
          in: ev.usage?.input,
          out: ev.usage?.output,
          hits: hits.length,
          lang,
          injection: injection.flagged,
          stop: ev.stopReason,
        });
      }
    }
  } catch (err) {
    const code = err instanceof ProviderError ? err.code : "internal_error";
    log.warn("chat.error", { staff: staff.id, code, err: errorCode(err), ms: Date.now() - started });
    const message =
      code === "provider_timeout"
        ? "The reply took too long. Please try again."
        : code === "provider_busy"
          ? "Our AI guides are busy right now. Please try again in a moment."
          : "I couldn't answer just now. Please try again, or use the request form to reach the team directly.";
    yield { event: "error", data: { code, message, retryable: code !== "provider_auth" } };
    return;
  }

  const published = catalog.services.filter((s) => s.startingPrice != null).map((s) => s.startingPrice!);
  const warnings = scanOutput(text, published);
  if (warnings.length) yield { event: "notice", data: { codes: warnings } };

  try {
    await recordConversationTurn(deps.db, body.sessionId, staff.id, staff.departmentSlug);
  } catch (err) {
    log.warn("chat.meta_failed", { err: errorCode(err) });
  }
  yield { event: "done", data: { stopReason } };
}
