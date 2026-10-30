import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin, Phone } from "lucide-react";
import { FaqSection } from "@/components/site/FaqSection";
import { JsonLd } from "@/components/site/JsonLd";
import { ServiceList } from "@/components/site/ServiceList";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { office } from "@/content/company";
import { locationBySlug, locations } from "@/content/locations";
import { services } from "@/content/services";
import { ORG_ID, absUrl, breadcrumbLd, faqLd, graph, pageMeta } from "@/lib/seo";

// Built from bundled content, so every location page is prerendered with its metadata in <head>.
export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/[slug]">): Promise<Metadata> {
  const l = locationBySlug((await params).slug);
  if (!l) return { title: "Location not found" };
  return pageMeta({ title: l.title, description: l.description, path: `/locations/${l.slug}` });
}

export default async function LocationPage({ params }: PageProps<"/locations/[slug]">) {
  const l = locationBySlug((await params).slug);
  if (!l) notFound();
  const featured = l.featured.map((slug) => services.find((s) => s.slug === slug)).filter((s) => s !== undefined);
  const path = `/locations/${l.slug}`;
  const ld = graph(
    {
      "@type": "WebPage",
      "@id": `${absUrl(path)}#webpage`,
      url: absUrl(path),
      name: l.title,
      description: l.description,
      about: { "@id": ORG_ID },
      inLanguage: "en-IN",
    },
    {
      "@type": "Service",
      name: `Software development & digital marketing in ${l.name}`,
      serviceType: ["Software development", "Digital marketing", "Creative production", "AI automation"],
      provider: { "@id": ORG_ID },
      areaServed: l.area,
      url: absUrl(path),
    },
    breadcrumbLd([
      { name: "Locations", path: "/locations" },
      { name: l.name, path },
    ]),
    faqLd(l.faqs),
  );
  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        artworkSlug="marketing"
        title={l.h1}
        accent={l.accent}
        crumbs={
          <nav aria-label="Breadcrumb">
            <Link href="/locations" className="hover:text-white">Locations</Link> › {l.name}
          </nav>
        }
      >
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href="/contact" className="pill">Get a free quote <ArrowRight size={16} aria-hidden /></Link>
          <a href={`tel:${office.phone.tel}`} className="pill pill-line text-white"><Phone size={16} aria-hidden /> {office.phone.display}</a>
        </div>
      </PageHero>
      <main id="main" className="flex-1">
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-5 text-lg leading-relaxed text-steel">
              {l.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="flex items-start gap-3 text-[15px] text-ink/70">
                <MapPin size={18} aria-hidden className="mt-1 flex-none text-teal-dark" />
                <span>Office: {office.lines.join(", ")}</span>
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {l.points.map((p) => (
                <li key={p.title} className="rounded-[20px] border border-ink/10 bg-paper p-6">
                  <h2 className="font-display text-[19px] font-bold leading-snug text-ink">{p.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-steel">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="loc-services" className="bg-paper">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
            <h2 id="loc-services" className="font-display text-[32px] sm:text-[44px] leading-tight font-bold tracking-tight text-ink">
              Services for {l.name === "International" ? "international" : l.name} clients
            </h2>
            <div className="mt-10">
              <ServiceList services={featured} cols={3} />
            </div>
            <Link href="/services" className="pill pill-line mt-8 text-ink">All services <ArrowRight size={16} aria-hidden /></Link>
          </div>
        </section>

        <section aria-labelledby="loc-industries" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
            <h2 id="loc-industries" className="font-display text-[28px] sm:text-[36px] leading-tight font-bold tracking-tight text-ink">
              Industries we work with
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {l.industries.map((x) => (
                <li key={x} className="flex gap-3 text-[17px] text-steel">
                  <Check size={18} className="mt-1 flex-none text-teal-dark" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FaqSection title={`FAQs: Softgress in ${l.name === "International" ? "your country" : l.name}`} faqs={l.faqs} tone="paper" />

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20 pt-4">
            <p className="eyebrow text-teal-dark">Other locations</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {locations
                .filter((x) => x.slug !== l.slug)
                .map((x) => (
                  <li key={x.slug}>
                    <Link href={`/locations/${x.slug}`} className="pill pill-line text-ink">{x.name}</Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
