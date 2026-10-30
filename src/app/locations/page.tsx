import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { office } from "@/content/company";
import { locations } from "@/content/locations";
import { breadcrumbLd, graph, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Locations: Pune, Mumbai, Bangalore & Worldwide",
  description: "Softgress is based in Pimpri-Chinchwad, Pune and delivers software development and digital marketing for clients in Pune, Mumbai, Bangalore, across India and internationally.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumbLd([{ name: "Locations", path: "/locations" }]))} />
      <PageHero eyebrow="Where we work" title="Locations" accent="Based in Pune. Working across India and worldwide.">
        Our team works from {office.lines.slice(1).join(", ")}. We meet Pune clients in person and deliver remotely everywhere else.
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <ul className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <li key={l.slug}>
              <Link href={`/locations/${l.slug}`} className="group flex h-full flex-col rounded-[24px] border border-ink/10 bg-paper p-7 card-lift">
                <h2 className="font-display text-[26px] font-bold text-ink group-hover:text-teal-dark">{l.name}</h2>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-steel">{l.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-medium text-teal-dark">
                  View {l.name} <ArrowRight size={16} aria-hidden />
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
