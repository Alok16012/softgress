import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { ServiceList } from "@/components/site/ServiceList";
import { departments as seedDepartments } from "@/content/departments";
import { departmentTitle } from "@/content/seo";
import { loadCatalog } from "@/lib/data";
import { ORG_ID, absUrl, breadcrumbLd, graph, pageMeta } from "@/lib/seo";

// Hero and metadata come from bundled content so they are in the initial HTML;
// the live service list streams in below.
const publicDepartments = seedDepartments.filter((d) => d.slug !== "reception");

export function generateStaticParams() {
  return publicDepartments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/departments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = publicDepartments.find((x) => x.slug === slug);
  if (!d) return { title: "Department not found" };
  return pageMeta({ title: departmentTitle(d.slug, d.name), description: `${d.description} Softgress, Pimpri-Chinchwad, Pune: serving Pune, Mumbai, Bangalore, India and abroad.`, path: `/departments/${d.slug}` });
}

async function Services({ slug }: { slug: string }) {
  const { services } = await loadCatalog();
  const list = services.filter((s) => s.departmentSlug === slug);
  return list.length > 0 ? <ServiceList services={list} cols={3} headingLevel="h2" /> : null;
}

export default async function DepartmentPage({ params }: PageProps<"/departments/[slug]">) {
  const { slug } = await params;
  const d = publicDepartments.find((x) => x.slug === slug);
  if (!d) notFound();
  const path = `/departments/${d.slug}`;
  const ld = graph(
    { "@type": "CollectionPage", "@id": `${absUrl(path)}#webpage`, url: absUrl(path), name: d.name, description: d.description, about: { "@id": ORG_ID } },
    breadcrumbLd([
      { name: "Services", path: "/services" },
      { name: d.name, path },
    ]),
  );
  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        artworkSlug={d.slug}
        eyebrow="Department"
        title={d.name}
        crumbs={
          <nav aria-label="Breadcrumb">
            <Link href="/services" className="hover:text-white">Services</Link> › {d.shortName}
          </nav>
        }
      >
        {d.description}
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <Suspense fallback={<p className="text-steel">Loading services…</p>}>
            <Services slug={d.slug} />
          </Suspense>
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
      <SiteFooter cta={false} />
    </>
  );
}
