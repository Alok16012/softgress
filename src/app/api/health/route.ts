import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { aiMode, dbDriver, env } from "@/lib/env";
import { getCalendar, getNotifier } from "@/lib/server";
import { adminConfigured } from "@/lib/security/admin-auth";
import { json } from "@/lib/security/request";

/** Configuration report. Contains no secrets or personal data. */
export async function GET(req: Request) {
  await connection();
  const e = env();
  let db: "ok" | "error" = "ok";
  try {
    await (await getDb()).query("select 1");
  } catch {
    db = "error";
  }

  // Optional live model check (?model=1): verifies the configured model ID exists for this key.
  let model: { id: string; available: boolean | null; checked: boolean } = { id: e.AI_MODEL, available: null, checked: false };
  if (new URL(req.url).searchParams.get("model") === "1" && aiMode() === "anthropic") {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: e.ANTHROPIC_API_KEY, timeout: 8000, maxRetries: 0 });
      await client.models.retrieve(e.AI_MODEL);
      model = { id: e.AI_MODEL, available: true, checked: true };
    } catch {
      model = { id: e.AI_MODEL, available: false, checked: true };
    }
  }

  const cal = getCalendar();
  const n = getNotifier();
  return json({
    ok: db === "ok",
    env: e.NODE_ENV,
    database: { driver: dbDriver(), status: db },
    ai: { mode: aiMode(), model },
    calendar: { provider: cal.id, connected: cal.connected, devOnly: cal.devOnly },
    notifications: { provider: n.id, delivers: n.delivers, devOutbox: n.devOutbox },
    whatsapp: Boolean(e.WHATSAPP_NUMBER),
    admin: adminConfigured(),
  }, { status: db === "ok" ? 200 : 503 });
}
