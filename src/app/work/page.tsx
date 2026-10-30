import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectArt } from "@/components/site/Art";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Work & Case Studies",
  description: "Softgress work: approved case studies and clearly labelled sample concepts in software development, digital marketing, creative and AI automation.",
  path: "/work",
});

async function Projects() {
  const { projects, services } = await loadCatalog();
  const real = projects.filter((p) => !p.isSample);
  const deptOf = (slug?: string) => services.find((s) => s.slug === slug)?.departmentSlug ?? "strategy";
  return (
    <>
      {real.length === 0 && (
        <p className="rounded-[20px] bg-paper border border-ink/10 p-6 text-steel">
          No client case studies have been published here yet. The projects below are <strong>sample concepts</strong> created to show how we approach work: they are not client engagements and carry no results claims.
        </p>
      )}
      <ul className="mt-12 grid md:grid-cols-2 gap-x-8 gap-y-14">
        {projects.map((p) => (
          <li key={p.slug}>
            <div className="relative">
              <ProjectArt slug={p.slug} departmentSlug={deptOf(p.serviceSlugs[0])} className="aspect-[16/9]" />
              {p.isSample && <span className="badge badge-sample absolute left-5 top-5">SAMPLE CONCEPT, NOT CLIENT WORK</span>}
            </div>
            <p className="mt-6 eyebrow text-ink/50">{p.industry}</p>
            <h2 className="mt-2 font-display text-[26px] leading-tight font-bold text-ink">{p.title.replace(/^Sample concept:\s*/i, "")}</h2>
            <p className="mt-3 text-steel leading-relaxed">{p.body}</p>
            <p className="mt-3 text-sm text-ink/55">Services: {p.serviceSlugs.map((s) => services.find((x) => x.slug === s)?.title ?? s).join(", ")}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function WorkPage() {
  return (
    <>
      <PageHero eyebrow="Success stories" title="Work" accent="Approved case studies and clearly labelled sample concepts." />
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <Suspense fallback={<p className="text-steel">Loading…</p>}>
            <Projects />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
