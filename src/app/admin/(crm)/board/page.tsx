import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-data";
import { listLeads } from "@/lib/db/repository";
import { can } from "@/lib/security/admin-auth";
import { StageSelect } from "@/components/admin/AdminClient";
import { LEAD_STAGES } from "@/lib/types";

async function Board() {
  const { admin, db } = await requireAdmin();
  const leads = await listLeads(db);
  const writable = can(admin.role, "leads:write");
  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
      {LEAD_STAGES.map((stage) => {
        const col = leads.filter((l) => l.stage === stage);
        return (
          <section key={stage} aria-labelledby={`col-${stage}`} className="rounded-xl bg-white border border-ink/10 p-3 min-h-40">
            <h2 id={`col-${stage}`} className="text-sm font-bold text-ink capitalize flex justify-between">{stage}<span className="text-ink/40">{col.length}</span></h2>
            <ul className="mt-3 space-y-2">
              {col.map((l) => (
                <li key={l.id} className="rounded-lg border border-ink/10 p-3 text-sm">
                  <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink hover:text-teal-dark">{l.name}</Link>
                  <p className="text-xs text-ink/55">{l.service ?? l.kind} · {l.reference}</p>
                  <div className="mt-2"><StageSelect leadId={l.id} stage={l.stage} disabled={!writable} /></div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default function BoardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Pipeline</h1>
      <p className="mt-1 text-sm text-ink/60">Move leads with the stage menu (keyboard accessible). Every change is recorded with who made it and when.</p>
      <div className="mt-6"><Suspense fallback={<p className="text-ink/60">Loading…</p>}><Board /></Suspense></div>
    </>
  );
}
