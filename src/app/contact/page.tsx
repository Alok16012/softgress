import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { ClientShell } from "@/components/site/ClientShell";
import { ContactClient } from "@/components/site/ContactClient";
import { loadClientCatalog } from "@/lib/data";
import { REQUEST_KINDS, type RequestKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Request a quote, book a consultation, request a callback or send a project brief to Softgress.",
  alternates: { canonical: "/contact" },
};

async function Flow({ searchParams }: { searchParams: PageProps<"/contact">["searchParams"] }) {
  const sp = await searchParams;
  const rawKind = typeof sp.kind === "string" ? sp.kind : null;
  const kind = rawKind && (REQUEST_KINDS as readonly string[]).includes(rawKind) ? (rawKind as RequestKind) : null;
  const service = typeof sp.service === "string" && /^[a-z0-9-]{2,60}$/.test(sp.service) ? sp.service : null;
  const catalog = await loadClientCatalog();
  return (
    <ClientShell catalog={catalog}>
      <ContactClient kind={kind} service={service} />
      <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm text-white/75">
        {catalog.config.contactEmail ? (
          <p>
            Prefer email? <a className="underline text-white" href={`mailto:${catalog.config.contactEmail}`}>{catalog.config.contactEmail}</a>
          </p>
        ) : (
          <p>The request form above is the way to reach the team from this website.</p>
        )}
        {catalog.config.whatsappNumber && (
          <p>
            WhatsApp: <a className="underline text-white" href={`https://wa.me/${catalog.config.whatsappNumber.replace(/^\+/, "")}`} rel="noopener noreferrer" target="_blank">message us</a>
          </p>
        )}
      </div>
    </ClientShell>
  );
}

export default function ContactPage({ searchParams }: PageProps<"/contact">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-midnight text-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Start a project</h1>
          <p className="mt-3 text-lg text-white/75">
            Tell us what you need. You&apos;ll get a reference code, and a Softgress team member will reply. Prefer to explore first?{" "}
            <Link href="/" className="underline">Visit the virtual office</Link>.
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="text-white/60">Loading the form…</p>}>
              <Flow searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
