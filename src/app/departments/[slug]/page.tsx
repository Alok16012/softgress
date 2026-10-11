import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";
import { priceLabel } from "@/lib/pricing";
import { staffByDepartment } from "@/content/staff";

export async function generateMetadata({ params }: PageProps<"/departments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { departments } = await loadCatalog();
  const d = departments.find((x) => x.slug === slug);
  return d ? { title: d.name, description: d.description, alternates: { canonical: `/departments/${d.slug}` } } : { title: "Department not found" };
}

async function Dept({ params }: { params: PageProps<"/departments/[slug]">["params"] }) {
  const { slug } = await params;
  const { departments, services } = await loadCatalog();
  const d = departments.find((x) => x.slug === slug);
  if (!d) notFound();
  const guide = staffByDepartment.get(d.slug);
  const list = services.filter((s) => s.departmentSlug === d.slug);
  return (
    <>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">{d.name}</h1>
      <p className="mt-4 text-lg text-ink/70 max-w-3xl">{d.description}</p>
      {guide && (
        <aside className="mt-8 rounded-2xl bg-midnight text-white p-6 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <p className="text-mint text-xs font-semibold tracking-widest">AI GUIDE</p>
            <p className="mt-1 text-lg font-bold">{guide.displayName}, {guide.roleTitle}</p>
            <p className="mt-1 text-sm text-white/70 max-w-xl">{guide.scope}</p>
            <p className="mt-2 text-xs text-white/50">An AI assistant, not a human employee. A real team member reviews every request.</p>
          </div>
          <Link href={`/?scene=${d.sceneId}`} className="inline-flex items-center rounded-xl bg-teal text-midnight px-5 py-3 font-bold">Visit &amp; chat in the virtual office</Link>
        </aside>
      )}
      {list.length > 0 && (
        <ul className="mt-10 grid sm:grid-cols-2 gap-4">
          {list.map((s) => (
            <li key={s.slug} className="rounded-2xl border border-ink/10 p-5">
              <h2 className="font-semibold text-ink"><Link href={`/services/${s.slug}`} className="hover:text-teal-dark">{s.title}</Link></h2>
              <p className="mt-1 text-sm text-ink/65">{s.summary}</p>
              <p className="mt-3 text-xs text-ink/50">{priceLabel(s)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function DepartmentPage({ params }: PageProps<"/departments/[slug]">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
            <Dept params={params} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
