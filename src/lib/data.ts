import "server-only";
import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { getCatalog } from "@/lib/catalog";
import { getPublicConfig } from "@/lib/server";
import type { ClientCatalog } from "@/components/ui/CatalogContext";

/**
 * Request-time catalogue read for server components. `connection()` keeps the
 * database out of build-time prerendering (PGlite is single-process).
 */
export async function loadCatalog() {
  await connection();
  return getCatalog(await getDb());
}

export async function loadClientCatalog(): Promise<ClientCatalog> {
  const c = await loadCatalog();
  return { departments: c.departments, services: c.services, projects: c.projects, config: getPublicConfig() };
}
