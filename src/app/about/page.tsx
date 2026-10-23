import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Compass, Handshake, Layers, LineChart, Mail, MapPin, MessageCircle, Phone, Quote, ShieldCheck } from "lucide-react";
import { office, officeLd, whatsappUrl } from "@/content/company";
import { DeptArt } from "@/components/site/Art";
import { PageHero, SectionTitle, SiteFooter } from "@/components/site/SiteChrome";
import { leaders, leadershipNote, leadershipPromises, type Leader } from "@/content/leadership";
import { loadCatalog } from "@/lib/data";
import { getPublicConfig } from "@/lib/server";

export const metadata: Metadata = {
  title: "About Us",
  description: `About Softgress: five teams under one roof for software, marketing, creative, AI automation and strategy, and the leadership team behind it: ${leaders.map((l) => `${l.name} (${l.role})`).join(" and ")}.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Compass, title: "Clarity before code", body: "Every engagement starts with a written brief: goals, scope and assumptions agreed before anyone builds." },
  { icon: ShieldCheck, title: "Honest by default", body: "Prices only where published, sample work clearly labelled, and no promises we cannot stand behind." },
  { icon: Layers, title: "One team, end to end", body: "Software, marketing, creative and automation planned together, so every piece works with the others." },
  { icon: LineChart, title: "Growth you can measure", body: "We agree what success looks like up front and report against it, not against vanity numbers." },
];

const STEPS = ["Discovery", "Proposal", "Kick-off", "Phased delivery", "Launch", "Support"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Who we are: the agency story plus the live list of departments. */
async function Teams() {
  const { departments } = await loadCatalog();
  const depts = departments.filter((d) => d.slug !== "reception" && d.active);
  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-label="Our teams">
      {depts.map((d) => (
        <li key={d.slug}>
          <Link href={`/departments/${d.slug}`} className="group flex items-center gap-4 rounded-[20px] border border-ink/10 bg-white p-3 pr-5 card-lift">
            <DeptArt slug={d.slug} uid={`about-${d.slug}`} className="h-16 w-16 flex-none !rounded-[14px]" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[17px] font-bold leading-tight text-ink">{d.name}</span>
              <span className="mt-0.5 block truncate text-sm text-steel">{d.shortName}</span>
            </span>
            <ArrowRight size={18} aria-hidden className="flex-none text-teal-dark transition-transform group-hover:translate-x-1" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <li>
      <figure>
        <div className="group relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(120%_90%_at_20%_10%,#1d6ee4_0%,#0a1226_55%,#04060f_100%)]">
          {leader.photo ? (
            <Image
              src={leader.photo}
              alt={`Portrait of ${leader.name}, ${leader.role} at Softgress`}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 560px"
              className="object-cover object-top transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span aria-hidden className="font-display text-[120px] font-bold leading-none tracking-tighter text-white/90">
                {initials(leader.name)}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/75 to-transparent p-6 pt-24 sm:p-8 sm:pt-28">
            <p className="font-display text-[26px] sm:text-[30px] font-bold leading-tight text-white">{leader.name}</p>
            <p className="mt-1 text-sm sm:text-[15px] font-bold text-teal">{leader.role}</p>
          </div>
        </div>
        <figcaption className="mt-5 text-white/65 leading-relaxed">{leader.focus}</figcaption>
        {leader.email && (
          <a href={`mailto:${leader.email}`} className="mt-3 inline-flex items-center gap-2 font-medium text-teal hover:text-white break-all">
            <Mail size={16} aria-hidden className="flex-none" /> {leader.email}
          </a>
        )}
        {leader.links.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {leader.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="pill pill-line !py-2 !px-4 !text-[13px] text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </figure>
    </li>
  );
}

function FounderCorner() {
  const { contactEmail, whatsappNumber } = getPublicConfig();
  return (
    <section id="founder-corner" aria-labelledby="founder-heading" className="relative overflow-hidden bg-midnight text-white scroll-mt-24">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-sky/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-teal">Founder Corner</p>
            <h2 id="founder-heading" className="mt-3 font-display text-[34px] sm:text-[48px] leading-[1.08] font-bold tracking-tight">
              Meet the people behind Softgress.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-white/70 lg:pb-2">
            Softgress is led by two directors: one who makes sure every engagement runs well, and one who makes sure everything we build is engineered well.
          </p>
        </div>

        <ul className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-8" aria-label="Leadership">
          {leaders.map((l) => (
            <LeaderCard key={l.name} leader={l} />
          ))}
        </ul>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <blockquote>
            <p className="eyebrow text-teal">A note from our leadership</p>
            <Quote aria-hidden size={40} className="mt-6 mb-5 text-teal/40" />
            <div className="space-y-5 text-[18px] sm:text-[19px] leading-[1.7] text-white/85">
              {leadershipNote.map((p, i) => (
                <p key={i} className={i === 0 ? "text-white text-[20px] sm:text-[22px] leading-[1.6]" : undefined}>
                  {p}
                </p>
              ))}
            </div>
            <footer className="mt-8 flex items-center gap-4">
              <span aria-hidden className="h-px w-12 flex-none bg-teal" />
              <span className="flex flex-wrap gap-x-8 gap-y-3">
                {leaders.map((l) => (
                  <span key={l.name}>
                    <cite className="not-italic font-display text-[20px] font-bold text-white">{l.name}</cite>
                    <span className="block text-sm text-white/55">{l.role}</span>
                  </span>
                ))}
              </span>
            </footer>
          </blockquote>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <p className="flex items-center gap-2 eyebrow text-teal">
                <Handshake size={16} aria-hidden /> Our promise to every client
              </p>
              <ul className="mt-6 space-y-6">
                {leadershipPromises.map((p, i) => (
                  <li key={p.title} className="flex gap-5">
                    <span className="font-display text-[28px] font-bold leading-none text-teal">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-medium text-[17px] text-white">{p.title}</span>
                      <span className="mt-1.5 block text-[15px] leading-relaxed text-white/65">{p.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?kind=consultation" className="pill">
                Talk to our team <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/contact" className="pill pill-line text-white">
                Request a quote
              </Link>
            </div>
            <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-white/65">
              {contactEmail && (
                <p className="flex items-start gap-3">
                  <Mail size={18} aria-hidden className="mt-1 flex-none text-teal" />
                  <span>
                    <span className="block text-sm text-white/50">General enquiries</span>
                    <a href={`mailto:${contactEmail}`} className="font-medium text-white hover:text-teal">
                      {contactEmail}
                    </a>
                  </span>
                </p>
              )}
              <p className="flex items-start gap-3">
                <Phone size={18} aria-hidden className="mt-1 flex-none text-teal" />
                <span>
                  <span className="block text-sm text-white/50">Call{whatsappNumber ? " or WhatsApp" : ""}</span>
                  <span className="flex flex-wrap gap-x-4 gap-y-1">
                    <a href={`tel:${office.phone.tel}`} className="font-medium text-white hover:text-teal">
                      {office.phone.display}
                    </a>
                    {whatsappNumber && (
                      <a href={whatsappUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-teal hover:text-white">
                        <MessageCircle size={15} aria-hidden /> WhatsApp
                      </a>
                    )}
                  </span>
                </span>
              </p>
              <address className="flex items-start gap-3 not-italic">
                <MapPin size={18} aria-hidden className="mt-1 flex-none text-teal" />
                <span>
                  <span className="block text-sm text-white/50">Our office</span>
                  <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium leading-relaxed text-white hover:text-teal">
                    {office.lines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </a>
                </span>
              </address>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { contactEmail } = getPublicConfig();
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Softgress",
    url: `${process.env.SITE_URL ?? "http://localhost:3000"}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "Softgress",
      slogan: "Ideas engineered. Growth accelerated.",
      ...(contactEmail ? { email: contactEmail } : {}),
      address: officeLd,
      telephone: office.phone.tel,
      employee: leaders.map((l) => ({ "@type": "Person", name: l.name, jobTitle: l.role, ...(l.email ? { email: l.email } : {}) })),
    },
  };
  return (
    <>
      <PageHero eyebrow="About Us" title="One roof for everything your business needs to grow." accent="Ideas engineered. Growth accelerated." artworkSlug="strategy">
        Softgress is a digital marketing and software development agency. We plan, build and grow digital products and campaigns as one team.
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#founder-corner" className="pill">
            Meet our leadership <ArrowRight size={16} aria-hidden />
          </a>
          <Link href="/services" className="pill pill-line text-white">
            Explore our services
          </Link>
        </div>
      </PageHero>
      <main id="main" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd).replace(/</g, "\\u003c") }} />

        {/* Who we are */}
        <section aria-labelledby="who-we-are" className="bg-paper">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid gap-14 lg:grid-cols-[1fr_1.05fr] items-center">
            <div>
              <p className="eyebrow text-teal-dark">Who we are</p>
              <h2 id="who-we-are" className="mt-3 font-display text-[34px] sm:text-[48px] leading-[1.08] font-bold tracking-tight text-ink">
                Five teams. One brief. One goal.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-steel">
                Most businesses end up stitching together a developer, an ad agency, a designer and an automation freelancer. Softgress puts all of them under one roof, so your website, campaigns, content and workflows are planned together and pull in the same direction.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-steel">
                Whether you need a new product built, customers found, a brand refreshed or busywork automated, you get one point of contact and a team that sees the whole picture.
              </p>
            </div>
            <Suspense fallback={<p className="text-steel">Loading teams…</p>}>
              <Teams />
            </Suspense>
          </div>
        </section>

        <FounderCorner />

        {/* Values */}
        <section aria-labelledby="values" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
            <SectionTitle id="values">What we believe</SectionTitle>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-[24px] border border-ink/10 bg-paper p-7 card-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-dark text-white">
                    <Icon size={22} aria-hidden />
                  </span>
                  <p className="mt-5 font-display text-[20px] font-bold leading-tight text-ink">{title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-steel">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section aria-labelledby="process" className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
            <SectionTitle id="process" dark>
              How we work
            </SectionTitle>
            <ol className="mt-12 grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {STEPS.map((s, i) => (
                <li key={s} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 hover:border-teal/60 transition-colors">
                  <span className="font-display text-[34px] font-bold text-teal">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 font-medium text-[17px]">{s}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-white/60 text-sm max-w-2xl">Timelines and prices are agreed in a written proposal after scoping. A request on this site is not a contract.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
