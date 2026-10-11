import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";
import { priceLabel } from "@/lib/pricing";
import { staffByDepartment } from "@/content/staff";

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { services } = await loadCatalog();
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Service not found" };
  return { title: s.title, description: s.summary, alternates: { canonical: `/services/${s.slug}` } };
}

async function Detail({ params }: { params: PageProps<"/services/[slug]">["params"] }) {
  const { slug } = await params;
  const { services, departments } = await loadCatalog();
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const d = departments.find((x) => x.slug === s.departmentSlug);
  const guide = staffByDepartment.get(s.departmentSlug);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.description,
    provider: { "@type": "Organization", name: "Softgress" },
  };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
        <Link href="/services" className="hover:underline">Services</Link> ›{" "}
        <Link href={`/departments/${s.departmentSlug}`} className="hover:underline">{d?.shortName}</Link>
      </nav>
      <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">{s.title}</h1>
      <p className="mt-4 text-xl text-ink/75 max-w-3xl">{s.summary}</p>
      <p className="mt-4 text-ink/70 max-w-3xl">{s.description}</p>
      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-bold text-ink">Typical deliverables</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-ink/80">{s.deliverables.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink">What we&apos;ll need from you</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-ink/80">{s.whatWeNeed.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      </div>
      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">How it works</h2>
        <ol className="mt-3 flex flex-wrap gap-2">
          {s.process.map((p, i) => (
            <li key={p} className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink/80"><span className="font-bold text-teal-dark">{i + 1}</span> {p}</li>
          ))}
        </ol>
      </section>
      <div className="mt-10 rounded-2xl bg-paper border border-ink/10 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink/60">Pricing</p>
          <p className="text-lg font-bold text-ink">{priceLabel(s)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/contact?service=${s.slug}`} className="inline-flex items-center rounded-xl bg-midnight text-white px-5 py-3 font-semibold hover:bg-midnight-3">Request a quote</Link>
          {guide && (
            <Link href={`/?scene=${d?.sceneId ?? "reception"}`} className="inline-flex items-center rounded-xl border border-ink/15 px-5 py-3 font-semibold text-ink hover:border-teal">
              Ask {guide.displayName} (AI guide)
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <Suspense fallback={<p className="text-ink/60">Loading…</p>}>
            <Detail params={params} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
