import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-data";
import { listServices } from "@/lib/db/repository";
import { can } from "@/lib/security/admin-auth";
import { ServiceForm } from "@/components/admin/AdminClient";

async function Services() {
  const { admin, db } = await requireAdmin();
  const services = await listServices(db, { includeInactive: true });
  const w = can(admin.role, "catalog:write");
  return (
    <>
      {!w && <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">Read-only: only owners can change the catalogue.</p>}
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.slug} className="rounded-xl bg-white border border-ink/10 p-4">
            <p className="text-xs text-ink/50 mb-2 uppercase tracking-wide">{s.departmentSlug} · /services/{s.slug}</p>
            <ServiceForm service={s} disabled={!w} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ServicesAdmin() {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Service catalogue</h1>
      <p className="mt-1 text-sm text-ink/60">AI guides and the website quote prices only when published here. “Custom quote” never shows an amount.</p>
      <div className="mt-6"><Suspense fallback={<p className="text-ink/60">Loading…</p>}><Services /></Suspense></div>
    </>
  );
}
