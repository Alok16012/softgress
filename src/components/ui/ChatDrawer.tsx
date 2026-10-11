"use client";
import { ArrowRight, Check, ClipboardList, Loader2, RotateCcw, Send, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { staffByDepartment, staffById } from "@/content/staff";
import { BUDGET_LABELS, type DepartmentSlug, type ProjectBrief } from "@/lib/types";
import { useChat, uid, type ChatMessage } from "@/stores/chat";
import { briefIsEmpty, useBrief } from "@/stores/brief";
import { useTour } from "@/stores/tour";
import { useCatalog } from "./CatalogContext";
import { useChatStream } from "./useChatStream";

const NOTICE_TEXT: Record<string, string> = {
  unverified_amount: "This reply mentions an amount that isn't a published Softgress price. Pricing is by custom quote.",
  guarantee_language: "Softgress doesn't guarantee results. Commitments are defined only in a signed proposal.",
};

function briefSummary(b: ProjectBrief, serviceTitle: (s: string) => string): string[] {
  const out: string[] = [];
  if (b.projectType) out.push(`Project: ${b.projectType}`);
  if (b.serviceSlugs.length) out.push(`Services: ${b.serviceSlugs.map(serviceTitle).join(", ")}`);
  if (b.platforms.length) out.push(`Platforms: ${b.platforms.join(", ")}`);
  if (b.features.length) out.push(`Features: ${b.features.slice(0, 4).join(", ")}${b.features.length > 4 ? "…" : ""}`);
  if (b.budget) out.push(`Budget: ${BUDGET_LABELS[b.budget]}`);
  if (b.targetDate) out.push(`Timing: ${b.targetDate}`);
  if (b.industry) out.push(`Industry: ${b.industry}`);
  if (b.goals) out.push(`Goals: ${b.goals.slice(0, 80)}${b.goals.length > 80 ? "…" : ""}`);
  return out;
}

function SuggestionCard({ m, staffId }: { m: ChatMessage; staffId: string }) {
  const s = m.briefSuggestion!;
  const apply = useBrief((b) => b.apply);
  const patch = useChat((c) => c.patch);
  const { services } = useCatalog();
  const title = (slug: string) => services.find((x) => x.slug === slug)?.title ?? slug;
  const rows: [string, string][] = [];
  if (s.projectType) rows.push(["Project", s.projectType]);
  if (s.serviceSlugs?.length) rows.push(["Services", s.serviceSlugs.map(title).join(", ")]);
  if (s.platforms?.length) rows.push(["Platforms", s.platforms.join(", ")]);
  if (s.features?.length) rows.push(["Features", s.features.join(", ")]);
  if (s.budget) rows.push(["Budget", BUDGET_LABELS[s.budget]]);
  if (s.targetDate) rows.push(["Timing", s.targetDate]);
  if (s.industry) rows.push(["Industry", s.industry]);
  if (s.goals) rows.push(["Goals", s.goals]);
  if (!rows.length) return null;
  return (
    <div className="mt-2 rounded-xl border border-teal/40 bg-teal/10 p-3 text-sm">
      <div className="flex items-center gap-2 font-semibold text-mint">
        <ClipboardList size={16} aria-hidden /> Suggested for your brief
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-white/60">{k}</dt>
            <dd className="text-white">{v}</dd>
          </div>
        ))}
      </dl>
      {s.state === "pending" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary !min-h-9 !px-3 text-sm"
            onClick={() => {
              const { state: _s, ...rest } = s;
              void _s;
              apply(rest);
              patch(staffId, m.id, { briefSuggestion: { ...s, state: "applied" } });
            }}
          >
            <Check size={16} aria-hidden /> Apply to brief
          </button>
          <button type="button" className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => patch(staffId, m.id, { briefSuggestion: { ...s, state: "dismissed" } })}>
            Dismiss
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-white/60">{s.state === "applied" ? "Applied to your brief. You can edit it any time." : "Dismissed."}</p>
      )}
    </div>
  );
}

