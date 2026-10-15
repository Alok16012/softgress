import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { deptIcon } from "./Art";
import { SiteHeader } from "./SiteChrome";

const PILLARS = [
  { slug: "software", label: "Software Development" },
  { slug: "marketing", label: "Digital Marketing" },
  { slug: "creative", label: "Creative Studio" },
  { slug: "automation", label: "AI & Automation" },
];

/** Original digital ecosystem artwork with a dark scrim behind the headline. */
export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="sky relative min-h-[100svh] w-full overflow-hidden text-white">
      <Image src="/images/hero.webp" alt="" fill preload sizes="(max-width: 639px) 1800px, 100vw" className="object-cover object-[65%_center] sm:object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,15,0.92)_0%,rgba(4,6,15,0.55)_48%,rgba(4,6,15,0.2)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060f]/95 via-[#04060f]/20 to-[#04060f]/30" />
      <SiteHeader />
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:pb-24">
        <div className="max-w-2xl">
          <p className="eyebrow text-teal">Softgress</p>
          <h1 id="hero-title" className="mt-4 font-display text-[44px] leading-[1.02] sm:text-[64px] font-bold tracking-tight">
            Ideas engineered.
            <span className="block text-[26px] sm:text-[34px] leading-tight text-teal">Growth accelerated.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            Websites, apps, SEO and ads, brand and video, and practical AI automation: planned, built and grown by one agency.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="pill">
              Request a quote <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/services" className="pill pill-line text-white">
              Explore our services
            </Link>
          </div>
        </div>
        <ul className="hidden sm:flex flex-col items-start gap-3 lg:items-end">
          {PILLARS.map((p) => {
            const Icon = deptIcon(p.slug);
            return (
              <li key={p.slug}>
                <Link href={`/departments/${p.slug}`} className="flex items-center gap-4 font-display text-2xl lg:text-[28px] font-bold hover:text-teal lg:flex-row-reverse">
                  <Icon size={26} strokeWidth={1.6} aria-hidden />
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
