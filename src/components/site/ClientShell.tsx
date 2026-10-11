"use client";
import type { ReactNode } from "react";
import { CatalogProvider, type ClientCatalog } from "@/components/ui/CatalogContext";

/** Provides the catalogue to client widgets on regular (non-tour) pages. */
export function ClientShell({ catalog, children }: { catalog: ClientCatalog; children: ReactNode }) {
  return <CatalogProvider value={catalog}>{children}</CatalogProvider>;
}
