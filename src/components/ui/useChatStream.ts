"use client";
import { useCallback, useRef, useState } from "react";
import { useChat, uid, type ChatMessage } from "@/stores/chat";
import { useBrief } from "@/stores/brief";
import type { BriefSuggestion, RouteSuggestion } from "@/lib/ai/tools";

interface SseEvent {
  event: string;
  data: unknown;
}

/** Parse an SSE byte stream into events. */
async function* readSse(res: Response): AsyncGenerator<SseEvent> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const block = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = "message";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) event = line.slice(7);
        else if (line.startsWith("data: ")) data += line.slice(6);
      }
      try {
        yield { event, data: data ? JSON.parse(data) : null };
      } catch {
        /* ignore malformed */
      }
    }
  }
}

export function useChatStream(staffId: string | null) {
  const abort = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (text: string) => {
      if (!staffId) return;
      const store = useChat.getState();
      const thread = store.thread(staffId);
      const history = thread.messages
        .filter((m) => !m.note && m.status === "done" && m.content.trim())
        .map((m) => ({ role: m.role, content: m.content }));
      const userMsg: ChatMessage = { id: uid(), role: "user", content: text, status: "done" };
      const asst: ChatMessage = { id: uid(), role: "assistant", content: "", status: "streaming" };
      store.push(staffId, userMsg);
      store.push(staffId, asst);

      const ctrl = new AbortController();
      abort.current = ctrl;
      setBusy(true);
      const patch = (p: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) => useChat.getState().patch(staffId, asst.id, p);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            sessionId: store.sessionId,
            staffId,
            messages: [...history, { role: "user", content: text }].slice(-24),
            sharedBrief: thread.briefShare === "shared" ? useBrief.getState().brief : null,
          }),
        });
        if (!res.ok || !res.body) {
          let message = "I couldn't reply just now. Please try again.";
          let code = `http_${res.status}`;
          try {
            const j = await res.json();
            message = j?.error?.message ?? message;
            code = j?.error?.code ?? code;
          } catch {
            /* non-JSON */
          }
          patch({ status: "error", error: { code, message, retryable: res.status !== 403 && res.status !== 422 } });
          return;
        }
        let gotText = false;
        for await (const ev of readSse(res)) {
          switch (ev.event) {
            case "meta": {
              const d = ev.data as { mode: "anthropic" | "demo"; grounding: { id: string; title: string }[] };
              patch({ mode: d.mode, grounding: d.grounding });
              break;
            }
            case "delta":
              gotText = true;
              patch((m) => ({ content: m.content + (ev.data as { text: string }).text }));
              break;
            case "brief":
              patch({ briefSuggestion: { ...((ev.data as { suggestion: BriefSuggestion }).suggestion), state: "pending" } });
              break;
            case "route":
              patch({ routeSuggestion: ev.data as RouteSuggestion });
              break;
            case "notice":
              patch((m) => ({ notices: [...(m.notices ?? []), ...(ev.data as { codes: string[] }).codes] }));
              break;
            case "error": {
              const d = ev.data as { code: string; message: string; retryable: boolean };
              patch({ status: "error", error: d });
              return;
            }
            case "done":
              patch({ status: "done" });
              break;
          }
        }
        // Stream closed without "done": treat as interrupted.
        const final = useChat.getState().thread(staffId).messages.find((m) => m.id === asst.id);
        if (final?.status === "streaming") {
          patch(gotText ? { status: "done" } : { status: "error", error: { code: "interrupted", message: "The reply was interrupted. Please try again.", retryable: true } });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          patch((m) => ({ status: m.content ? "cancelled" : "error", error: m.content ? undefined : { code: "cancelled", message: "Cancelled.", retryable: true } }));
        } else {
          patch({ status: "error", error: { code: "network", message: "Connection problem: your message wasn't answered. Check your connection and retry.", retryable: true } });
        }
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [staffId],
  );

  const send = useCallback((text: string) => run(text.trim()), [run]);

  const cancel = useCallback(() => abort.current?.abort(), []);

  /** Retry the visitor message preceding a failed reply. */
  const retry = useCallback(
    (assistantId: string) => {
      if (!staffId) return;
      const t = useChat.getState().thread(staffId);
      const i = t.messages.findIndex((m) => m.id === assistantId);
      const user = [...t.messages.slice(0, i)].reverse().find((m) => m.role === "user");
      if (!user) return;
      // Remove the failed pair, then resend.
      useChat.setState((s) => ({
        threads: {
          ...s.threads,
          [staffId]: { ...t, messages: t.messages.filter((m) => m.id !== assistantId && m.id !== user.id) },
        },
      }));
      void run(user.content);
    },
    [run, staffId],
  );

  return { send, cancel, retry, busy };
}
