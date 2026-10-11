"use client";
import dynamic from "next/dynamic";
import type { ClientCatalog } from "./ui/CatalogContext";

// The tour is a client-only enhancement; the page is fully usable without it.
const TourApp = dynamic(() => import("./TourApp"), {
  ssr: false,
  loading: () => (
    <section aria-label="Loading the virtual tour" className="relative h-[100svh] min-h-[560px] w-full grid place-items-center bg-midnight text-white">
      <div className="text-center px-6">
        <p className="font-semibold tracking-[0.3em] text-sm text-mint">SOFTGRESS · VIRTUAL HQ</p>
        <p className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Ideas engineered. Growth accelerated.</p>
        <p className="mt-3 text-white/70">Loading the interactive campus…</p>
        <a href="#directory" className="mt-5 inline-block underline text-white/80">
          Skip to services
        </a>
      </div>
    </section>
  ),
});

export default function TourClient({ catalog }: { catalog: ClientCatalog }) {
  return <TourApp catalog={catalog} />;
}
