"use client";
import type { ReactNode } from "react";
import { CatalogProvider, type ClientCatalog } from "@/components/ui/CatalogContext";

/** Provides the catalogue to client widgets such as the request form. */
export function ClientShell({ catalog, children }: { catalog: ClientCatalog; children: ReactNode }) {
  return <CatalogProvider value={catalog}>{children}</CatalogProvider>;
}
