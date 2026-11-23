import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Check, ExternalLink, KeyRound } from "lucide-react";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { WorkCover } from "@/components/site/WorkCard";
import { DEMO_STATUS_TEXT, getProject, needLabel, portfolio } from "@/content/portfolio";

export function generateStaticParams() {
  return portfolio.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return { title: "Project not found", robots: { index: false } };
  return {
    title: `${p.name}: case study & live demo`,
    description: p.tagline.length > 155 ? `${p.tagline.slice(0, 152)}…` : p.tagline,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.name, description: p.tagline, url: `/work/${p.slug}`, ...(p.media[0] && { images: p.media[0].url }) },
  };
}

async function Detail({ params }: { params: PageProps<"/work/[slug]">["params"] }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const live = p.demoStatus === "live" && !!p.demoUrl;
  const steps = p.description?.replace(/^Main workflow:\s*/i, "").split("→").map((s) => s.trim()).filter(Boolean) ?? [];
  const isFlow = !!p.description && /^Main workflow:/i.test(p.description) && steps.length > 1;
  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    abstract: p.tagline,
    description: p.summary,
    genre: needLabel(p.need),
    creator: { "@type": "Organization", name: "Softgress" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <PageHero
        eyebrow={`${needLabel(p.need)}${p.industry ? ` · ${p.industry}` : ""}`}
        title={p.name}
        accent={`Built for ${p.client}`}
        crumbs={
          <nav aria-label="Breadcrumb">
            <Link href="/work" className="hover:text-white">Work</Link> › <span className="text-white/80">{p.name}</span>
          </nav>
        }
      >
        <p>{p.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {live ? (
            <a href={p.demoUrl!} target="_blank" rel="noopener" className="pill">
              Try live demo <ExternalLink size={16} aria-hidden />
            </a>
          ) : (
            <span className="badge bg-white/10 text-white px-4 py-2 text-sm">{DEMO_STATUS_TEXT[p.demoStatus]}</span>
          )}
          <Link href="/contact?form=project" className="pill pill-line text-white">
            Build something similar
          </Link>
        </div>
      </PageHero>

      <main id="main" className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 space-y-20">
          {live && (
            <section aria-labelledby="demo-title">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <h2 id="demo-title" className="font-display text-[30px] sm:text-[40px] font-bold text-ink">Try the live demo</h2>
                  <p className="mt-2 max-w-2xl text-steel">A working copy of the software with sample data. Click anything you like: nothing you do reaches a real system.</p>
                </div>
                <a href={p.demoUrl!} target="_blank" rel="noopener" className="pill pill-dark">
                  Open full screen <ExternalLink size={16} aria-hidden />
                </a>
              </div>
              <div className={`mt-8 grid gap-6 ${p.embeddable && p.demoLogins.length > 0 ? "lg:grid-cols-[1fr_300px]" : ""}`}>
                {p.embeddable && (
                  <div className="hidden overflow-hidden rounded-[20px] border border-ink/10 bg-paper shadow-sm md:block">
                    <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-2.5 text-xs text-ink/55">
                      <span className="flex gap-1.5" aria-hidden>
                        <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                        <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                      </span>
                      <span className="truncate">{p.demoUrl}</span>
                    </div>
                    <iframe
                      src={p.demoUrl!}
                      title={`${p.name} live demo`}
                      loading="lazy"
                      className="block h-[720px] w-full bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {p.demoLogins.length > 0 && (
                  <aside className="h-fit rounded-[20px] bg-midnight p-6 text-white">
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                      <KeyRound size={16} aria-hidden className="text-teal" /> Demo logins
                    </h3>
                    <ul className="mt-4 space-y-4">
                      {p.demoLogins.map((l) => (
                        <li key={`${l.role}-${l.login}`} className="text-sm">
                          <strong className="block text-teal">{l.role}</strong>
                          <code className="mt-1 block break-all rounded-lg bg-white/10 px-2 py-1">{l.login}</code>
                          {l.secret && <code className="mt-1 block break-all rounded-lg bg-white/10 px-2 py-1">{l.secret}</code>}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs text-white/55">These accounts exist only in the demo copy.</p>
                  </aside>
                )}
              </div>
            </section>
          )}

          {p.media.length > 0 && (
            <section aria-labelledby="shots-title">
              <h2 id="shots-title" className="font-display text-[30px] sm:text-[40px] font-bold text-ink">Screenshots</h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {p.media.map((m, i) => (
                  <li key={m.id}>
                    <a href={m.url} target="_blank" rel="noopener" className="block aspect-[16/10] overflow-hidden rounded-[18px] border border-ink/10 bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot */}
                      <img src={m.url} alt={m.caption ?? `${p.name} screenshot ${i + 1}`} loading="lazy" className="h-full w-full object-cover object-top" />
                    </a>
                    {m.caption && <p className="mt-2 text-sm text-ink/60">{m.caption}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {p.media.length === 0 && (
            <div className="aspect-[16/7] overflow-hidden rounded-[24px]">
              <WorkCover project={p} />
            </div>
          )}

          <section aria-labelledby="what-title" className="max-w-4xl">
            <h2 id="what-title" className="font-display text-[30px] sm:text-[40px] font-bold text-ink">What it does</h2>
            <p className="mt-4 text-lg leading-relaxed text-steel">{p.summary}</p>
            {p.techStack.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {p.techStack.map((t) => (
                  <li key={t} className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-ink/70">{t}</li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid gap-12 lg:grid-cols-2">
            {p.features.length > 0 && (
              <section aria-labelledby="features-title">
                <h2 id="features-title" className="font-display text-[26px] sm:text-[32px] font-bold text-ink">Key features</h2>
                <ul className="mt-6 space-y-4">
                  {p.features.map((f) => {
                    const [head, ...rest] = f.split(": ");
                    return (
                      <li key={f} className="flex gap-3 text-[15px] leading-relaxed text-steel">
                        <Check size={18} aria-hidden className="mt-0.5 flex-none text-sky" />
                        <span>{rest.length ? <><strong className="text-ink">{head}</strong> {rest.join(": ")}</> : f}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
            {p.description && (
              <section aria-labelledby="flow-title">
                <h2 id="flow-title" className="font-display text-[26px] sm:text-[32px] font-bold text-ink">{isFlow ? "How it works" : "About the project"}</h2>
                {isFlow ? (
                  <ol className="mt-6 space-y-3">
                    {steps.map((s, i) => (
                      <li key={s} className="flex gap-3 rounded-[14px] bg-paper p-4 text-[15px] text-ink/80">
                        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-teal text-sm font-bold text-midnight">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-steel">{p.description}</p>
                )}
              </section>
            )}
          </div>

          <Link href="/work" className="inline-flex items-center gap-2 font-semibold text-teal-dark hover:text-sky">
            See all projects <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </main>
    </>
  );
}

export default function WorkProjectPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <>
      <Suspense fallback={<div className="min-h-[60vh] bg-midnight" />}>
        <Detail params={params} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
