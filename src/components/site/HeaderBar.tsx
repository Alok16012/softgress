"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

export interface MenuGroup {
  slug: string;
  name: string;
  services: { slug: string; title: string }[];
}

const LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/work", label: "Work" },
  { href: "/status", label: "Request status" },
  { href: "/contact", label: "Contact Us" },
];

/**
 * Fixed site navigation. Transparent over the hero, solid once the page scrolls.
 * "Services" opens an Apexon-style mega menu (hover, click or keyboard); phones get a full-screen menu.
 */
export function HeaderBar({ menu }: { menu: MenuGroup[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus after navigating. Adjusting state during render avoids an extra effect pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!megaOpen && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const servicesActive = pathname.startsWith("/services") || pathname.startsWith("/departments");
  const solid = scrolled || megaOpen;

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 border-b",
          solid ? "bg-midnight/95 backdrop-blur-md border-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]" : "bg-transparent border-transparent",
        )}
        onMouseLeave={closeMegaSoon}
      >
        <div className={clsx("mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 transition-[height] duration-300", scrolled ? "h-[68px]" : "h-[84px]")}>
          <Logo priority />

          <nav aria-label="Main" className="ml-auto hidden lg:flex items-center gap-1 text-[16px]">
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="mega-services"
              onClick={() => setMegaOpen((o) => !o)}
              onMouseEnter={openMega}
              className={clsx(
                "relative flex items-center gap-1.5 px-3.5 py-2 transition-colors hover:text-white",
                servicesActive || megaOpen ? "text-white" : "text-[#c9c9c9]",
              )}
            >
              Services
              <ChevronDown size={16} aria-hidden className={clsx("transition-transform duration-200", megaOpen && "rotate-180")} />
              {servicesActive && <span aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-teal" />}
            </button>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={closeMegaSoon}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={clsx("relative px-3.5 py-2 transition-colors hover:text-white", isActive(l.href) ? "text-white" : "text-[#c9c9c9]")}
              >
                {l.label}
                {isActive(l.href) && <span aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-teal" />}
              </Link>
            ))}
            <Link href="/contact" onMouseEnter={closeMegaSoon} className="pill ml-4 !py-2.5 !px-5 !text-[14px]">
              Start a project
            </Link>
          </nav>

          <button
            type="button"
            className="ml-auto lg:hidden grid place-items-center w-11 h-11 rounded-full text-white hover:bg-white/10"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} aria-hidden />
          </button>
        </div>

        {/* Desktop mega menu */}
        <div
          id="mega-services"
          hidden={!megaOpen}
          onMouseEnter={openMega}
          className="hidden lg:block absolute inset-x-0 top-full max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-white/10 bg-[#04060f] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
        >
          {megaOpen && (
            <div className="mx-auto grid max-w-7xl grid-cols-[260px_1fr] gap-12 px-6 py-10">
              <div className="border-r border-white/10 pr-10">
                <p className="eyebrow text-teal">What we do</p>
                <p className="mt-3 font-display text-[26px] font-bold leading-tight text-white">Five teams under one roof.</p>
                <p className="mt-3 text-sm text-white/60">Every project is scoped to your goals. Prices are shown only where published.</p>
                <Link href="/services" className="pill mt-6 !py-2.5 !px-5 !text-[14px]">
                  All services <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-x-10 gap-y-8">
                {menu.map((g) => (
                  <div key={g.slug}>
                    <Link href={`/departments/${g.slug}`} className="font-display text-[19px] font-bold text-teal hover:text-white">
                      {g.name}
                    </Link>
                    <ul className="mt-3 space-y-1.5">
                      {g.services.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/services/${s.slug}`} className="text-[14px] text-white/80 hover:text-white">
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile full-screen menu: a sibling of <header>, whose backdrop blur would otherwise trap position:fixed. */}
      {mobileOpen && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="sky fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden">
          <div className="flex h-[84px] flex-none items-center justify-between px-4 sm:px-6">
            <Logo priority />
            <button type="button" className="grid place-items-center w-11 h-11 rounded-full text-white hover:bg-white/10" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X size={24} aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 px-4 sm:px-6 pb-10">
            <ul className="border-t border-white/10">
              <li className="border-b border-white/10">
                <Link href="/" className="block py-4 font-display text-2xl font-bold text-white">
                  Home
                </Link>
              </li>
              <li className="border-b border-white/10">
                <details className="group/acc">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-2xl font-bold text-white">
                    Services
                    <ChevronDown size={22} aria-hidden className="transition-transform group-open/acc:rotate-180" />
                  </summary>
                  <div className="space-y-6 pb-6">
                    <Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-teal">
                      All services <ArrowRight size={14} aria-hidden />
                    </Link>
                    {menu.map((g) => (
                      <div key={g.slug}>
                        <Link href={`/departments/${g.slug}`} className="font-display text-lg font-bold text-teal">
                          {g.name}
                        </Link>
                        <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {g.services.map((s) => (
                            <li key={s.slug}>
                              <Link href={`/services/${s.slug}`} className="text-[15px] text-white/80">
                                {s.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              </li>
              {LINKS.map((l) => (
                <li key={l.href} className="border-b border-white/10">
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={clsx("block py-4 font-display text-2xl font-bold", isActive(l.href) ? "text-teal" : "text-white")}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="pill mt-8 w-full">
              Start a project <ArrowRight size={16} aria-hidden />
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

/** Hook-free stand-in shown while the menu data streams in (usePathname may not run outside Suspense). */
export function HeaderFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-transparent">
      <div className="mx-auto flex h-[84px] max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo priority />
        <nav aria-label="Main" className="ml-auto hidden lg:flex items-center gap-1 text-[16px] text-[#c9c9c9]">
          <Link href="/services" className="px-3.5 py-2 hover:text-white">
            Services
          </Link>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="px-3.5 py-2 hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="pill ml-4 !py-2.5 !px-5 !text-[14px]">
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}
