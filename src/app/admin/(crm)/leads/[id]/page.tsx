import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-data";
import { getLeadDetail } from "@/lib/db/repository";
import { can } from "@/lib/security/admin-auth";
import { staffById } from "@/content/staff";
import { BUDGET_LABELS } from "@/lib/types";
import { BriefEditForm, ConsultationForm, NoteForm, StageSelect, SummaryButton, TaskDone, TaskForm } from "@/components/admin/AdminClient";

const card = "rounded-xl bg-white border border-ink/10 p-5";

async function Lead({ params }: { params: PageProps<"/admin/leads/[id]">["params"] }) {
  const { admin, db } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const lead = await getLeadDetail(db, id);
  if (!lead) notFound();
  const w = can(admin.role, "leads:write");
  const tasks = lead.events.filter((e) => e.type === "task");
  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <div className="space-y-6">
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{lead.name}</h1>
              <p className="text-sm text-ink/60">{lead.company ?? "No company given"} · prefers <strong>{lead.preferredChannel}</strong></p>
              <p className="mt-2 text-sm">{lead.email && <a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a>} {lead.phone && <span className="ml-3">{lead.phone}</span>}</p>
              {lead.possibleDuplicateOf && (
                <p className="mt-2 text-xs rounded bg-amber-100 text-amber-900 inline-block px-2 py-1">
                  Possible duplicate of <Link className="underline" href={`/admin/leads/${lead.possibleDuplicateOf}`}>an earlier lead</Link> (same contact). Not merged automatically.
                </p>
              )}
            </div>
            <StageSelect leadId={lead.id} stage={lead.stage} disabled={!w} />
          </div>
          <dl className="mt-4 grid sm:grid-cols-3 gap-3 text-xs text-ink/60">
            <div><dt>Received</dt><dd className="text-ink">{new Date(lead.createdAt).toLocaleString()}</dd></div>
            <div><dt>Contact consent</dt><dd className="text-ink">{lead.contactConsentAt ? new Date(lead.contactConsentAt).toLocaleString() : "-"}</dd></div>
            <div><dt>Marketing consent</dt><dd className="text-ink">{lead.marketingConsentAt ? new Date(lead.marketingConsentAt).toLocaleString() : "No"}</dd></div>
          </dl>
        </section>

        <section className={card} aria-labelledby="ai-sum">
          <div className="flex items-center justify-between gap-3">
            <h2 id="ai-sum" className="font-bold text-ink">AI summary <span className="ml-1 rounded bg-teal/15 px-1.5 py-0.5 text-[11px] font-semibold text-teal-dark">generated suggestion, verify</span></h2>
            <SummaryButton leadId={lead.id} disabled={!w} />
          </div>
          {lead.aiSummary ? (
            <div className="mt-3 text-sm text-ink/80 space-y-2">
              <p>{lead.aiSummary}</p>
              <p><strong>Suggested next action:</strong> {lead.aiNextAction}</p>
              <p className="text-xs text-ink/45">Generated {lead.aiSummaryAt && new Date(lead.aiSummaryAt).toLocaleString()}. Not a confirmed fact; check against the brief.</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink/55">No summary yet.</p>
          )}
        </section>

        {lead.requests.map((r) => (
          <section key={r.id} className={card} aria-labelledby={`req-${r.id}`}>
            <h2 id={`req-${r.id}`} className="font-bold text-ink capitalize">{r.kind} request · <span className="font-mono text-sm">{r.reference}</span></h2>
            <p className="text-sm text-ink/60">{r.service ?? "No specific service"} · department: {r.department ?? "-"} · status: {r.status}</p>
            <p className="mt-2 text-xs text-ink/50">Visitor brief (confirmed by the visitor on submit). Budget: {r.brief.budget ? BUDGET_LABELS[r.brief.budget] : "not stated"}</p>
            <div className="mt-4"><BriefEditForm requestId={r.id} brief={r.brief} disabled={!w} /></div>
          </section>
        ))}

        {lead.consultations.length > 0 && (
          <section className={card}>
            <h2 className="font-bold text-ink">Consultations</h2>
            <ul className="mt-3 space-y-4">
              {lead.consultations.map((c) => (
                <li key={c.id} className="text-sm">
                  <p>
                    <strong className={c.status === "confirmed" ? "text-teal-dark" : "text-amber-700"}>{c.status.replace("_", " ")}</strong>
                    {c.startAt && ` · ${new Date(c.startAt).toLocaleString()}`}
                    {c.preferredWindow && ` · visitor prefers ${c.preferredWindow.date} (${c.preferredWindow.timeOfDay})${c.preferredWindow.note ? `: "${c.preferredWindow.note}"` : ""}`}
                    <span className="text-ink/50"> · {c.provider}</span>
                  </p>
                  <div className="mt-2"><ConsultationForm id={c.id} status={c.status} startAt={c.startAt} timezone={c.timezone} disabled={!w} /></div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {lead.transcript.length > 0 && (
          <section className={card}>
            <h2 className="font-bold text-ink">Attached AI-guide conversation</h2>
            <p className="text-xs text-ink/50">The visitor chose to attach this transcript.</p>
            <ol className="mt-3 space-y-2 text-sm max-h-96 overflow-y-auto">
              {lead.transcript.map((t, i) => (
                <li key={i} className={t.role === "user" ? "text-ink" : "text-ink/70"}>
                  <strong>{t.role === "user" ? "Visitor" : `${staffById.get(t.staffId)?.displayName ?? t.staffId} (AI)`}:</strong> <span className="whitespace-pre-wrap">{t.content}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <section className={card}>
          <h2 className="font-bold text-ink">Tasks</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {tasks.length === 0 && <li className="text-ink/50">No tasks.</li>}
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-2">
                <span className={t.done ? "line-through text-ink/40" : ""}>
                  {String(t.metadata.title)}
                  {t.metadata.due ? <span className="block text-xs text-ink/50">due {String(t.metadata.due)}</span> : null}
                </span>
                {!t.done && <TaskDone leadId={lead.id} taskId={t.id} disabled={!w} />}
              </li>
            ))}
          </ul>
          <div className="mt-4"><TaskForm leadId={lead.id} disabled={!w} /></div>
        </section>
        <section className={card}>
          <NoteForm leadId={lead.id} disabled={!w} />
        </section>
        <section className={card}>
          <h2 className="font-bold text-ink">Activity</h2>
          <ol className="mt-3 space-y-3 text-sm">
            {lead.events.map((e) => (
              <li key={e.id} className="border-l-2 border-teal/40 pl-3">
                <p className="text-xs text-ink/50">{new Date(e.createdAt).toLocaleString()} · {e.actor ?? "system"}</p>
                <p className="text-ink">
                  {e.type === "status_changed" ? `Stage ${String(e.metadata.from)} → ${String(e.metadata.to)}`
                    : e.type === "note" ? String(e.metadata.text)
                    : e.type === "task" ? `Task: ${String(e.metadata.title)}`
                    : e.type === "created" ? `Submitted ${String(e.metadata.kind)} (${String(e.metadata.reference)})`
                    : e.type.replace(/_/g, " ")}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}

export default function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  return (
    <>
      <Link href="/admin" className="text-sm underline text-ink/70">← Inbox</Link>
      <div className="mt-4"><Suspense fallback={<p className="text-ink/60">Loading…</p>}><Lead params={params} /></Suspense></div>
    </>
  );
}
