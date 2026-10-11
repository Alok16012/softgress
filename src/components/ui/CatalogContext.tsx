"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { Department, Project, Service } from "@/lib/types";
import type { PublicConfig } from "@/lib/server";

export interface ClientCatalog {
  departments: Department[];
  services: Service[];
  projects: Project[];
  config: PublicConfig;
}

const Ctx = createContext<ClientCatalog | null>(null);

export function CatalogProvider({ value, children }: { value: ClientCatalog; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog(): ClientCatalog {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCatalog outside CatalogProvider");
  return v;
}

export { priceLabel } from "@/lib/pricing";