function RouteCard({ dept, reason }: { dept: DepartmentSlug; reason: string }) {
  const dispatch = useTour((s) => s.dispatch);
  const { departments } = useCatalog();
  const staff = staffByDepartment.get(dept);
  const d = departments.find((x) => x.slug === dept);
  if (!staff || !d) return null;
  return (
    <div className="mt-2 rounded-xl border border-white/15 bg-white/5 p-3 text-sm">
      <p className="text-white/80">{reason}</p>
      <button type="button" className="mt-2 btn-ghost !min-h-9 !px-3 text-sm" onClick={() => dispatch({ type: "TALK", staffId: staff.id })}>
        Go to {d.shortName} and talk to {staff.displayName} <ArrowRight size={16} aria-hidden />
      </button>
    </div>
  );
}

function Message({ m, staffId, onRetry }: { m: ChatMessage; staffId: string; onRetry: (id: string) => void }) {
  if (m.note) {
    return <li className="text-center text-xs text-white/55 px-4">{m.content}</li>;
  }
  const mine = m.role === "user";
  return (
    <li className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${mine ? "rounded-2xl rounded-br-md bg-teal text-midnight px-4 py-2.5" : ""}`}>
        {!mine && (
          <div
            className={`rounded-2xl rounded-bl-md bg-white/[0.07] border border-white/10 px-4 py-2.5 whitespace-pre-wrap leading-relaxed text-[15px] ${m.status === "streaming" ? "typing-caret" : ""}`}
          >
            {m.content || (m.status === "streaming" ? <span className="text-white/60">Thinking…</span> : null)}
            {m.status === "cancelled" && <span className="block mt-1 text-xs text-white/50">Reply stopped.</span>}
          </div>
        )}
        {mine && <span className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.content}</span>}
        {m.status === "error" && m.error && (
          <div role="alert" className="mt-2 rounded-xl border border-red-300/40 bg-red-400/10 px-3 py-2 text-sm text-red-100">
            {m.error.message}
            {m.error.retryable && (
              <button type="button" className="ml-2 inline-flex items-center gap-1 font-semibold underline" onClick={() => onRetry(m.id)}>
                <RotateCcw size={14} aria-hidden /> Retry
              </button>
            )}
          </div>
        )}
        {m.notices?.map((n) => (
          <p key={n} className="mt-2 text-xs rounded-lg bg-warn/10 border border-warn/30 text-[#ffe08a] px-3 py-2">
            {NOTICE_TEXT[n] ?? n}
          </p>
        ))}
        {m.briefSuggestion && <SuggestionCard m={m} staffId={staffId} />}
        {m.routeSuggestion && <RouteCard dept={m.routeSuggestion.department} reason={m.routeSuggestion.reason} />}
        {!mine && m.status === "done" && m.grounding && m.grounding.length > 0 && (
          <details className="mt-1 text-xs text-white/45">
            <summary className="cursor-pointer">Sources used ({m.grounding.length})</summary>
            <ul className="mt-1 list-disc pl-4">
              {m.grounding.map((g) => (
                <li key={g.id}>{g.title}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </li>
  );
}

export function ChatDrawer() {
  const staffId = useTour((s) => (s.state.phase === "dialogue" || (s.state.phase === "panel" && s.state.panelReturn === "dialogue") ? s.state.staffId : null));
  const dispatch = useTour((s) => s.dispatch);
  const staff = staffId ? staffById.get(staffId) : null;
  const thread = useChat((c) => (staffId ? c.threads[staffId] : undefined));
  const push = useChat((c) => c.push);
  const setShare = useChat((c) => c.setShare);
  const brief = useBrief((b) => b.brief);
  const { config, services } = useCatalog();
  const { send, cancel, retry, busy } = useChatStream(staffId);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = useMemo(() => thread?.messages ?? [], [thread]);
  const serviceTitle = (s: string) => services.find((x) => x.slug === s)?.title ?? s;

  useEffect(() => {
    if (staffId) setTimeout(() => inputRef.current?.focus(), 350);
  }, [staffId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!staff || !staffId) return null;

  const lang = typeof navigator !== "undefined" && navigator.language?.startsWith("hi") ? "hinglish" : "en";
  const shareState = thread?.briefShare ?? "unasked";
  const showShareAsk = shareState === "unasked" && !briefIsEmpty(brief);
  const summary = briefSummary(brief, serviceTitle);

  const submit = (t: string) => {
    const v = t.trim();
    if (!v || busy) return;
    setText("");
    void send(v);
  };

  const followUps = messages.length
    ? ["What do you need from me?", "How does pricing work?", "What happens after I request a quote?"]
    : staff.exampleQuestions;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="chat-title"
      className="glass absolute z-40 right-0 bottom-0 top-auto sm:top-[72px] sm:right-4 sm:bottom-4 w-full sm:w-[420px] h-[min(78dvh,640px)] sm:h-auto rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl animate-in"
      onKeyDown={(e) => {
        if (e.key === "Escape") dispatch({ type: "END_TALK" });
      }}
    >
      <header className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/10">
        <div className="grid place-items-center w-11 h-11 rounded-full font-bold text-midnight" style={{ background: staff.appearance.top === "#F2F4F7" || staff.appearance.top === "#E9F7F2" ? "#A8F0D3" : "#29C6C0" }} aria-hidden>
          {staff.displayName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="font-bold leading-tight flex items-center gap-2">
            {staff.displayName} <span className="badge badge-ai">AI guide</span>
          </h2>
          <p className="text-xs text-white/65 truncate">{staff.roleTitle} · not a human</p>
        </div>
        <button type="button" className="hud-btn" onClick={() => dispatch({ type: "END_TALK" })} aria-label="Close chat (your conversation is kept)">
          <X size={20} />
        </button>
      </header>

      {config.aiMode === "demo" ? (
        <p className="mx-4 mt-3 text-xs rounded-lg badge-warn px-3 py-2 !font-medium !tracking-normal" role="note">
          Demo mode: no AI model is connected. Replies are assembled from approved Softgress content, not generated by an LLM.
        </p>
      ) : (
        <p className="mx-4 mt-3 text-[11px] text-white/50" role="note">
          AI-generated replies grounded in approved Softgress content. They may be imperfect; a human reviews every request.
        </p>
      )}

      <ol ref={listRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3" aria-live="polite" aria-relevant="additions text">
        <li className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-white/[0.07] border border-white/10 px-4 py-2.5 text-[15px] leading-relaxed">
            {staff.greeting[lang]}
          </div>
        </li>
        {showShareAsk && (
          <li className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm">
            <p className="font-semibold">Share your brief with {staff.displayName}?</p>
            <p className="mt-1 text-white/70">So you don&apos;t have to repeat yourself. This shares only:</p>
            <ul className="mt-1 list-disc pl-5 text-white/80">
              {summary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="btn-primary !min-h-9 !px-3 text-sm"
                onClick={() => {
                  setShare(staffId, "shared", brief);
                  push(staffId, { id: uid(), role: "assistant", content: `You shared your brief with ${staff.displayName}: ${summary.map((s) => s.split(":")[0]).join(", ")}.`, status: "done", note: true });
                }}
              >
                Share brief
              </button>
              <button type="button" className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => setShare(staffId, "declined")}>
                Not now
              </button>
            </div>
          </li>
        )}
        {messages.map((m) => (
          <Message key={m.id} m={m} staffId={staffId} onRetry={retry} />
        ))}
      </ol>

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin" aria-label="Suggested questions">
        {followUps.map((q) => (
          <button key={q} type="button" className="chip shrink-0" onClick={() => submit(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="px-4 pb-3 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message {staff.displayName}
        </label>
        <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-teal">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(text);
              }
            }}
            rows={1}
            placeholder="Ask in English, Hindi or Hinglish…"
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-white placeholder:text-white/45 focus:outline-none max-h-32"
          />
          {busy ? (
            <button type="button" className="hud-btn bg-white/10" onClick={cancel} aria-label="Stop reply">
              <Square size={16} />
            </button>
          ) : (
            <button type="submit" className="btn-primary !min-h-10 !px-3" disabled={!text.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
          )}
        </div>
        {busy && (
          <p className="mt-1 text-xs text-white/50 flex items-center gap-1" aria-live="polite">
            <Loader2 size={12} className="animate-spin" aria-hidden /> {staff.displayName} is replying…
          </p>
        )}
      </form>

      <nav className="grid grid-cols-2 gap-2 px-4 pb-4" aria-label="Next steps">
        <button type="button" className="btn-ghost !min-h-10 text-sm" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "brief" } })}>
          Discuss requirements
        </button>
        <button
          type="button"
          className="btn-primary !min-h-10 text-sm"
          onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: staff.cta.action } })}
        >
          {staff.cta.label}
        </button>
      </nav>
    </aside>
  );
}
