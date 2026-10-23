import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Suspense } from "react";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { ClientShell } from "@/components/site/ClientShell";
import { ContactClient } from "@/components/site/ContactClient";
import { ContactTabs } from "@/components/site/ContactTabs";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { enquiryGroups } from "@/lib/enquiry";
import { loadClientCatalog } from "@/lib/data";
import { REQUEST_KINDS, type RequestKind } from "@/lib/types";
import { catalogOnly } from "@/lib/env";
import { office, officeLd, whatsappUrl } from "@/content/company";
import { leaders } from "@/content/leadership";
import { getPublicConfig } from "@/lib/server";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Softgress: call or WhatsApp +91 74472 07700, email info@softgress.com, visit our office in Akurdi, Pimpri-Chinchwad, or send a project request.",
  alternates: { canonical: "/contact" },
};

async function Flow({ searchParams }: { searchParams: PageProps<"/contact">["searchParams"] }) {
  const sp = await searchParams;
  const rawKind = typeof sp.kind === "string" ? sp.kind : null;
  const kind = rawKind && (REQUEST_KINDS as readonly string[]).includes(rawKind) ? (rawKind as RequestKind) : null;
  const service = typeof sp.service === "string" && /^[a-z0-9-]{2,60}$/.test(sp.service) ? sp.service : null;
  const catalog = await loadClientCatalog();
  const available = !catalogOnly();
  const { contactEmail, whatsappNumber } = catalog.config;
  // Links that name a request type, a service or ?form=project open the full flow; everything else starts with the quick enquiry.
  const initial = kind || service || sp.form === "project" ? "project" : "enquiry";
  return (
    <ClientShell catalog={catalog}>
      <ContactTabs
        initial={initial}
        enquiry={
          <EnquiryForm
            groups={enquiryGroups(catalog.departments, catalog.services)}
            whatsappNumber={whatsappNumber}
            mode={available ? "save" : "direct"}
            directWhatsapp={whatsappNumber ?? office.phone.tel}
            directEmail={contactEmail}
            initialService={service ?? ""}
          />
        }
        project={
          available ? (
            <ContactClient kind={kind} service={service} />
          ) : (
            <div className="glass rounded-[28px] p-6 sm:p-8">
              <h3 className="text-xl font-semibold">Online project requests are opening soon</h3>
              <p className="mt-3 text-white/75">
                Until then, use the quick enquiry form, call us on {office.phone.display} or message us on WhatsApp, and we&apos;ll help you scope your project.
              </p>
              <Link href="/services" className="mt-5 inline-block underline text-teal">Explore our services</Link>
            </div>
          )
        }
      />
    </ClientShell>
  );
}

