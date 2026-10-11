import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { StatusClient } from "@/components/site/StatusClient";
import { getPublicConfig } from "@/lib/server";

export const metadata: Metadata = { title: "Request status", robots: { index: false } };

async function Form() {
  await connection();
  return <StatusClient devOutbox={getPublicConfig().codeDelivery === "dev_outbox"} />;
}

export default function StatusPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-midnight text-white">
        <div className="mx-auto max-w-xl px-4 py-14">
          <h1 className="text-4xl font-extrabold tracking-tight">Check your request</h1>
          <p className="mt-3 text-white/75">For your security we verify you with a one-time code sent to the contact you used. Reference codes alone never reveal request details.</p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <Form />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
