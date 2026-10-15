import "server-only";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { z } from "zod";

// Server-side configuration. Nothing here is ever sent to the browser; the
// public-safe subset is exposed through getPublicConfig().

const bool = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((v) => v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.string().url().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string().optional(),
  PGLITE_DATA_DIR: z.string().default(".data/pglite"),
  ALLOW_PGLITE_IN_PRODUCTION: bool,

  // AI
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(["auto", "anthropic", "demo"]).default("auto"),
  AI_MODEL: z.string().default("claude-opus-5-5"),
  AI_EFFORT: z.enum(["low", "medium", "high"]).default("low"),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(256).max(8000).default(1200),
  AI_TIMEOUT_MS: z.coerce.number().int().min(5000).max(120000).default(45000),

  // Integrations (all optional — absent means "not configured", never faked)
  CALENDAR_PROVIDER: z.enum(["none", "mock"]).default("none"),
  CALENDAR_TIMEZONE: z.string().default("Asia/Kolkata"),
  NOTIFY_PROVIDER: z.enum(["console", "none"]).default("console"),
  CONTACT_EMAIL: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  WHATSAPP_NUMBER: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  STAFF_ALERT_EMAIL: z.string().email().optional().or(z.literal("").transform(() => undefined)),

  // Security
  SESSION_SECRET: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_ROLE: z.enum(["owner", "manager", "viewer"]).default("owner"),
  EXTRA_ADMINS: z.string().optional(),
  RATE_LIMIT_DISABLED: bool,
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid server environment: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => env().NODE_ENV === "production";

/** Public pages can run before a persistent production database is connected. */
export const catalogOnly = () => isProduction() && !env().DATABASE_URL && !env().ALLOW_PGLITE_IN_PRODUCTION;

export function aiMode(): "anthropic" | "demo" {
  const e = env();
  // Without a key we never claim to be live, whatever AI_PROVIDER says.
  if (e.AI_PROVIDER === "demo" || !e.ANTHROPIC_API_KEY) return "demo";
  return "anthropic";
}

export function dbDriver(): "postgres" | "pglite" {
  return env().DATABASE_URL ? "postgres" : "pglite";
}

/**
 * Session/cookie signing secret. Required in production. In development a random
 * secret is generated once and kept in .data/dev-secret (git-ignored).
 */
let devSecret: string | null = null;
export function sessionSecret(): string {
  const s = env().SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (isProduction()) throw new Error("SESSION_SECRET (>=32 chars) is required in production");
  if (devSecret) return devSecret;
  const file = path.resolve(/*turbopackIgnore: true*/ process.cwd(), ".data/dev-secret");
  try {
    devSecret = readFileSync(file, "utf8").trim();
  } catch {
    devSecret = randomBytes(32).toString("base64url");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, devSecret, { mode: 0o600 });
  }
  return devSecret;
}
