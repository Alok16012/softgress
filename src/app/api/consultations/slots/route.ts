import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { getCalendar } from "@/lib/server";
import { env } from "@/lib/env";
import { json, problem } from "@/lib/security/request";
import { log, errorCode } from "@/lib/log";

export async function GET() {
  await connection();
  const cal = getCalendar();
  if (!cal.connected) {
    return json({ ok: true, connected: false, devOnly: false, timezone: env().CALENDAR_TIMEZONE, slots: [] });
  }
  try {
    const slots = await cal.listAvailable(await getDb(), { days: 10 });
    return json({ ok: true, connected: true, devOnly: cal.devOnly, provider: cal.id, timezone: env().CALENDAR_TIMEZONE, slots });
  } catch (err) {
    log.error("slots.failed", { err: errorCode(err) });
    return problem(503, "calendar_unavailable", "Availability couldn't be loaded. You can request a preferred time instead.");
  }
}
