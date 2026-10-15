import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { DeptArt, ProjectArt } from "@/components/site/Art";
import { ServiceList } from "@/components/site/ServiceList";
import { HomeHero } from "@/components/site/HomeHero";
import { SectionTitle, SiteFooter } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";

/** Server-rendered company overview: departments, every service, process and work. */
async function Directory() {
  const { departments, services, projects } = await loadCatalog();
  const depts = departments.filter((d) => d.slug !== "reception" && d.active);
  const deptOf = (serviceSlug?: string) => services.find((s) => s.slug === serviceSlug)?.departmentSlug ?? "strategy";
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Softgress",
    slogan: "Ideas engineered. Growth accelerated.",
    description: "Digital marketing and software development agency.",
    url: process.env.SITE_URL ?? "http://localhost:3000",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, "\\u003c") }} />

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid gap-14 lg:grid-cols-[1.05fr_1fr] items-center">
          <div>
            <p className="eyebrow text-teal-dark">Softgress</p>
            <h2 className="mt-3 font-display text-[34px] sm:text-[48px] leading-[1.08] font-bold tracking-tight text-ink">
              A digital marketing &amp; software development agency.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-steel">
              Five teams under one roof: software, marketing, creative, AI automation and strategy. Explore every department and service below, then tell us what you need.
            </p>
            <p className="mt-4 text-lg font-medium text-teal-dark">Ideas engineered. Growth accelerated.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="pill">
                Request a quote <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/contact?kind=consultation" className="pill pill-line text-ink">
                Book a consultation
              </Link>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-4" aria-label="Departments">
            {depts.slice(0, 4).map((d, i) => (
              <li key={d.slug} className={i % 2 ? "translate-y-8" : ""}>
                <Link href={`/departments/${d.slug}`} className="group relative block overflow-hidden rounded-[32px] card-lift">
                  <DeptArt slug={d.slug} uid={`intro-${d.slug}`} className="aspect-[4/5] !rounded-[32px]" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="font-display text-lg sm:text-xl font-bold leading-tight">{d.shortName}</p>
                    <p className="mt-1 text-sm font-bold text-teal">{d.name}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our services */}
      <section aria-labelledby="our-services" className="bg-midnight text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
          <SectionTitle id="our-services" href="/services" dark>
            Our Services
          </SectionTitle>
          {/* Two wide cards, then three: five departments fill the grid without a gap. */}
          <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-6">
            {depts.map((d, i) => (
              <li key={d.slug} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                <Link href={`/departments/${d.slug}`} className="group block">
                  <DeptArt slug={d.slug} uid={`svc-${d.slug}`} className="aspect-[2/1] sm:aspect-[16/9]" />
                  <p className="mt-6 font-display text-[26px] sm:text-[30px] leading-tight font-bold">{d.name}</p>
                  <div className="mt-3 flex items-start justify-between gap-6">
                    <p className="text-white/80 text-[17px] leading-relaxed">{d.description}</p>
                    <span className="arrow-dot">
                      <ArrowRight size={18} aria-hidden />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Department expertise: every service, server-rendered */}
      {depts.map((d, i) => {
        const list = services.filter((s) => s.departmentSlug === d.slug);
        return (
          <section key={d.slug} aria-labelledby={`d-${d.slug}`} className={i % 2 ? "bg-paper" : "bg-white"}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[360px_1fr] gap-10 lg:gap-16">
              <div className="lg:sticky lg:top-8 lg:self-start">
                <DeptArt slug={d.slug} uid={`dept-${d.slug}`} className="hidden lg:block aspect-[16/10] mb-8" />
                <p className="eyebrow text-teal-dark">Department {String(i + 1).padStart(2, "0")}</p>
                <h2 id={`d-${d.slug}`} className="mt-3 font-display text-[28px] sm:text-[36px] leading-tight font-bold tracking-tight text-ink">
                  {d.name}
                </h2>
                <p className="mt-4 text-steel leading-relaxed">{d.description}</p>
                <Link href={`/departments/${d.slug}`} className="pill pill-line mt-6 text-ink">
                  View department <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
              <ServiceList services={list} />
            </div>
          </section>
        );
      })}

      {/* Process */}
      <section aria-labelledby="process" className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
          <SectionTitle id="process" dark>
            How we work
          </SectionTitle>
          <ol className="mt-12 grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Discovery", "Proposal", "Kick-off", "Phased delivery", "Launch", "Support"].map((s, i) => (
              <li key={s} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 hover:border-teal/60 transition-colors">
                <span className="font-display text-[34px] font-bold text-teal">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 font-medium text-[17px]">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-white/60 text-sm max-w-2xl">Timelines and prices are agreed in a written proposal after scoping. A request on this site is not a contract.</p>
        </div>
      </section>

      {/* Work */}
      <section aria-labelledby="samples" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionTitle id="samples" href="/work">
                Work
              </SectionTitle>
              <p className="mt-3 text-steel text-lg">Sample concepts, clearly labelled, until approved client case studies are published.</p>
            </div>
            <Link href="/work" className="pill pill-dark">
              See all work
            </Link>
          </div>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((p) => (
              <li key={p.slug} className="group">
                <div className="relative">
                  <ProjectArt slug={p.slug} departmentSlug={deptOf(p.serviceSlugs[0])} className="aspect-[4/3]" />
                  {p.isSample && <span className="badge badge-sample absolute left-4 top-4">SAMPLE CONCEPT</span>}
                </div>
                <p className="mt-5 eyebrow text-ink/50">{p.industry}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-ink">{p.title.replace(/^Sample concept:\s*/i, "")}</h3>
                <p className="mt-2 text-[15px] text-steel">{p.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="sky relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <h2 className="font-display text-[34px] sm:text-[48px] leading-tight font-bold tracking-tight">Your next chapter starts here.</h2>
            <p className="mt-3 text-lg text-white/80">Tell us about your project. A member of the Softgress team will reply.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/contact" className="pill">
              Request a proposal <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/contact?kind=callback" className="pill pill-line text-white">
              Request a callback
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <>
      <a href="#directory" className="skip-link">
        Skip to content
      </a>
      <HomeHero />
      <main id="directory" tabIndex={-1}>
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-steel">Loading services…</div>}>
          <Directory />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
