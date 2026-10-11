import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";
import { priceLabel } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Services",
  description: "Software development, digital marketing, creative production, AI automation and project strategy services from Softgress.",
  alternates: { canonical: "/services" },
};

async function Catalogue() {
  const { departments, services } = await loadCatalog();
  return (
    <div className="space-y-14">
      {departments
        .filter((d) => d.slug !== "reception")
        .map((d) => (
          <section key={d.slug} aria-labelledby={`h-${d.slug}`}>
            <h2 id={`h-${d.slug}`} className="text-2xl font-bold text-ink">
              <Link href={`/departments/${d.slug}`} className="hover:text-teal-dark">
                {d.name}
              </Link>
            </h2>
            <p className="mt-2 text-ink/65 max-w-3xl">{d.description}</p>
            <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services
                .filter((s) => s.departmentSlug === d.slug)
                .map((s) => (
                  <li key={s.slug} className="rounded-2xl border border-ink/10 p-5 hover:border-teal transition">
                    <h3 className="font-semibold text-ink">
                      <Link href={`/services/${s.slug}`} className="hover:text-teal-dark">
                        {s.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-ink/65">{s.summary}</p>
                    <p className="mt-3 text-xs font-medium text-ink/50">{priceLabel(s)}</p>
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">Services</h1>
          <p className="mt-3 text-lg text-ink/65 max-w-2xl">Every project is scoped to your goals. Prices are shown only where published; otherwise a custom quote is required.</p>
          <div className="mt-12">
            <Suspense fallback={<p className="text-ink/60">Loading services…</p>}>
              <Catalogue />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
