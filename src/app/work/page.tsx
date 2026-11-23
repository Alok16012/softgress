import type { Metadata } from "next";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { WorkGrid } from "@/components/site/WorkGrid";
import { featuredProjects, portfolio, type PortfolioProject } from "@/content/portfolio";

/** Only what a card shows, so the client bundle stays small. */
const toCard = (p: PortfolioProject): PortfolioProject => ({ ...p, summary: "", description: null, features: [], techStack: [], demoLogins: [], media: p.media.slice(0, 1) });

export const metadata: Metadata = {
  title: "Work: ERP, CRM, apps & websites with live demos",
  description: `${portfolio.length} ERP, CRM, mobile app, e-commerce, website and AI projects built by Softgress. Open any project and try its live demo.`,
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const live = portfolio.filter((p) => p.demoStatus === "live" && p.demoUrl).length;
  const industries = new Set(portfolio.map((p) => p.industry).filter(Boolean)).size;
  const stats = [
    { label: "Projects delivered", value: portfolio.length },
    { label: "Industries", value: industries },
    { label: "Live demos you can try", value: live },
  ];

  return (
    <>
      <PageHero eyebrow="Our work" title="Software we've built for real businesses" accent="Open any project and try its live demo.">
        From online stores and CRMs to AI WhatsApp assistants and mobile apps. Every live demo runs on sample data, so click around freely: nothing breaks.
      </PageHero>
      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[20px] bg-paper p-6">
                <dt className="text-sm font-semibold text-ink/60">{s.label}</dt>
                <dd className="mt-1 font-display text-[40px] font-bold leading-none text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
          <ol className="mt-6 grid gap-3 text-[15px] text-steel sm:grid-cols-3">
            {["Pick what you need below", "Open a project to see what it does", "Press Try live demo and click around"].map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-teal text-sm font-bold text-midnight">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-14">
            <WorkGrid projects={portfolio.map(toCard)} featuredSlugs={featuredProjects.map((p) => p.slug)} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
