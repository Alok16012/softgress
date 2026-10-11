"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addNoteAction,
  addTaskAction,
  approveKnowledgeAction,
  completeTaskAction,
  saveBriefAction,
  saveKnowledgeAction,
  setStageAction,
  summariseLeadAction,
  updateConsultationAction,
  updateServiceAction,
  type ActionResult,
} from "@/app/admin/actions";
import { BRIEF_BUDGETS, BUDGET_LABELS, DEPARTMENT_SLUGS, LEAD_STAGES, type ProjectBrief, type Service, type KnowledgeDocument } from "@/lib/types";

const input = "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const btn = "inline-flex items-center gap-2 rounded-lg bg-midnight px-3 py-2 text-sm font-semibold text-white hover:bg-midnight-3 disabled:opacity-50";
const btnGhost = "inline-flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink hover:border-teal disabled:opacity-50";

function useAction() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      try {
        setResult(await fn());
      } catch {
        setResult({ ok: false, error: "Session expired. Please sign in again." });
      }
    });
  const Msg = () =>
    result ? (
      <span role="status" className={`text-xs ${result.ok ? "text-teal-dark" : "text-red-600"}`}>
        {result.ok ? result.message ?? "Saved." : result.error}
      </span>
    ) : null;
  return { pending, run, Msg };
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-white/70 hover:text-white"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
        const j = await r.json().catch(() => null);
        setBusy(false);
        if (!r.ok) return setErr(j?.error?.message ?? "Sign-in failed.");
        router.push("/admin");
        router.refresh();
      }}
    >
      {!configured && <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">Admin access isn&apos;t configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH (see README).</p>}
      {err && <p role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">{err}</p>}
      <div>
        <label htmlFor="em" className="block text-sm font-semibold text-ink mb-1">Email</label>
        <input id="em" type="email" autoComplete="username" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="pw" className="block text-sm font-semibold text-ink mb-1">Password</label>
        <input id="pw" type="password" autoComplete="current-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button className={`${btn} w-full justify-center py-2.5`} disabled={busy || !configured}>
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden />} Sign in
      </button>
    </form>
  );
}

export function StageSelect({ leadId, stage, disabled }: { leadId: string; stage: string; disabled?: boolean }) {
  const { pending, run, Msg } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <label className="sr-only" htmlFor={`st-${leadId}`}>Stage</label>
      <select id={`st-${leadId}`} className={`${input} !w-auto !py-1`} defaultValue={stage} disabled={disabled || pending} onChange={(e) => run(() => setStageAction(leadId, e.target.value))}>
        {LEAD_STAGES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
      <Msg />
    </span>
  );
}

export function NoteForm({ leadId, disabled }: { leadId: string; disabled?: boolean }) {
  const [note, setNote] = useState("");
  const { pending, run, Msg } = useAction();
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const r = await addNoteAction(leadId, note);
          if (r.ok) setNote("");
          return r;
        });
      }}
    >
      <label htmlFor="note" className="block text-sm font-semibold text-ink">Add note</label>
      <textarea id="note" className={`${input} min-h-20`} value={note} onChange={(e) => setNote(e.target.value)} disabled={disabled} />
      <div className="flex items-center gap-3">
        <button className={btn} disabled={pending || disabled || !note.trim()}>Add note</button>
        <Msg />
      </div>
    </form>
  );
}

export function TaskForm({ leadId, disabled }: { leadId: string; disabled?: boolean }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const { pending, run, Msg } = useAction();
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const r = await addTaskAction(leadId, title, due);
          if (r.ok) {
            setTitle("");
            setDue("");
          }
          return r;
        });
      }}
    >
      <div className="flex-1 min-w-48">
        <label htmlFor="task" className="block text-sm font-semibold text-ink mb-1">Follow-up task</label>
        <input id="task" className={input} value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} placeholder="e.g. Call to clarify integrations" />
      </div>
      <div>
        <label htmlFor="due" className="block text-sm font-semibold text-ink mb-1">Due</label>
        <input id="due" type="date" className={input} value={due} onChange={(e) => setDue(e.target.value)} disabled={disabled} />
      </div>
      <button className={btn} disabled={pending || disabled || !title.trim()}>Add task</button>
      <Msg />
    </form>
  );
}

