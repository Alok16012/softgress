import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { loadCatalog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Work",
  description: "Softgress work: approved case studies and clearly labelled sample concepts.",
  alternates: { canonical: "/work" },
};

async function Projects() {
  const { projects, services } = await loadCatalog();
  const real = projects.filter((p) => !p.isSample);
  return (
    <>
      {real.length === 0 && (
        <p className="mt-6 rounded-2xl bg-paper border border-ink/10 p-5 text-ink/75">
          No client case studies have been published here yet. The projects below are <strong>sample concepts</strong> created to show how we approach work: they are not client engagements and carry no results claims.
        </p>
      )}
      <ul className="mt-8 grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <li key={p.slug} className="rounded-2xl border border-ink/10 p-6">
            {p.isSample && <span className="badge badge-sample">SAMPLE CONCEPT, NOT CLIENT WORK</span>}
            <h2 className="mt-3 text-xl font-bold text-ink">{p.title.replace(/^Sample concept:\s*/i, "")}</h2>
            <p className="mt-1 text-sm text-ink/55">{p.industry}</p>
            <p className="mt-3 text-ink/75">{p.body}</p>
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
      <SiteHeader />
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">Work</h1>
          <Suspense fallback={<p className="mt-6 text-ink/60">Loading…</p>}>
            <Projects />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
