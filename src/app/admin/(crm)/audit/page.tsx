import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-data";
import { listAudit } from "@/lib/db/repository";
import { can } from "@/lib/security/admin-auth";

async function Audit() {
  const { admin, db } = await requireAdmin();
  if (!can(admin.role, "audit:read")) return <p className="text-ink/60">Your role can&apos;t view the audit log.</p>;
  const rows = await listAudit(db, 200);
  return (
    <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
      <table className="w-full text-sm">
        <caption className="sr-only">Audit log</caption>
        <thead className="bg-paper text-left text-ink/60"><tr><th className="px-4 py-2">When</th><th className="px-4 py-2">Who</th><th className="px-4 py-2">Action</th><th className="px-4 py-2">Entity</th><th className="px-4 py-2">Details</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-ink/5">
              <td className="px-4 py-2 whitespace-nowrap text-ink/60">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-4 py-2">{r.email ?? "system"}</td>
              <td className="px-4 py-2 font-mono text-xs">{r.action}</td>
              <td className="px-4 py-2 font-mono text-xs">{r.entity_type}:{r.entity_id.slice(0, 12)}</td>
              <td className="px-4 py-2 font-mono text-[11px] text-ink/60 max-w-md truncate">{JSON.stringify(r.diff)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AuditPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Audit log</h1>
      <div className="mt-6"><Suspense fallback={<p className="text-ink/60">Loading…</p>}><Audit /></Suspense></div>
    </>
  );
}