export function TaskDone({ leadId, taskId, disabled }: { leadId: string; taskId: string; disabled?: boolean }) {
  const { pending, run } = useAction();
  return (
    <button type="button" className="text-xs font-semibold text-teal-dark underline disabled:opacity-50" disabled={pending || disabled} onClick={() => run(() => completeTaskAction(leadId, taskId))}>
      Mark done
    </button>
  );
}

export function SummaryButton({ leadId, disabled }: { leadId: string; disabled?: boolean }) {
  const { pending, run, Msg } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className={btnGhost} disabled={pending || disabled} onClick={() => run(() => summariseLeadAction(leadId))}>
        {pending && <Loader2 size={14} className="animate-spin" aria-hidden />} Generate AI summary
      </button>
      <Msg />
    </span>
  );
}

export function BriefEditForm({ requestId, brief, disabled }: { requestId: string; brief: ProjectBrief; disabled?: boolean }) {
  const [b, setB] = useState<ProjectBrief>({ ...brief, features: brief.features ?? [], platforms: brief.platforms ?? [], serviceSlugs: brief.serviceSlugs ?? [] });
  const { pending, run, Msg } = useAction();
  const f = (k: keyof ProjectBrief) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setB({ ...b, [k]: e.target.value });
  return (
    <form
      className="grid sm:grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveBriefAction(requestId, b));
      }}
    >
      <label className="text-sm">Project type<input className={input} value={b.projectType} onChange={f("projectType")} disabled={disabled} /></label>
      <label className="text-sm">Industry<input className={input} value={b.industry} onChange={f("industry")} disabled={disabled} /></label>
      <label className="text-sm sm:col-span-2">Goals<textarea className={input} value={b.goals} onChange={f("goals")} disabled={disabled} /></label>
      <label className="text-sm sm:col-span-2">Scope<textarea className={`${input} min-h-20`} value={b.scope} onChange={f("scope")} disabled={disabled} /></label>
      <label className="text-sm">Features (comma separated)<input className={input} value={b.features.join(", ")} onChange={(e) => setB({ ...b, features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} disabled={disabled} /></label>
      <label className="text-sm">Platforms (comma separated)<input className={input} value={b.platforms.join(", ")} onChange={(e) => setB({ ...b, platforms: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} disabled={disabled} /></label>
      <label className="text-sm">Budget
        <select className={input} value={b.budget} onChange={f("budget")} disabled={disabled}>
          <option value="">Not stated</option>
          {BRIEF_BUDGETS.map((x) => <option key={x} value={x}>{BUDGET_LABELS[x]}</option>)}
        </select>
      </label>
      <label className="text-sm">Target timing<input className={input} value={b.targetDate} onChange={f("targetDate")} disabled={disabled} /></label>
      <label className="text-sm sm:col-span-2">Notes<textarea className={input} value={b.notes} onChange={f("notes")} disabled={disabled} /></label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button className={btn} disabled={pending || disabled}>Save brief</button>
        <Msg />
      </div>
    </form>
  );
}

export function ConsultationForm({ id, status, startAt, timezone, disabled }: { id: string; status: string; startAt: string | null; timezone: string; disabled?: boolean }) {
  const [s, setS] = useState(status);
  const [local, setLocal] = useState(startAt ? new Date(startAt).toISOString().slice(0, 16) : "");
  const [dur, setDur] = useState(30);
  const { pending, run, Msg } = useAction();
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateConsultationAction(id, s, local ? new Date(local).toISOString() : "", dur));
      }}
    >
      <label className="text-sm">Status
        <select className={input} value={s} onChange={(e) => setS(e.target.value)} disabled={disabled}>
          {["pending_confirmation", "confirmed", "cancelled", "completed"].map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      <label className="text-sm">Start (your local time)<input type="datetime-local" className={input} value={local} onChange={(e) => setLocal(e.target.value)} disabled={disabled} /></label>
      <label className="text-sm">Minutes<input type="number" min={15} max={240} step={15} className={`${input} !w-24`} value={dur} onChange={(e) => setDur(Number(e.target.value))} disabled={disabled} /></label>
      <button className={btn} disabled={pending || disabled}>Update</button>
      <span className="text-xs text-ink/50">Visitor TZ: {timezone}. Confirm only after agreeing the time with the visitor.</span>
      <Msg />
    </form>
  );
}

