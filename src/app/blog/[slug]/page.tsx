import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { FaqSection } from "@/components/site/FaqSection";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { articleBySlug, articles } from "@/content/blog";
import { ORG_ID, absUrl, breadcrumbLd, faqLd, graph, pageMeta } from "@/lib/seo";

// Built from bundled content, so every article is prerendered with its metadata in <head>.
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return { title: "Article not found" };
  const meta = pageMeta({ title: a.title, description: a.description, path: `/blog/${a.slug}`, absoluteTitle: true });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: a.date } };
}

const day = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const path = `/blog/${a.slug}`;
  const ld = graph(
    {
      "@type": "BlogPosting",
      "@id": `${absUrl(path)}#article`,
      headline: a.title,
      description: a.description,
      datePublished: a.date,
      dateModified: a.date,
      url: absUrl(path),
      mainEntityOfPage: absUrl(path),
      inLanguage: "en-IN",
      image: absUrl("/opengraph-image"),
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
    },
    breadcrumbLd([
      { name: "Insights", path: "/blog" },
      { name: a.title, path },
    ]),
    faqLd(a.faqs),
  );
  const others = articles.filter((x) => x.slug !== a.slug);
  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        artworkSlug="strategy"
        title={a.title}
        crumbs={
          <nav aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-white">Insights</Link> › Guide
          </nav>
        }
      >
        <span className="text-base text-white/70">By the Softgress team · {day(a.date)}</span>
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-[17px] leading-relaxed text-steel">
          <p className="text-lg text-ink">{a.intro}</p>
          {a.sections.map((s) => (
            <section key={s.h} className="mt-10">
              <h2 className="font-display text-[24px] sm:text-[28px] font-bold leading-tight text-ink">{s.h}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <Check size={18} className="mt-1 flex-none text-teal-dark" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <aside className="sky mt-14 rounded-[28px] p-7 sm:p-8 text-white">
            <p className="font-display text-[22px] font-bold">Need help with this in Pune or PCMC?</p>
            <p className="mt-2 text-white/80">Softgress plans, builds and grows websites and campaigns from our office in Akurdi, Pimpri-Chinchwad.</p>
            <ul className="mt-5 flex flex-wrap gap-3">
              {a.services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="pill pill-line text-white">{s.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/contact?kind=consultation" className="pill">Free consultation <ArrowRight size={16} aria-hidden /></Link>
              </li>
            </ul>
          </aside>
        </article>
        <FaqSection title="Frequently asked questions" faqs={a.faqs} tone="paper" />
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <p className="eyebrow text-teal-dark">More guides</p>
          <ul className="mt-4 space-y-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/blog/${o.slug}`} className="font-display text-[19px] font-bold text-ink hover:text-teal-dark">{o.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