function ContactCards() {
  const { contactEmail, whatsappNumber } = getPublicConfig();
  const cards = [
    {
      icon: Phone,
      label: "Call us",
      value: office.phone.display,
      note: "Speak to the Softgress team directly.",
      href: `tel:${office.phone.tel}`,
      action: "Call now",
      external: false,
    },
    whatsappNumber && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: office.phone.display,
      note: "Send us a message and share files on chat.",
      href: whatsappUrl(whatsappNumber),
      action: "Chat on WhatsApp",
      external: true,
    },
    contactEmail && {
      icon: Mail,
      label: "Write to us",
      value: contactEmail,
      note: "Send your brief, questions or documents.",
      href: `mailto:${contactEmail}`,
      action: "Send an email",
      external: false,
    },
    {
      icon: MapPin,
      label: "Visit us",
      value: "Akurdi, Pimpri-Chinchwad",
      note: office.lines.join(", "),
      href: office.mapsUrl,
      action: "Get directions",
      external: true,
    },
  ].filter((c): c is Exclude<typeof c, false | null | undefined | ""> => Boolean(c));

  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {cards.map(({ icon: Icon, label, value, note, href, action, external }) => (
        <li key={label}>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group flex h-full flex-col rounded-[24px] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-teal/60 hover:bg-white/[0.06]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-teal text-midnight">
              <Icon size={22} aria-hidden />
            </span>
            <span className="mt-5 eyebrow text-teal">{label}</span>
            <span className="mt-2 break-words font-display text-[20px] font-bold leading-tight text-white">{value}</span>
            <span className="mt-2 flex-1 text-[15px] leading-relaxed text-white/60">{note}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal group-hover:text-white">
              {action} <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function ContactAside() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start" aria-label="Office and leadership">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
        <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="group relative block h-44 overflow-hidden bg-[radial-gradient(120%_120%_at_30%_20%,#1d6ee4_0%,#0a1226_55%,#04060f_100%)]">
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(183,223,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(183,223,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <span aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute inset-0 -m-4 rounded-full bg-teal/25 motion-safe:animate-ping" />
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-teal text-midnight shadow-[0_10px_30px_-5px_rgba(183,223,255,0.6)]">
              <MapPin size={26} />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-midnight/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur group-hover:text-teal">
            Open in Google Maps
          </span>
        </a>
        <div className="p-6">
          <p className="eyebrow text-teal">Our office</p>
          <address className="mt-3 not-italic">
            <span className="block font-display text-[19px] font-bold text-white">{office.name}</span>
            {office.lines.map((l) => (
              <span key={l} className="block text-[15px] leading-relaxed text-white/70">
                {l}
              </span>
            ))}
          </address>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="pill !py-2.5 !px-4 !text-[13px]">
              Get directions <ArrowRight size={14} aria-hidden />
            </a>
            <a href={`tel:${office.phone.tel}`} className="pill pill-line !py-2.5 !px-4 !text-[13px] text-white">
              {office.phone.display}
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="eyebrow text-teal">Talk to our directors</p>
        <ul className="mt-5 space-y-5">
          {leaders.map((l) => (
            <li key={l.name} className="flex items-center gap-4">
              {l.photo ? (
                <Image src={l.photo} alt="" width={56} height={56} className="h-14 w-14 flex-none rounded-full object-cover object-top ring-2 ring-white/10" />
              ) : (
                <span aria-hidden className="grid h-14 w-14 flex-none place-items-center rounded-full bg-midnight-3 font-bold text-white">
                  {l.name[0]}
                </span>
              )}
              <span className="min-w-0">
                <span className="block font-bold text-white">{l.name}</span>
                <span className="block text-sm text-white/55">{l.role}</span>
                {l.email && (
                  <a href={`mailto:${l.email}`} className="mt-0.5 block truncate text-sm font-medium text-teal hover:text-white">
                    {l.email}
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/about#founder-corner" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-teal">
          Meet the leadership <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <p className="eyebrow text-teal">What happens next</p>
        <ol className="mt-5 space-y-4">
          {[
            "Send your request. You get a reference code straight away.",
            "A Softgress team member reviews your brief.",
            "We reply on the channel you prefer: call, WhatsApp or email.",
          ].map((t, i) => (
            <li key={t} className="flex gap-4">
              <span className="font-display text-[22px] font-bold leading-none text-teal">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] leading-relaxed text-white/70">{t}</span>
            </li>
          ))}
        </ol>
        <Link href="/status" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-teal">
          Already sent one? Check its status <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}

export default function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { contactEmail, whatsappNumber } = getPublicConfig();
  const contactLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Softgress",
    url: `${process.env.SITE_URL ?? "http://localhost:3000"}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: office.name,
      telephone: office.phone.tel,
      ...(contactEmail ? { email: contactEmail } : {}),
      address: officeLd,
    },
  };
  return (
    <>
      <PageHero eyebrow="Contact us" title="Let's talk about your next project." accent="Call, WhatsApp, email or visit us.">
        Tell us what you want to build or grow. Reach the team directly, or send a request below and get a reference code instantly.
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`tel:${office.phone.tel}`} className="pill">
            <Phone size={16} aria-hidden /> {office.phone.display}
          </a>
          {whatsappNumber && (
            <a href={whatsappUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="pill pill-line text-white">
              <MessageCircle size={16} aria-hidden /> WhatsApp us
            </a>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="pill pill-line text-white">
              <Mail size={16} aria-hidden /> {contactEmail}
            </a>
          )}
        </div>
      </PageHero>
      <main id="main" className="flex-1 bg-[#050711] text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd).replace(/</g, "\\u003c") }} />
        <section aria-label="Ways to reach us" className="mx-auto max-w-7xl px-4 sm:px-6 pt-16">
          <ContactCards />
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-14">
          <section aria-labelledby="start-project">
            <p className="eyebrow text-teal">Send an enquiry</p>
            <h2 id="start-project" className="mt-3 font-display text-[32px] sm:text-[44px] leading-tight font-bold tracking-tight">
              Start a project
            </h2>
            <p className="mt-3 mb-8 max-w-2xl text-lg text-white/70">
              Ask us anything with the quick enquiry form, or switch to a full project request for a quote, consultation, callback or brief. Prefer to browse first?{" "}
              <Link href="/services" className="underline underline-offset-4 text-teal">
                See our services
              </Link>
              .
            </p>
            <Suspense fallback={<p className="text-white/60">Loading the form…</p>}>
              <Flow searchParams={searchParams} />
            </Suspense>
          </section>
          <ContactAside />
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