export function ServiceForm({ service, disabled }: { service: Service; disabled?: boolean }) {
  const [v, setV] = useState({
    title: service.title,
    summary: service.summary,
    description: service.description,
    pricingType: service.pricingType,
    startingPrice: service.startingPrice == null ? "" : String(service.startingPrice),
    currency: service.currency,
    active: service.active,
  });
  const { pending, run, Msg } = useAction();
  return (
    <form
      className="grid md:grid-cols-6 gap-2 items-end"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateServiceAction(service.slug, { ...v, startingPrice: v.pricingType === "custom" ? "" : v.startingPrice }));
      }}
    >
      <label className="text-xs md:col-span-2">Title<input className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} disabled={disabled} /></label>
      <label className="text-xs">Pricing
        <select className={input} value={v.pricingType} onChange={(e) => setV({ ...v, pricingType: e.target.value as Service["pricingType"] })} disabled={disabled}>
          <option value="custom">Custom quote</option>
          <option value="starting_at">Starting at</option>
          <option value="fixed">Fixed</option>
        </select>
      </label>
      <label className="text-xs">Amount<input className={input} inputMode="decimal" value={v.startingPrice} onChange={(e) => setV({ ...v, startingPrice: e.target.value })} disabled={disabled || v.pricingType === "custom"} placeholder={v.pricingType === "custom" ? "—" : "e.g. 50000"} /></label>
      <label className="text-xs">Currency<input className={input} value={v.currency} maxLength={3} onChange={(e) => setV({ ...v, currency: e.target.value.toUpperCase() })} disabled={disabled} /></label>
      <label className="text-xs flex items-center gap-2 pb-2"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} disabled={disabled} /> Active</label>
      <label className="text-xs md:col-span-6">Summary<input className={input} value={v.summary} onChange={(e) => setV({ ...v, summary: e.target.value })} disabled={disabled} /></label>
      <div className="md:col-span-6 flex items-center gap-3">
        <button className={btn} disabled={pending || disabled}>Save</button>
        <Msg />
      </div>
    </form>
  );
}

export function KnowledgeForm({ doc, disabled }: { doc?: KnowledgeDocument; disabled?: boolean }) {
  const [v, setV] = useState({ title: doc?.title ?? "", body: doc?.body ?? "", departmentSlug: doc?.departmentSlug ?? "", visibility: doc?.visibility ?? "public" });
  const { pending, run, Msg } = useAction();
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const r = await saveKnowledgeAction({ ...v, id: doc?.id });
          if (r.ok && !doc) setV({ title: "", body: "", departmentSlug: "", visibility: "public" });
          return r;
        });
      }}
    >
      <div className="grid sm:grid-cols-3 gap-2">
        <label className="text-xs sm:col-span-1">Title<input className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} disabled={disabled} /></label>
        <label className="text-xs">Department
          <select className={input} value={v.departmentSlug} onChange={(e) => setV({ ...v, departmentSlug: e.target.value })} disabled={disabled}>
            <option value="">Shared (all guides)</option>
            {DEPARTMENT_SLUGS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="text-xs">Visibility
          <select className={input} value={v.visibility} onChange={(e) => setV({ ...v, visibility: e.target.value as "public" | "internal" })} disabled={disabled}>
            <option value="public">Public (guides may use)</option>
            <option value="internal">Internal (never used by guides)</option>
          </select>
        </label>
      </div>
      <label className="text-xs block">Body<textarea className={`${input} min-h-28 font-mono text-xs`} value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} disabled={disabled} /></label>
      <div className="flex items-center gap-3">
        <button className={btn} disabled={pending || disabled}>{doc ? "Save changes (requires re-approval)" : "Create draft"}</button>
        <Msg />
      </div>
    </form>
  );
}

export function ApproveButton({ id, approved, disabled }: { id: string; approved: boolean; disabled?: boolean }) {
  const { pending, run, Msg } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className={approved ? btnGhost : btn} disabled={pending || disabled} onClick={() => run(() => approveKnowledgeAction(id, !approved))}>
        {approved ? "Withdraw approval" : "Approve for AI guides"}
      </button>
      <Msg />
    </span>
  );
}
