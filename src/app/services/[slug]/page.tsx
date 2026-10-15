import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Check } from "lucide-react";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";
import { priceLabel } from "@/lib/pricing";

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
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.description,
    provider: { "@type": "Organization", name: "Softgress" },
  };
  return (
    <article className="flex-1 flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
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
        </div>
      </main>
    </article>
  );
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return (
    <>
      <Suspense fallback={<PageHero title="Loading…" />}>
        <Detail params={params} />
      </Suspense>
      <SiteFooter cta={false} />
    </>
  );
}
