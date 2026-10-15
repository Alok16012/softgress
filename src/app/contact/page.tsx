import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { ClientShell } from "@/components/site/ClientShell";
import { ContactClient } from "@/components/site/ContactClient";
import { loadClientCatalog } from "@/lib/data";
import { REQUEST_KINDS, type RequestKind } from "@/lib/types";
import { catalogOnly } from "@/lib/env";

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
  const available = !catalogOnly();
  return (
    <ClientShell catalog={catalog}>
      {available ? <ContactClient kind={kind} service={service} /> : (
        <div className="rounded-2xl border border-white/15 p-6">
          <h2 className="text-xl font-semibold">Online requests are opening soon</h2>
          <p className="mt-3 text-white/75">Please check back soon to request a quote, consultation or callback.</p>
          <Link href="/services" className="mt-5 inline-block underline text-teal">Explore our services</Link>
        </div>
      )}
      <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm text-white/75">
        {catalog.config.contactEmail ? (
          <p>
            Prefer email? <a className="underline text-white" href={`mailto:${catalog.config.contactEmail}`}>{catalog.config.contactEmail}</a>
          </p>
        ) : (
          available && <p>The request form above is the way to reach the team from this website.</p>
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
      <PageHero eyebrow="Contact us" title="Start a project">
        Explore how Softgress can help with your next project. Prefer to browse first?{" "}
        <Link href="/services" className="underline underline-offset-4 text-teal">See our services</Link>.
      </PageHero>
      <main id="main" className="flex-1 bg-[#050711] text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
          <div>
            <Suspense fallback={<p className="text-white/60">Loading the form…</p>}>
              <Flow searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
