import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { ServiceList } from "@/components/site/ServiceList";
import { loadCatalog } from "@/lib/data";

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
  const list = services.filter((s) => s.departmentSlug === d.slug);
  return (
    <>
      <PageHero
        artworkSlug={d.slug}
        eyebrow="Department"
        title={d.name}
        crumbs={
          <>
            <Link href="/services" className="hover:text-white">Services</Link> › {d.shortName}
          </>
        }
      >
        {d.description}
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          {list.length > 0 && <ServiceList services={list} cols={3} headingLevel="h2" />}
          <aside className="sky mt-16 rounded-[32px] text-white p-8 sm:p-10 flex flex-wrap items-center gap-6 justify-between">
            <div>
              <p className="eyebrow text-teal">{d.shortName}</p>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-bold">Talk to our {d.shortName.toLowerCase()} team.</p>
              <p className="mt-2 text-white/75 max-w-xl">Tell us about your project. You&apos;ll get a reference code, and a Softgress team member will reply.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="pill">Request a quote <ArrowRight size={16} aria-hidden /></Link>
              <Link href="/contact?kind=consultation" className="pill pill-line text-white">Book a consultation</Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export default function DepartmentPage({ params }: PageProps<"/departments/[slug]">) {
  return (
    <>
      <Suspense fallback={<PageHero title="Loading…" />}>
        <Dept params={params} />
      </Suspense>
      <SiteFooter cta={false} />
    </>
  );
}
