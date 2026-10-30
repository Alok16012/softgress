import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Check } from "lucide-react";
import { FaqSection } from "@/components/site/FaqSection";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { departments } from "@/content/departments";
import { locations } from "@/content/locations";
import { serviceDescription, serviceFaqs, serviceSearchName, serviceTitle } from "@/content/seo";
import { services as seedServices } from "@/content/services";
import { loadCatalog } from "@/lib/data";
import { priceLabel } from "@/lib/pricing";
import { AREA_SERVED, ORG_ID, absUrl, breadcrumbLd, faqLd, graph, pageMeta } from "@/lib/seo";

// Hero, metadata and structured data come from the bundled catalogue so they are
// prerendered in the initial HTML; the live catalogue (pricing, admin edits) streams in below.
export function generateStaticParams() {
  return seedServices.map((s) => ({ slug: s.slug }));
}

const seedService = (slug: string) => seedServices.find((x) => x.slug === slug);

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const s = seedService((await params).slug);
  if (!s) return { title: "Service not found" };
  return pageMeta({ title: serviceTitle(s), description: serviceDescription(s), path: `/services/${s.slug}` });
}

async function Detail({ slug }: { slug: string }) {
  const { services } = await loadCatalog();
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-[20px] border border-ink/10 p-8">
          <h2 className="font-display text-2xl font-bold text-ink">Typical deliverables</h2>
          <ul className="mt-5 space-y-3 text-steel">
            {s.deliverables.map((x) => (
              <li key={x} className="flex gap-3"><Check size={18} className="mt-0.5 flex-none text-teal-dark" aria-hidden />{x}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-[20px] border border-ink/10 p-8">
          <h2 className="font-display text-2xl font-bold text-ink">What we&apos;ll need from you</h2>
          <ul className="mt-5 space-y-3 text-steel">
            {s.whatWeNeed.map((x) => (
              <li key={x} className="flex gap-3"><Check size={18} className="mt-0.5 flex-none text-teal-dark" aria-hidden />{x}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-16">
        <h2 className="font-display text-[28px] sm:text-[36px] font-bold text-ink">How it works</h2>
        <ol className="mt-8 grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {s.process.map((p, i) => (
            <li key={p} className="rounded-[20px] bg-paper p-6">
              <span className="font-display text-[30px] font-bold text-teal-dark">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-medium text-ink">{p}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="sky mt-16 rounded-[32px] p-8 sm:p-10 text-white flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="eyebrow text-teal">Pricing</p>
          <p className="mt-2 font-display text-2xl font-bold">{priceLabel(s)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/contact?service=${s.slug}`} className="pill">Request a quote <ArrowRight size={16} aria-hidden /></Link>
          <Link href={`/contact?kind=consultation&service=${s.slug}`} className="pill pill-line text-white">
            Book a consultation
          </Link>
        </div>
      </div>
    </>
  );
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = seedService(slug);
  if (!s) notFound();
  const d = departments.find((x) => x.slug === s.departmentSlug);
  const path = `/services/${s.slug}`;
  const faqs = serviceFaqs(s);
  const ld = graph(
    {
      "@type": "Service",
      "@id": `${absUrl(path)}#service`,
      name: serviceSearchName(s),
      alternateName: s.title,
      description: s.description,
      serviceType: s.title,
      category: d?.name,
      url: absUrl(path),
      provider: { "@id": ORG_ID },
      areaServed: AREA_SERVED,
    },
    breadcrumbLd([
      { name: "Services", path: "/services" },
      ...(d ? [{ name: d.name, path: `/departments/${d.slug}` }] : []),
      { name: s.title, path },
    ]),
    faqLd(faqs),
  );
  return (
    <>
      <article className="flex-1 flex flex-col">
        <JsonLd data={ld} />
        <PageHero
          artworkSlug={s.departmentSlug}
          title={s.title}
          accent={s.summary}
          crumbs={
            <nav aria-label="Breadcrumb">
              <Link href="/services" className="hover:text-white">Services</Link> ›{" "}
              <Link href={`/departments/${s.departmentSlug}`} className="hover:text-white">{d?.shortName}</Link>
            </nav>
          }
        >
          {s.description}
        </PageHero>
        <main id="main" className="flex-1 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
            <Suspense fallback={<p className="text-steel">Loading service details…</p>}>
              <Detail slug={slug} />
            </Suspense>
          </div>
          <FaqSection title={`${serviceSearchName(s)}: frequently asked questions`} faqs={faqs} tone="paper" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <p className="eyebrow text-teal-dark">{serviceSearchName(s)} near you</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {locations.map((l) => (
                <li key={l.slug}>
                  <Link href={`/locations/${l.slug}`} className="pill pill-line text-ink">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </article>
      <SiteFooter cta={false} />
    </>
  );
}
