import type { Db } from "@/lib/db/driver";
import { listDepartments, listKnowledge, listProjects, listServices } from "@/lib/db/repository";
import type { Department, KnowledgeDocument, Project, Service } from "@/lib/types";
import { buildCorpus, type RetrievalDoc } from "@/lib/ai/retrieval";

export interface Catalog {
  departments: Department[];
  services: Service[];
  projects: Project[];
  knowledge: KnowledgeDocument[];
  corpus: RetrievalDoc[];
  loadedAt: number;
}

declare global {
  var __sgCatalog: { value: Catalog; version: number } | undefined;
  var __sgCatalogVersion: number | undefined;
}

const TTL_MS = 30_000;

/** In-process catalogue cache used by the chat route. Admin edits call invalidateCatalog(). */
export async function getCatalog(db: Db): Promise<Catalog> {
  const version = globalThis.__sgCatalogVersion ?? 0;
  const c = globalThis.__sgCatalog;
  if (c && c.version === version && Date.now() - c.value.loadedAt < TTL_MS) return c.value;
  const [departments, services, projects, knowledge] = await Promise.all([
    listDepartments(db),
    listServices(db),
    listProjects(db),
    listKnowledge(db, { approvedOnly: true }),
  ]);
  const value: Catalog = {
    departments,
    services,
    projects,
    knowledge,
    corpus: buildCorpus(knowledge, services),
    loadedAt: Date.now(),
  };
  globalThis.__sgCatalog = { value, version };
  return value;
}

export function invalidateCatalog() {
  globalThis.__sgCatalogVersion = (globalThis.__sgCatalogVersion ?? 0) + 1;
}
