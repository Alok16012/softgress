import { z } from "zod";
import { BRIEF_BUDGETS, DEPARTMENT_SLUGS } from "@/lib/types";
import { clean } from "@/lib/leads/schema";

// The model's ONLY "actions" are suggestions. They are validated here, shown to the
// visitor, and applied to the brief only when the visitor accepts them.

const str = (max: number) => z.string().transform(clean).pipe(z.string().min(1).max(max));

export const briefSuggestionSchema = z
  .object({
    projectType: str(120).optional(),
    serviceSlugs: z.array(z.string().regex(/^[a-z0-9-]{2,60}$/)).max(6).optional(),
    goals: str(600).optional(),
    features: z.array(str(120)).max(12).optional(),
    platforms: z.array(str(40)).max(6).optional(),
    budget: z.enum(BRIEF_BUDGETS).optional(),
    targetDate: str(60).optional(),
    industry: str(80).optional(),
  })
  .strict();
export type BriefSuggestion = z.infer<typeof briefSuggestionSchema>;

export const routeSuggestionSchema = z
  .object({
    department: z.enum(DEPARTMENT_SLUGS),
    reason: str(200),
  })
  .strict();
export type RouteSuggestion = z.infer<typeof routeSuggestionSchema>;

/** Drop unknown service slugs and empty objects. */
export function sanitiseBriefSuggestion(s: BriefSuggestion, knownSlugs: Set<string>): BriefSuggestion | null {
  const out: BriefSuggestion = { ...s };
  if (out.serviceSlugs) {
    out.serviceSlugs = out.serviceSlugs.filter((x) => knownSlugs.has(x));
    if (!out.serviceSlugs.length) delete out.serviceSlugs;
  }
  for (const k of Object.keys(out) as (keyof BriefSuggestion)[]) {
    const v = out[k];
    if (v === undefined || (Array.isArray(v) && v.length === 0)) delete out[k];
  }
  return Object.keys(out).length ? out : null;
}

export function toolDefinitions(serviceSlugs: string[]) {
  return [
    {
      name: "suggest_brief_update",
      description:
        "Propose updates to the visitor's project brief based ONLY on facts the visitor stated in this conversation. The visitor sees the suggestion and decides whether to apply it; nothing is saved automatically. Never invent values. Use budget buckets only when the visitor gave a budget.",
      input_schema: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          projectType: { type: "string", description: "Short label, e.g. 'E-commerce website'" },
          serviceSlugs: { type: "array", items: { type: "string", enum: serviceSlugs }, description: "Catalogue service slugs that match the visitor's stated need" },
          goals: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          platforms: { type: "array", items: { type: "string" } },
          budget: { type: "string", enum: [...BRIEF_BUDGETS], description: "under_1l, 1l_3l, 3l_10l, 10l_25l, 25l_plus (INR) or not_sure" },
          targetDate: { type: "string", description: "Visitor's target timing in their words, e.g. 'before Diwali' or 'within 3 months'" },
          industry: { type: "string" },
        },
      },
      eager_input_streaming: true,
    },
    {
      name: "suggest_department",
      description:
        "Recommend that the visitor visit another department's AI guide when their need is better handled there. The visitor chooses whether to go.",
      input_schema: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          department: { type: "string", enum: [...DEPARTMENT_SLUGS] },
          reason: { type: "string", description: "One short sentence shown to the visitor" },
        },
        required: ["department", "reason"],
      },
      eager_input_streaming: true,
    },
  ];
}
