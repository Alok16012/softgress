import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHero, SiteFooter } from "@/components/site/SiteChrome";
import { StatusClient } from "@/components/site/StatusClient";
import { getPublicConfig } from "@/lib/server";
import { catalogOnly } from "@/lib/env";

export const metadata: Metadata = { title: "Request status", robots: { index: false } };

async function Form() {
  await connection();
  if (catalogOnly()) return <p className="text-white/75">Online request tracking is opening soon. Please check back later.</p>;
  return <StatusClient devOutbox={getPublicConfig().codeDelivery === "dev_outbox"} />;
}

export default function StatusPage() {
  return (
    <>
      <PageHero eyebrow="Request status" title="Check your request">
        For your security we verify you with a one-time code sent to the contact you used. Reference codes alone never reveal request details.
      </PageHero>
      <main id="main" className="flex-1 bg-[#050711] text-white">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-16">
          <div>
            <Suspense fallback={null}>
              <Form />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
