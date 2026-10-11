// Shared domain types. Persistence shapes live in src/lib/db/repository.ts.

export const DEPARTMENT_SLUGS = [
  "reception",
  "software",
  "marketing",
  "creative",
  "automation",
  "strategy",
] as const;
export type DepartmentSlug = (typeof DEPARTMENT_SLUGS)[number];

export const SCENE_IDS = [
  "campus",
  "reception",
  "software",
  "marketing",
  "creative",
  "automation",
  "strategy",
  "rooftop",
] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export type PricingType = "custom" | "starting_at" | "fixed";

export interface Department {
  slug: DepartmentSlug;
  name: string;
  shortName: string;
  description: string;
  sceneId: SceneId;
  active: boolean;
}

export interface Service {
  slug: string;
  departmentSlug: DepartmentSlug;
  title: string;
  summary: string;
  description: string;
  deliverables: string[];
  process: string[];
  whatWeNeed: string[];
  keywords: string[];
  pricingType: PricingType;
  /** Minor units are NOT used; whole currency amount. Null unless published by an admin. */
  startingPrice: number | null;
  currency: string;
  active: boolean;
}

export interface KnowledgeDocument {
  id: string;
  /** null = shared across all departments */
  departmentSlug: DepartmentSlug | null;
  title: string;
  body: string;
  visibility: "public" | "internal";
  approvedAt: string | null;
  version: number;
  isSeed: boolean;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  body: string;
  serviceSlugs: string[];
  industry: string;
  /** Sample/concept work must be explicitly labelled in every surface. */
  isSample: boolean;
  published: boolean;
}

export interface StaffRole {
  id: string;
  displayName: string;
  roleTitle: string;
  departmentSlug: DepartmentSlug;
  sceneId: SceneId;
  tone: string;
  scope: string;
  greeting: { en: string; hinglish: string };
  exampleQuestions: string[];
  discoveryFocus: string[];
  escalation: string;
  cta: { label: string; action: "quote" | "consultation" | "brief" | "callback" };
  appearance: {
    skin: string;
    hair: string;
    top: string;
    bottom: string;
    hairStyle: "short" | "long" | "bun" | "curly";
  };
}

export const BRIEF_BUDGETS = [
  "under_1l",
  "1l_3l",
  "3l_10l",
  "10l_25l",
  "25l_plus",
  "not_sure",
] as const;
export type BriefBudget = (typeof BRIEF_BUDGETS)[number];

export const BUDGET_LABELS: Record<BriefBudget, string> = {
  under_1l: "Under ₹1 lakh",
  "1l_3l": "₹1–3 lakh",
  "3l_10l": "₹3–10 lakh",
  "10l_25l": "₹10–25 lakh",
  "25l_plus": "₹25 lakh+",
  not_sure: "Not sure yet",
};

export const CONTACT_CHANNELS = ["email", "phone", "whatsapp"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export interface ProjectBrief {
  projectType: string;
  serviceSlugs: string[];
  goals: string;
  scope: string;
  features: string[];
  platforms: string[];
  budget: BriefBudget | "";
  targetDate: string;
  industry: string;
  notes: string;
}

export const REQUEST_KINDS = ["quote", "consultation", "callback", "brief"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

export const LEAD_STAGES = [
  "new",
  "qualified",
  "contacted",
  "proposal",
  "won",
  "lost",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export type ConsultationStatus =
  | "pending_confirmation"
  | "confirmed"
  | "cancelled"
  | "completed";
