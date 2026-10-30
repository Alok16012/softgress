import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  FileText,
  Handshake,
  Layers,
  MessageCircle,
  MessageSquareText,
  Phone,
  Rocket,
  ShieldCheck,
  Target,
} from "lucide-react";
import { DeptArt } from "@/components/site/Art";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { SectionTitle, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { office, whatsappUrl } from "@/content/company";
import { leaders } from "@/content/leadership";
import { loadCatalog } from "@/lib/data";
import { enquiryGroups } from "@/lib/enquiry";
import { catalogOnly } from "@/lib/env";
import { getPublicConfig } from "@/lib/server";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Get Started: Websites, Apps, Marketing & AI",
  description: "Grow your business with Softgress, Pune: websites, apps, SEO and ads, branding and AI automation from one team. Send a quick enquiry or call +91 74472 07700.",
  path: "/get-started",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** What each department does for a business owner, in their words. */
const OUTCOMES: Record<string, string> = {
  software: "Launch your website or app",
  marketing: "Get more customers online",
  creative: "Look sharp everywhere",
  automation: "Save hours with AI automation",
  strategy: "Plan before you spend",
};

const REASONS = [
  { icon: Layers, title: "Everything under one roof", body: "Website, ads, design and automation planned by one team, so every piece works together." },
  { icon: FileText, title: "A written plan first", body: "Goals, scope, deliverables and a quote agreed in writing before any work starts." },
  { icon: ShieldCheck, title: "Honest pricing", body: "No hidden packages or invented numbers. You get a clear quote based on your actual needs." },
  { icon: Handshake, title: "Real people to talk to", body: "Call or WhatsApp the team directly. One point of contact for your whole project." },
];

const STEPS = [
  { icon: MessageSquareText, title: "Share your requirement", body: "Send a quick enquiry, call or WhatsApp us. Tell us what you want to build or grow." },
  { icon: Target, title: "Get a clear proposal", body: "We understand your goals and send a written scope with deliverables, milestones and a quote." },
  { icon: Rocket, title: "We build and grow it", body: "Our team delivers in phases with regular check-ins, then launches and supports you." },
];

const FAQS = [
  {
    q: "How much will my project cost?",
    a: "It depends on scope, features, integrations, content readiness and timeline. Where a price is published in our service catalogue you will see it; otherwise we send a custom quote once we understand your requirement. No payment is requested for an enquiry.",
  },
  {
    q: "How long does it take?",
    a: "Timelines are agreed in the written proposal after scoping. They depend on the number of features, integrations, how ready your content is, review speed and any third-party approvals such as app stores or ad platforms.",
  },
  {
    q: "Is ad spend included in your fees?",
    a: "No. For advertising services, ad spend is paid by you directly to the ad platform (for example Google or Meta) and is separate from Softgress fees.",
  },
  {
    q: "What happens after I send an enquiry?",
    a: "A Softgress team member reviews it and gets back to you on your preferred channel: a call, WhatsApp or email. Sending an enquiry is not a contract and does not commit you to anything.",
  },
  {
    q: "Can one team really handle website, marketing and design?",
    a: "Yes. Softgress has five teams under one roof: Software Development, Digital Marketing, Creative Production, AI & Automation, and Client Strategy. They plan your project together, so you deal with one point of contact.",
  },
];

function serviceParam(sp: Awaited<SearchParams>) {
  const s = sp.service;
  return typeof s === "string" && /^[a-z0-9-]{2,60}$/.test(s) ? s : null;
}

/** Hero with the enquiry form above the fold. Reads ?service= so each ad campaign can land on its own headline. */
async function LandingHero({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { departments, services } = await loadCatalog();
  const { contactEmail, whatsappNumber } = getPublicConfig();
  const slug = serviceParam(sp);
  const svc = slug ? services.find((s) => s.slug === slug) : undefined;
  const wa = whatsappNumber ?? office.phone.tel;

  return (
    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-32 pb-16 sm:px-6 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24">
      <div>
        <p className="eyebrow text-teal">{svc ? svc.title : "Websites · Apps · Marketing · AI"}</p>
        <h1 id="landing-title" className="mt-4 font-display text-[40px] leading-[1.04] sm:text-[58px] font-bold tracking-tight">
          {svc ? (
            <>
              Expert {svc.title} <span className="text-teal">for your business.</span>
            </>
          ) : (
            <>
              Grow your business online <span className="text-teal">with one expert team.</span>
            </>
          )}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
          {svc
            ? svc.summary
            : "From a new website or app to Google and Meta ads, branding and AI automation, Softgress plans, builds and grows it for you."}
        </p>
        <ul className="mt-7 space-y-3">
          {["One team for software, marketing, creative and automation", "A written proposal and quote before any work starts", "Talk to us directly on call or WhatsApp"].map((t) => (
            <li key={t} className="flex items-start gap-3 text-[16px] text-white/90">
              <CheckCircle2 size={20} aria-hidden className="mt-0.5 flex-none text-teal" />
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={`tel:${office.phone.tel}`} className="pill">
            <Phone size={16} aria-hidden /> Call {office.phone.display}
          </a>
          <a href={whatsappUrl(wa)} target="_blank" rel="noopener noreferrer" className="pill pill-line text-white">
            <MessageCircle size={16} aria-hidden /> WhatsApp us
          </a>
        </div>
      </div>

      <div id="landing-form" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#070b18]/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur">
        <div className="border-b border-white/10 bg-[radial-gradient(120%_140%_at_0%_0%,#1d6ee4_0%,#0a1226_55%,#070b18_100%)] rounded-t-[28px] px-6 pb-5 pt-6 sm:px-8">
          <p className="flex items-center gap-2 eyebrow text-teal">
            <BadgeCheck size={15} aria-hidden /> Quick enquiry
          </p>
          <h2 className="mt-2 font-display text-[24px] sm:text-[28px] font-bold leading-tight">Get a call back from our team</h2>
          <p className="mt-1.5 text-[15px] text-white/70">Takes less than a minute. No payment is requested.</p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <EnquiryForm
            variant="short"
            bare
            projectType="Landing page enquiry"
            groups={enquiryGroups(departments, services)}
            whatsappNumber={whatsappNumber}
            mode={catalogOnly() ? "direct" : "save"}
            directWhatsapp={wa}
            directEmail={contactEmail}
            initialService={svc?.slug ?? ""}
          />
        </div>
      </div>
    </div>
  );
}

/** What we do, framed as outcomes, with a few real services from the live catalogue. */
async function Outcomes() {
  const { departments, services } = await loadCatalog();
  const depts = departments.filter((d) => d.slug !== "reception" && d.active);
  return (
    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
      {depts.map((d, i) => (
        <li key={d.slug} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
          <Link href={`/departments/${d.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-white card-lift">
            <DeptArt slug={d.slug} uid={`lp-${d.slug}`} className="aspect-[16/8] !rounded-none" />
            <div className="flex flex-1 flex-col p-6">
              <p className="eyebrow text-teal-dark">{d.name}</p>
              <h3 className="mt-2 font-display text-[24px] font-bold leading-tight text-ink">{OUTCOMES[d.slug] ?? d.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-steel">{d.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {services
                  .filter((s) => s.departmentSlug === d.slug)
                  .slice(0, 4)
                  .map((s) => (
                    <li key={s.slug} className="rounded-full bg-paper px-3 py-1 text-[13px] font-medium text-ink/80">
                      {s.title}
                    </li>
                  ))}
              </ul>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-teal-dark">
                Explore {d.shortName} <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileActionBar() {
  const { whatsappNumber } = getPublicConfig();
  return (
    <nav aria-label="Quick contact" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-white/10 bg-[#04060f]/95 backdrop-blur lg:hidden">
      <a href={`tel:${office.phone.tel}`} className="flex flex-col items-center gap-1 py-3 text-[13px] font-bold text-white">
        <Phone size={20} aria-hidden className="text-teal" /> Call
      </a>
      <a href={whatsappUrl(whatsappNumber ?? office.phone.tel)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 py-3 text-[13px] font-bold text-white">
        <MessageCircle size={20} aria-hidden className="text-teal" /> WhatsApp
      </a>
      <a href="#landing-form" className="flex flex-col items-center gap-1 bg-teal py-3 text-[13px] font-bold text-midnight">
        <MessageSquareText size={20} aria-hidden /> Enquire
      </a>
    </nav>
  );
}

export default function GetStartedPage({ searchParams }: { searchParams: SearchParams }) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <section aria-labelledby="landing-title" className="sky relative overflow-hidden text-white">
        <Image src="/images/hero.webp" alt="" fill preload sizes="100vw" className="object-cover object-[70%_center] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,15,0.97)_0%,rgba(4,6,15,0.8)_50%,rgba(4,6,15,0.55)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-transparent to-[#04060f]/40" />
        <SiteHeader />
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-7xl px-4 pt-40 pb-24 sm:px-6">
              <p className="font-display text-[40px] sm:text-[58px] font-bold leading-[1.04]">Grow your business online with one expert team.</p>
            </div>
          }
        >
          <LandingHero searchParams={searchParams} />
        </Suspense>
      </section>

      <main id="main" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />

        {/* What we do */}
        <section aria-labelledby="lp-outcomes" className="bg-paper">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
            <p className="eyebrow text-teal-dark">What we can do for you</p>
            <div className="mt-3">
              <SectionTitle id="lp-outcomes">Everything your business needs to grow online.</SectionTitle>
            </div>
            <Suspense fallback={<p className="mt-12 text-steel">Loading services…</p>}>
              <Outcomes />
            </Suspense>
          </div>
        </section>

        {/* Why Softgress */}
        <section aria-labelledby="lp-why" className="bg-midnight text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
            <p className="eyebrow text-teal">Why Softgress</p>
            <div className="mt-3">
              <SectionTitle id="lp-why" dark>
                One partner. No runaround.
              </SectionTitle>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {REASONS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-teal/60">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-teal text-midnight">
                    <Icon size={22} aria-hidden />
                  </span>
                  <p className="mt-5 font-display text-[20px] font-bold leading-tight">{title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/65">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="lp-steps" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
            <p className="eyebrow text-teal-dark">How it works</p>
            <div className="mt-3">
              <SectionTitle id="lp-steps">Three simple steps.</SectionTitle>
            </div>
            <ol className="mt-12 grid gap-6 lg:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="relative rounded-[28px] border border-ink/10 bg-paper p-8">
                  <span className="absolute right-7 top-6 font-display text-[56px] font-bold leading-none text-ink/[0.07]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-dark text-white">
                    <Icon size={26} aria-hidden />
                  </span>
                  <p className="mt-6 font-display text-[22px] font-bold text-ink">{title}</p>
                  <p className="mt-2 leading-relaxed text-steel">{body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <a href="#landing-form" className="pill pill-dark">
                Send your requirement <ArrowRight size={16} aria-hidden />
              </a>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section aria-labelledby="lp-leaders" className="bg-paper">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow text-teal-dark">Who you will work with</p>
              <h2 id="lp-leaders" className="mt-3 font-display text-[32px] sm:text-[44px] leading-tight font-bold tracking-tight text-ink">
                Led by people who answer for the result.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-steel">
                Softgress is led by two directors: one who makes sure every engagement runs well, and one who makes sure everything we build is engineered well.
              </p>
              <Link href="/about#founder-corner" className="pill pill-line mt-8 text-ink">
                Meet the leadership <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-5">
              {leaders.map((l) => (
                <li key={l.name} className="overflow-hidden rounded-[28px] bg-midnight">
                  <div className="relative aspect-[4/5]">
                    {l.photo && <Image src={l.photo} alt={`Portrait of ${l.name}`} fill sizes="(max-width: 1023px) 50vw, 320px" className="object-cover object-top" />}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/70 to-transparent p-5 pt-16">
                      <p className="font-display text-[18px] sm:text-[22px] font-bold leading-tight text-white">{l.name}</p>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-teal">{l.role}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="lp-faq" className="bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-24">
            <p className="eyebrow text-teal-dark">Questions</p>
            <div className="mt-3">
              <SectionTitle id="lp-faq">Frequently asked questions</SectionTitle>
            </div>
            <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {FAQS.map((f) => (
                <li key={f.q}>
                  <details className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-[18px] sm:text-[20px] font-bold text-ink">
                      {f.q}
                      <ChevronDown size={22} aria-hidden className="flex-none text-teal-dark transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-5 pr-10 leading-relaxed text-steel">{f.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final call to action */}
        <section className="sky relative overflow-hidden text-white">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-[34px] sm:text-[48px] leading-tight font-bold tracking-tight">Ready to grow? Let&apos;s talk today.</h2>
              <p className="mt-3 text-lg text-white/80">
                Visit us at {office.lines[0]}, {office.lines[1]}, or reach the team on {office.phone.display}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href="#landing-form" className="pill">
                Send an enquiry <ArrowRight size={16} aria-hidden />
              </a>
              <a href={`tel:${office.phone.tel}`} className="pill pill-line text-white">
                <Phone size={16} aria-hidden /> Call now
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter cta={false} />
      {/* Room for the mobile action bar so it never covers the end of the footer. */}
      <div aria-hidden className="h-[68px] bg-[#050711] lg:hidden" />
      <MobileActionBar />
    </>
  );
}
