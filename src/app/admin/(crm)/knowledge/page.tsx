import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-data";
import { listKnowledge } from "@/lib/db/repository";
import { can } from "@/lib/security/admin-auth";
import { ApproveButton, KnowledgeForm } from "@/components/admin/AdminClient";

async function Knowledge() {
  const { admin, db } = await requireAdmin();
  const docs = await listKnowledge(db);
  const w = can(admin.role, "knowledge:write");
  const approve = can(admin.role, "knowledge:approve");
  return (
    <>
      <section className="rounded-xl bg-white border border-ink/10 p-5">
        <h2 className="font-bold text-ink">New document</h2>
        <div className="mt-3"><KnowledgeForm disabled={!w} /></div>
      </section>
      <ul className="mt-6 space-y-4">
        {docs.map((d) => (
          <li key={d.id} className="rounded-xl bg-white border border-ink/10 p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-xs text-ink/50">{d.id} · v{d.version}</span>
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${d.approvedAt ? "bg-teal/15 text-teal-dark" : "bg-amber-100 text-amber-900"}`}>{d.approvedAt ? "approved: used by AI guides" : "draft: not used"}</span>
              {d.isSeed && <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[11px] font-semibold text-ink/70">demo seed: review before production</span>}
              {d.visibility === "internal" && <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[11px]">internal</span>}
              <span className="ml-auto"><ApproveButton id={d.id} approved={Boolean(d.approvedAt)} disabled={!approve} /></span>
            </div>
            <KnowledgeForm doc={d} disabled={!w} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function KnowledgeAdmin() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Knowledge base</h1>
      <p className="mt-1 text-sm text-ink/60">AI guides answer only from <strong>approved, public</strong> documents plus the service catalogue. Any edit returns a document to draft until an owner re-approves it.</p>
      <div className="mt-6"><Suspense fallback={<p className="text-ink/60">Loading…</p>}><Knowledge /></Suspense></div>
    </>
  );
}
