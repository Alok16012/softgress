import "server-only";
import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { getCatalog } from "@/lib/catalog";
import { getPublicConfig } from "@/lib/server";
import type { ClientCatalog } from "@/components/ui/CatalogContext";
import { catalogOnly } from "@/lib/env";
import { departments } from "@/content/departments";
import { services } from "@/content/services";
import { projects } from "@/content/projects";

/**
 * Request-time catalogue read for server components. `connection()` keeps the
 * database out of build-time prerendering (PGlite is single-process).
 */
export async function loadCatalog() {
  await connection();
  if (catalogOnly()) {
    return {
      departments: departments.filter((d) => d.active),
      services: services.filter((s) => s.active && departments.some((d) => d.slug === s.departmentSlug && d.active)),
      projects: projects.filter((p) => p.published),
      knowledge: [],
      corpus: [],
      loadedAt: Date.now(),
    };
  }
  return getCatalog(await getDb());
}

export async function loadClientCatalog(): Promise<ClientCatalog> {
  const c = await loadCatalog();
  return { departments: c.departments, services: c.services, projects: c.projects, config: getPublicConfig() };
}
