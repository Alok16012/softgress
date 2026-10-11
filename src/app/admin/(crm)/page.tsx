import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-data";
import { leadStats, listLeads, listServices, listDepartments } from "@/lib/db/repository";
import { can } from "@/lib/security/admin-auth";
import { StageSelect } from "@/components/admin/AdminClient";
import { DEPARTMENT_SLUGS, LEAD_STAGES, type DepartmentSlug, type LeadStage } from "@/lib/types";

async function Inbox({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const { admin, db } = await requireAdmin();
  const sp = await searchParams;
  const stage = typeof sp.stage === "string" && (LEAD_STAGES as readonly string[]).includes(sp.stage) ? (sp.stage as LeadStage) : undefined;
  const department = typeof sp.department === "string" && (DEPARTMENT_SLUGS as readonly string[]).includes(sp.department) ? (sp.department as DepartmentSlug) : undefined;
  const service = typeof sp.service === "string" && /^[a-z0-9-]{2,60}$/.test(sp.service) ? sp.service : undefined;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : undefined;
  const [leads, stats, services, departments] = await Promise.all([listLeads(db, { stage, department, service, q }), leadStats(db), listServices(db, { includeInactive: true }), listDepartments(db)]);
  const writable = can(admin.role, "leads:write");
  return (
    <>
      <section aria-label="Overview" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-xl bg-white border border-ink/10 p-4">
          <p className="text-xs text-ink/50">Last 7 days</p>
          <p className="text-2xl font-bold text-ink">{stats.last7Days}</p>
        </div>
        {LEAD_STAGES.map((s) => (
          <Link key={s} href={`/admin?stage=${s}`} className="rounded-xl bg-white border border-ink/10 p-4 hover:border-teal">
            <p className="text-xs text-ink/50 capitalize">{s}</p>
            <p className="text-2xl font-bold text-ink">{stats.byStage[s] ?? 0}</p>
          </Link>
        ))}
      </section>

      <form className="mt-6 flex flex-wrap items-end gap-3" role="search">
        <label className="text-sm">Search<input name="q" defaultValue={q} placeholder="Name, email or reference" className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm" /></label>
        <label className="text-sm">Stage
          <select name="stage" defaultValue={stage ?? ""} className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
            <option value="">All</option>
            {LEAD_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-sm">Department
          <select name="department" defaultValue={department ?? ""} className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
            <option value="">All</option>
            {departments.map((d) => <option key={d.slug} value={d.slug}>{d.shortName}</option>)}
          </select>
        </label>
        <label className="text-sm">Service
          <select name="service" defaultValue={service ?? ""} className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
            <option value="">All</option>
            {services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-midnight px-4 py-2 text-sm font-semibold text-white">Filter</button>
        <Link href="/admin" className="text-sm underline text-ink/70">Clear</Link>
        {can(admin.role, "leads:export") && (
          <a href="/api/admin/export" className="ml-auto rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-teal">Export CSV</a>
        )}
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <caption className="sr-only">Leads</caption>
          <thead className="bg-paper text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Request</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Consultation</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/50">No leads match.</td></tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-ink/5 hover:bg-paper/60">
                <td className="px-4 py-3 whitespace-nowrap text-ink/60">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink hover:text-teal-dark">{l.name}</Link>
                  <div className="text-xs text-ink/55">{l.email ?? l.phone}</div>
                  {l.possibleDuplicate && <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 text-[11px] text-amber-900">possible duplicate</span>}
                </td>
                <td className="px-4 py-3"><span className="capitalize">{l.kind}</span>{l.service ? `: ${l.service}` : ""}<div className="text-xs font-mono text-ink/50">{l.reference}</div></td>
                <td className="px-4 py-3 capitalize">{l.department ?? "-"}</td>
                <td className="px-4 py-3">{l.consultationStatus ? <span className={l.consultationStatus === "confirmed" ? "text-teal-dark font-semibold" : "text-amber-700"}>{l.consultationStatus.replace("_", " ")}</span> : "-"}</td>
                <td className="px-4 py-3"><StageSelect leadId={l.id} stage={l.stage} disabled={!writable} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminHome({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <h1 className="text-2xl font-bold text-ink">Lead inbox</h1>
      <div className="mt-6">
        <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
          <Inbox searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
