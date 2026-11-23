import data from "./portfolio.json";

/**
 * Softgress portfolio: delivered software projects shown on /work.
 * Live demos are static, sample-data copies served from public/demos/<project>/
 * (or an external demo URL); screenshots live in public/work-shots/.
 */

import type { PortfolioProject } from "./portfolio-meta";

export * from "./portfolio-meta";

export const portfolio = data as unknown as PortfolioProject[];

/** Shown first on /work and on the homepage. */
export const FEATURED_SLUGS = ["pushpak-ac-service", "careeroptics-erp", "hotel-sales-command-center", "ridewallah", "airawat-store", "xeal-whatsapp-crm"];

export const featuredProjects = FEATURED_SLUGS.map((s) => portfolio.find((p) => p.slug === s)).filter((p): p is PortfolioProject => !!p);

export function getProject(slug: string) {
  return portfolio.find((p) => p.slug === slug);
}
