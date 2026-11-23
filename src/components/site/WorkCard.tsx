import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { DEMO_STATUS_TEXT, needLabel, type PortfolioProject } from "@/content/portfolio-meta";

/** First screenshot, or a branded cover when a project has none. */
export function WorkCover({ project, className = "" }: { project: PortfolioProject; className?: string }) {
  const cover = project.media[0];
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element -- static screenshot from /public/work-shots
    return <img src={cover.url} alt={cover.caption ?? `${project.name} screenshot`} loading="lazy" className={`h-full w-full object-cover object-top ${className}`} />;
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-[linear-gradient(135deg,#04060f,#172440)] p-6 text-center ${className}`} aria-hidden>
      <strong className="font-display text-2xl text-teal">{project.name}</strong>
    </div>
  );
}

export function WorkCard({ project: p }: { project: PortfolioProject }) {
  const live = p.demoStatus === "live" && !!p.demoUrl;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-ink/10 bg-white transition-shadow hover:shadow-[0_18px_50px_-20px_rgba(4,6,15,0.35)]">
      <Link href={`/work/${p.slug}`} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden bg-paper">
        <WorkCover project={p} className="transition-transform duration-500 motion-safe:group-hover:scale-105" />
        <span className={`badge absolute left-4 top-4 ${live ? "bg-[#0a7d3c] text-white" : "bg-white text-ink"}`}>
          {live && <i className="inline-block h-1.5 w-1.5 rounded-full bg-white" />}
          {DEMO_STATUS_TEXT[p.demoStatus]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow text-ink/50">
          {needLabel(p.need)}
          {p.industry ? ` · ${p.industry}` : ""}
        </p>
        <h2 className="mt-2 font-display text-[22px] leading-tight font-bold text-ink">
          <Link href={`/work/${p.slug}`} className="hover:text-teal-dark">
            {p.name}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-ink/55">For {p.client}</p>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-steel">{p.tagline}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href={`/work/${p.slug}`} className="inline-flex items-center gap-1.5 text-ink hover:text-teal-dark">
            View details <ArrowRight size={15} aria-hidden />
          </Link>
          {live && (
            <a href={p.demoUrl!} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-teal-dark hover:text-sky">
              Try live demo <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
