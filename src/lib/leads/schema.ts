import { z } from "zod";
import { BRIEF_BUDGETS, CONTACT_CHANNELS, REQUEST_KINDS, type ProjectBrief } from "@/lib/types";

/** Remove control characters (except newline/tab) and trim. */
export const clean = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .trim();

const text = (max: number) => z.string().max(max * 2).transform(clean).pipe(z.string().max(max));
const slug = z.string().regex(/^[a-z0-9-]{2,60}$/);

export const emptyBrief = (): ProjectBrief => ({
  projectType: "",
  serviceSlugs: [],
  goals: "",
  scope: "",
  features: [],
  platforms: [],
  budget: "",
  targetDate: "",
  industry: "",
  notes: "",
});

export const briefSchema = z.object({
  projectType: text(120).default(""),
  serviceSlugs: z.array(slug).max(10).default([]),
  goals: text(1500).default(""),
  scope: text(3000).default(""),
  features: z.array(text(120)).max(30).default([]),
  platforms: z.array(text(40)).max(10).default([]),
  budget: z.union([z.enum(BRIEF_BUDGETS), z.literal("")]).default(""),
  targetDate: text(60).default(""),
  industry: text(80).default(""),
  notes: text(2000).default(""),
});

/** Normalise a phone number to +digits / digits. Returns null when impossible. */
export function normalisePhone(raw: string): string | null {
  const s = raw.replace(/[\s\-().]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(s)) return null;
  return s;
}

export const contactSchema = z
  .object({
    name: text(120).pipe(z.string().min(2, "Please enter your name")),
    email: z
      .string()
      .max(254)
      .transform((v) => clean(v).toLowerCase())
      .pipe(z.union([z.literal(""), z.string().email("Enter a valid email address")]))
      .transform((v) => (v === "" ? null : v)),
    phone: z
      .string()
      .max(30)
      .transform(clean)
      .transform((v, ctx) => {
        if (v === "") return null;
        const p = normalisePhone(v);
        if (!p) {
          ctx.addIssue({ code: "custom", message: "Enter a valid phone number (7–15 digits, optional +country code)" });
          return z.NEVER;
        }
        return p;
      }),
    company: text(120)
      .optional()
      .transform((v) => (v ? v : null)),
    preferredChannel: z.enum(CONTACT_CHANNELS),
  })
  .superRefine((c, ctx) => {
    if (!c.email && !c.phone) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email or a phone number so we can reply" });
    }
    if (c.preferredChannel === "email" && !c.email) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required for email replies" });
    }
    if ((c.preferredChannel === "phone" || c.preferredChannel === "whatsapp") && !c.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone is required for phone/WhatsApp replies" });
    }
  });

const transcriptSchema = z
  .array(
    z.object({
      staffId: z.string().regex(/^[a-z]+-[a-z]+$/),
      messages: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: text(2000) }))
        .max(60),
    }),
  )
  .max(6)
  .default([]);

export const isValidTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const consultationSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("slot"),
    slotStart: z.string().datetime(),
    timezone: z.string().max(60).refine(isValidTimeZone, "Unknown time zone"),
  }),
  z.object({
    mode: z.literal("preferred"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeOfDay: z.enum(["morning", "afternoon", "evening"]),
    note: text(300).default(""),
    timezone: z.string().max(60).refine(isValidTimeZone, "Unknown time zone"),
  }),
]);

export const submissionSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    kind: z.enum(REQUEST_KINDS),
    contact: contactSchema,
    consent: z.object({
      contact: z.literal(true, { message: "Consent to be contacted is required" }),
      marketing: z.boolean().default(false),
    }),
    brief: briefSchema,
    primaryServiceSlug: slug.nullable().default(null),
    sessionId: z.string().uuid().nullable().default(null),
    locale: z.string().max(12).nullable().default(null),
    attachTranscript: z.boolean().default(false),
    transcript: transcriptSchema,
    consultation: consultationSchema.nullable().default(null),
    // Spam controls
    website: z.string().max(200).default(""), // honeypot: must stay empty
    elapsedMs: z.number().int().nonnegative(),
  })
  .superRefine((s, ctx) => {
    if (s.kind === "consultation" && !s.consultation) {
      ctx.addIssue({ code: "custom", path: ["consultation"], message: "Choose a time or a preferred window" });
    }
    if (s.kind !== "consultation" && s.consultation) {
      ctx.addIssue({ code: "custom", path: ["consultation"], message: "Consultation details only apply to consultation requests" });
    }
    if (s.consultation?.mode === "preferred") {
      const d = new Date(`${s.consultation.date}T00:00:00Z`).getTime();
      const today = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
      if (Number.isNaN(d) || d < today - 86_400_000 || d > today + 120 * 86_400_000) {
        ctx.addIssue({ code: "custom", path: ["consultation", "date"], message: "Pick a date within the next 120 days" });
      }
    }
  });

export type SubmissionPayload = z.input<typeof submissionSchema>;
export type Submission = z.output<typeof submissionSchema>;

/** Field errors keyed by dotted path for form display. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
