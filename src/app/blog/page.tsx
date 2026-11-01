import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { articles } from "@/content/blog";
import { ORG_ID, absUrl, breadcrumbLd, graph, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Insights: Websites, SEO & Digital Marketing in Pune",
  description: "Practical guides for Pune and Pimpri-Chinchwad businesses on websites, SEO, Google Business Profile, ads and digital marketing, from the Softgress team.",
  path: "/blog",
});

const day = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function BlogPage() {
  const ld = graph(
    {
      "@type": "Blog",
      "@id": `${absUrl("/blog")}#blog`,
      url: absUrl("/blog"),
      name: "Softgress Insights",
      publisher: { "@id": ORG_ID },
      blogPost: articles.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: absUrl(`/blog/${a.slug}`), datePublished: a.date })),
    },
    breadcrumbLd([{ name: "Insights", path: "/blog" }]),
  );
  return (
    <>
      <JsonLd data={ld} />
      <PageHero eyebrow="Insights" title="Guides for growing your business online" accent="Websites, SEO and marketing, explained for Pune businesses." artworkSlug="marketing" />
      <main id="main" className="flex-1 bg-white">
        <ul className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={`/blog/${a.slug}`} className="group flex h-full flex-col rounded-[24px] border border-ink/10 bg-paper p-7 card-lift">
                <p className="text-sm text-steel">{day(a.date)}</p>
                <h2 className="mt-2 font-display text-[22px] font-bold leading-snug text-ink group-hover:text-teal-dark">{a.title}</h2>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-steel">{a.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-medium text-teal-dark">
                  Read the guide <ArrowRight size={16} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
