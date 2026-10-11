import Link from "next/link";
import { Suspense } from "react";
import TourClient from "@/components/TourClient";
import { SiteFooter } from "@/components/site/SiteChrome";
import { loadCatalog, loadClientCatalog } from "@/lib/data";
import { staffByDepartment } from "@/content/staff";
import { priceLabel } from "@/lib/pricing";

function TourPoster() {
  return (
    <section aria-label="Virtual tour" className="relative h-[100svh] min-h-[560px] grid place-items-center bg-midnight text-white">
      <div className="text-center px-6">
        <p className="font-semibold tracking-[0.3em] text-sm text-mint">SOFTGRESS · VIRTUAL HQ</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Ideas engineered. Growth accelerated.</h1>
        <p className="mt-3 text-white/70">Loading the interactive campus…</p>
      </div>
    </section>
  );
}

async function Tour() {
  const catalog = await loadClientCatalog();
  return <TourClient catalog={catalog} />;
}

/** Server-rendered company overview: full parity with the 3D tour for search engines, keyboards and screen readers. */
async function Directory() {
  const { departments, services, projects } = await loadCatalog();
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
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-teal-dark font-semibold tracking-[0.2em] text-xs">SOFTGRESS</p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-ink max-w-3xl">A digital marketing &amp; software development agency.</h2>
          <p className="mt-4 text-lg text-ink/70 max-w-2xl">
            Five teams under one roof: software, marketing, creative, AI automation and strategy. Explore every department below, or take the interactive tour above.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center rounded-xl bg-midnight text-white px-5 py-3 font-semibold hover:bg-midnight-3">
              Request a quote
            </Link>
            <Link href="/contact?kind=consultation" className="inline-flex items-center rounded-xl border border-ink/15 px-5 py-3 font-semibold text-ink hover:border-teal">
              Book a consultation
            </Link>
          </div>
        </div>
      </section>

      {departments
        .filter((d) => d.slug !== "reception" && d.active)
        .map((d, i) => {
          const list = services.filter((s) => s.departmentSlug === d.slug);
          const guide = staffByDepartment.get(d.slug);
          return (
            <section key={d.slug} aria-labelledby={`d-${d.slug}`} className={i % 2 ? "bg-white" : "bg-paper"}>
              <div className="mx-auto max-w-6xl px-4 py-14 grid lg:grid-cols-[1fr_2fr] gap-8">
                <div>
                  <h2 id={`d-${d.slug}`} className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    <Link href={`/departments/${d.slug}`} className="hover:text-teal-dark">
                      {d.name}
                    </Link>
                  </h2>
                  <p className="mt-3 text-ink/70">{d.description}</p>
                  {guide && (
                    <p className="mt-4 text-sm text-ink/60">
                      Ask {guide.displayName}, our {guide.roleTitle.replace("AI ", "AI ")} (an AI guide), in the{" "}
                      <Link href={`/?scene=${d.sceneId}`} className="underline">
                        virtual {d.shortName.toLowerCase()} room
                      </Link>
                      .
                    </p>
                  )}
                </div>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {list.map((s) => (
                    <li key={s.slug} className="rounded-2xl border border-ink/10 bg-white p-5 hover:border-teal transition">
                      <h3 className="font-semibold text-ink">
                        <Link href={`/services/${s.slug}`} className="hover:text-teal-dark">
                          {s.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-ink/65">{s.summary}</p>
                      <p className="mt-3 text-xs font-medium text-ink/50">{priceLabel(s)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

      <section aria-labelledby="process" className="bg-midnight text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="process" className="text-2xl sm:text-3xl font-bold">How we work</h2>
          <ol className="mt-8 grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Discovery", "Proposal", "Kick-off", "Phased delivery", "Launch", "Support"].map((s, i) => (
              <li key={s} className="rounded-2xl border border-white/10 p-4">
                <span className="text-teal font-bold">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-semibold">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-white/65 text-sm max-w-2xl">Timelines and prices are agreed in a written proposal after scoping. A request on this site is not a contract.</p>
        </div>
      </section>

      <section aria-labelledby="samples" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="samples" className="text-2xl sm:text-3xl font-bold text-ink">Work</h2>
          <p className="mt-2 text-ink/65">Sample concepts, clearly labelled, until approved client case studies are published.</p>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((p) => (
              <li key={p.slug} className="rounded-2xl border border-ink/10 p-5">
                {p.isSample && <span className="badge badge-sample">SAMPLE CONCEPT</span>}
                <h3 className="mt-2 font-semibold text-ink">{p.title.replace(/^Sample concept:\s*/i, "")}</h3>
                <p className="mt-1 text-sm text-ink/65">{p.summary}</p>
              </li>
            ))}
          </ul>
          <Link href="/work" className="mt-6 inline-block underline text-ink">
            See all work
          </Link>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">Your next chapter starts here.</h2>
          <p className="mt-3 text-ink/70">Tell us about your project. A member of the Softgress team will reply.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center rounded-xl bg-midnight text-white px-5 py-3 font-semibold hover:bg-midnight-3">
              Request a proposal
            </Link>
            <Link href="/contact?kind=callback" className="inline-flex items-center rounded-xl border border-ink/15 px-5 py-3 font-semibold text-ink hover:border-teal">
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
        Skip the 3D tour
      </a>
      <Suspense fallback={<TourPoster />}>
        <Tour />
      </Suspense>
      <main id="directory" tabIndex={-1}>
        <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-ink/60">Loading services…</div>}>
          <Directory />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
