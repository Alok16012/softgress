import Link from "next/link";
import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { office, whatsappUrl } from "@/content/company";
import { locations } from "@/content/locations";
import { loadCatalog } from "@/lib/data";
import { getPublicConfig } from "@/lib/server";
import { HeaderBar, HeaderFallback, type MenuGroup } from "./HeaderBar";
import { EnquiryPopup } from "./EnquiryPopup";
import { enquiryGroups } from "@/lib/enquiry";
import { catalogOnly } from "@/lib/env";
import { Logo } from "./Logo";

/** Fixed navigation; the Services mega menu is filled from the live catalogue. */
export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderWithMenu />
    </Suspense>
  );
}

async function HeaderWithMenu() {
  const { departments, services } = await loadCatalog();
  const menu: MenuGroup[] = departments
    .filter((d) => d.slug !== "reception" && d.active)
    .map((d) => ({ slug: d.slug, name: d.name, services: services.filter((s) => s.departmentSlug === d.slug).map((s) => ({ slug: s.slug, title: s.title })) }));
  const { contactEmail, whatsappNumber } = getPublicConfig();
  return (
    <>
      <HeaderBar menu={menu} />
      {/* Short enquiry pop-up: opens shortly after a visitor lands on any public page. */}
      <EnquiryPopup
        groups={enquiryGroups(departments, services)}
        whatsappNumber={whatsappNumber}
        mode={catalogOnly() ? "direct" : "save"}
        directWhatsapp={whatsappNumber ?? office.phone.tel}
        directEmail={contactEmail}
        phoneDisplay={office.phone.display}
        phoneTel={office.phone.tel}
      />
    </>
  );
}

/** Inner-page banner: night-sky backdrop, breadcrumb, big headline and a pale-blue subline. */
export function PageHero({
  eyebrow,
  title,
  accent,
  children,
  crumbs,
  artworkSlug,
}: {
  eyebrow?: string;
  title: ReactNode;
  accent?: ReactNode;
  children?: ReactNode;
  crumbs?: ReactNode;
  artworkSlug?: string;
}) {
  return (
    <section className="sky relative overflow-hidden text-white">
      <Image
        src={`/images/${artworkSlug && ["software", "marketing", "creative", "automation", "strategy"].includes(artworkSlug) ? artworkSlug : "hero"}.webp`}
        alt=""
        fill
        sizes="(max-width: 639px) 1000px, 100vw"
        className="object-cover object-right opacity-65 sm:object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,15,0.98)_0%,rgba(4,6,15,0.85)_45%,rgba(4,6,15,0.4)_100%)]" />
      <SiteHeader />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-36 pb-20 sm:pt-44 sm:pb-28">
        {crumbs && <div className="mb-5 text-sm text-white/60">{crumbs}</div>}
        {eyebrow && <p className="eyebrow text-teal">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl text-[40px] leading-[1.05] sm:text-[60px] font-bold tracking-tight">{title}</h1>
        {accent && <p className="mt-2 max-w-3xl text-2xl sm:text-[30px] leading-tight font-display font-bold text-teal">{accent}</p>}
        {children && <div className="mt-6 max-w-2xl text-lg text-white/85 leading-relaxed">{children}</div>}
      </div>
    </section>
  );
}

/** Section heading in the Apexon style: big bold title with an optional round arrow link. */
export function SectionTitle({ id, children, href, dark = false }: { id?: string; children: ReactNode; href?: string; dark?: boolean }) {
  const cls = `font-display text-[32px] sm:text-[44px] leading-tight font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`;
  if (!href)
    return (
      <h2 id={id} className={cls}>
        {children}
      </h2>
    );
  return (
    <h2 id={id} className={cls}>
      <Link href={href} className="group inline-flex items-center gap-4">
        {children}
        <span className="arrow-dot w-11 h-11">
          <ArrowRight size={20} aria-hidden />
        </span>
      </Link>
    </h2>
  );
}

async function FooterSitemap() {
  const { departments, services } = await loadCatalog();
  const { contactEmail, whatsappNumber } = getPublicConfig();
  const depts = departments.filter((d) => d.slug !== "reception" && d.active);
  return (
    <>
      {contactEmail && (
        <a href={`mailto:${contactEmail}`} className="mt-8 inline-block text-[22px] font-semibold text-white hover:text-teal">
          {contactEmail}
        </a>
      )}
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
        <a href={`tel:${office.phone.tel}`} className="inline-flex items-center gap-2 font-medium text-white hover:text-teal">
          <Phone size={17} aria-hidden className="text-teal" /> {office.phone.display}
        </a>
        {whatsappNumber && (
          <a href={whatsappUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-white hover:text-teal">
            <MessageCircle size={17} aria-hidden className="text-teal" /> WhatsApp us
          </a>
        )}
      </div>
      <address className="mt-3 not-italic">
        <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-[15px] leading-relaxed text-white/70 hover:text-teal">
          <MapPin size={18} aria-hidden className="mt-0.5 flex-none text-teal" />
          <span>{office.lines.join(", ")}</span>
        </a>
      </address>
      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link href="/locations" className="font-display text-2xl sm:text-[28px] font-bold text-teal hover:text-white">
            Locations
          </Link>
          <ul className="mt-4 space-y-2">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="text-[15px] font-medium text-white hover:text-teal">
                  {l.name === "International" ? "International clients" : `Softgress in ${l.name}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {depts.map((d) => (
          <div key={d.slug}>
            <Link href={`/departments/${d.slug}`} className="font-display text-2xl sm:text-[28px] font-bold text-teal hover:text-white">
              {d.name}
            </Link>
            <ul className="mt-4 space-y-2">
              {services
                .filter((s) => s.departmentSlug === d.slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="text-[15px] font-medium text-white hover:text-teal">
                      {s.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

/** `cta={false}` drops the "How can we help you?" band on pages that already are the contact flow. */
export function SiteFooter({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="bg-[#050711] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-10">
        {cta && (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-end border-b border-white/10 pb-14">
            <div>
              <h2 className="font-display text-[36px] sm:text-[48px] leading-tight font-bold">How can we help you?</h2>
              <p className="mt-4 max-w-xl text-white/70 text-lg">
                Tell us about your project. You&apos;ll get a reference code, and a Softgress team member will reply.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/contact" className="pill">
                Request a quote <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/contact?kind=consultation" className="pill pill-line text-white">
                Book a consultation
              </Link>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <FooterSitemap />
        </Suspense>

        <div className="mt-16 grid gap-6 sm:grid-cols-[auto_1fr] items-center border-t border-white/10 pt-8">
          <Logo />
          <div className="sm:text-right text-[12px] text-white/40 space-y-1">
            <p>
              <span className="text-white/70">Ideas engineered. Growth accelerated.</span> · Digital marketing &amp; software development agency.
            </p>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end pt-1 text-white">
              <Link href="/get-started" className="hover:text-teal">Get started</Link>
              <Link href="/about" className="hover:text-teal">About us</Link>
              <Link href="/about#founder-corner" className="hover:text-teal">Founder corner</Link>
              <Link href="/services" className="hover:text-teal">All services</Link>
              <Link href="/work" className="hover:text-teal">Work &amp; samples</Link>
              <Link href="/locations" className="hover:text-teal">Locations</Link>
              <Link href="/contact" className="hover:text-teal">Request a quote or consultation</Link>
              <Link href="/status" className="hover:text-teal">Check request status</Link>
              <Link href="/privacy" className="hover:text-teal">Privacy notice</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
