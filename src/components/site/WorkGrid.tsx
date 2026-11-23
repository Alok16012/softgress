"use client";

import { useState } from "react";
import { NEEDS, type NeedId, type PortfolioProject } from "@/content/portfolio-meta";
import { WorkCard } from "./WorkCard";

/** Filterable project grid. Filtering is client-side so /work stays a static page. */
export function WorkGrid({ projects, featuredSlugs }: { projects: PortfolioProject[]; featuredSlugs: string[] }) {
  const featured = featuredSlugs.map((s) => projects.find((p) => p.slug === s)).filter((p): p is PortfolioProject => !!p);
  const [need, setNeed] = useState<NeedId | null>(null);
  const used = NEEDS.filter((n) => projects.some((p) => p.need === n.id));
  const rest = need ? projects.filter((p) => p.need === need) : projects.filter((p) => !featured.includes(p));
  const chip = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      active ? "border-midnight bg-midnight text-white" : "border-ink/15 bg-white text-ink hover:border-ink/40"
    }`;

  return (
    <>
      <nav aria-label="What do you need?" className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-semibold text-ink/60">What do you need?</span>
        <button type="button" className={chip(!need)} aria-pressed={!need} onClick={() => setNeed(null)}>
          Everything <span className="opacity-60">{projects.length}</span>
        </button>
        {used.map((n) => (
          <button key={n.id} type="button" className={chip(need === n.id)} aria-pressed={need === n.id} onClick={() => setNeed(n.id)}>
            {n.label} <span className="opacity-60">{projects.filter((p) => p.need === n.id).length}</span>
          </button>
        ))}
      </nav>

      {!need && featured.length > 0 && (
        <section aria-labelledby="featured-title" className="mt-14">
          <h2 id="featured-title" className="font-display text-[28px] sm:text-[36px] font-bold text-ink">
            Start here: our best work
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <li key={p.slug}>
                <WorkCard project={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!need && <h2 className="mt-20 font-display text-[28px] sm:text-[36px] font-bold text-ink">All projects</h2>}
      <ul className={`${need ? "mt-12" : "mt-8"} grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
        {rest.map((p) => (
          <li key={p.slug}>
            <WorkCard project={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
