/** Portfolio types and labels, safe to import from client components (no project data). */

export const NEEDS = [
  { id: "erp", label: "Business software (ERP)" },
  { id: "crm", label: "Sales & leads (CRM)" },
  { id: "apps", label: "Mobile apps" },
  { id: "stores", label: "Online stores" },
  { id: "websites", label: "Websites" },
  { id: "ai", label: "AI & automation" },
  { id: "platforms", label: "Platforms & marketplaces" },
] as const;

export type NeedId = (typeof NEEDS)[number]["id"];

export const DEMO_STATUS_TEXT = { none: "Case study", coming_soon: "Demo coming soon", live: "Live demo", maintenance: "Demo under maintenance" } as const;
export type DemoStatus = keyof typeof DEMO_STATUS_TEXT;

export type PortfolioProject = {
  slug: string;
  name: string;
  /** One plain-language line: what it does and for whom. */
  tagline: string;
  need: NeedId;
  client: string;
  category: string;
  industry: string | null;
  summary: string;
  description: string | null;
  features: string[];
  techStack: string[];
  demoUrl: string | null;
  demoLogins: { role: string; login: string; secret?: string }[];
  demoStatus: DemoStatus;
  embeddable: boolean;
  media: { id: string; caption: string | null; url: string }[];
};

export function needLabel(id: NeedId) {
  return NEEDS.find((n) => n.id === id)?.label ?? id;
}
