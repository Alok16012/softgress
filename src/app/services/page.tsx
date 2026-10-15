import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeptArt } from "@/components/site/Art";
import { ServiceList } from "@/components/site/ServiceList";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Software development, digital marketing, creative production, AI automation and project strategy services from Softgress.",
  alternates: { canonical: "/services" },
};

async function Catalogue() {
  const { departments, services } = await loadCatalog();
  return (
    <div className="space-y-20">
      {departments
        .filter((d) => d.slug !== "reception")
        .map((d) => (
          <section key={d.slug} aria-labelledby={`h-${d.slug}`}>
            <div className="grid gap-8 md:grid-cols-[280px_1fr] items-center">
              <DeptArt slug={d.slug} uid={d.slug} className="aspect-[16/10]" />
              <div>
                <h2 id={`h-${d.slug}`} className="font-display text-[28px] sm:text-[36px] leading-tight font-bold tracking-tight text-ink">
                  <Link href={`/departments/${d.slug}`} className="hover:text-teal-dark">
                    {d.name}
                  </Link>
                </h2>
                <p className="mt-3 text-steel text-lg max-w-3xl">{d.description}</p>
              </div>
            </div>
            <div className="mt-8">
              <ServiceList services={services.filter((s) => s.departmentSlug === d.slug)} cols={3} />
            </div>
          </section>
        ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="What we do" title="Services" accent="Ideas engineered. Growth accelerated.">
        Every project is scoped to your goals. Prices are shown only where published; otherwise a custom quote is required.
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div>
            <Suspense fallback={<p className="text-steel">Loading services…</p>}>
              <Catalogue />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
