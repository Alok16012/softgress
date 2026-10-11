import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-[0.18em] text-sm text-ink">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-teal text-midnight text-xs">S</span>
          SOFTGRESS
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-1 text-sm font-medium text-ink/80">
          <Link className="px-3 py-2 rounded-lg hover:bg-ink/5" href="/services">
            Services
          </Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-ink/5 hidden sm:inline" href="/work">
            Work
          </Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-ink/5 hidden sm:inline" href="/status">
            Request status
          </Link>
          <Link className="ml-2 inline-flex items-center rounded-xl bg-midnight text-white px-4 py-2 font-semibold hover:bg-midnight-3" href="/contact">
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-extrabold tracking-[0.18em] text-white">SOFTGRESS</p>
          <p className="mt-2">Ideas engineered. Growth accelerated.</p>
          <p className="mt-2 text-white/55">Digital marketing &amp; software development agency.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2">
            <li><Link href="/services" className="hover:text-white">All services</Link></li>
            <li><Link href="/work" className="hover:text-white">Work &amp; samples</Link></li>
            <li><Link href="/contact" className="hover:text-white">Request a quote or consultation</Link></li>
            <li><Link href="/status" className="hover:text-white">Check request status</Link></li>
          </ul>
        </nav>
        <div>
          <ul className="space-y-2">
            <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
            <li><Link href="/?view=2d" className="hover:text-white">Simple 2D tour</Link></li>
          </ul>
          <p className="mt-4 text-xs text-white/45">The AI guides in the virtual office are AI assistants, not employees.</p>
        </div>
      </div>
    </footer>
  );
}
