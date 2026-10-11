import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { aiMode, env, isProduction } from "@/lib/env";
import { mockCalendar, noneCalendar, type CalendarAdapter } from "@/lib/calendar/adapter";
import { makeNotifier, type Notifier } from "@/lib/notify/adapter";

export function getCalendar(): CalendarAdapter {
  const e = env();
  // The mock calendar never runs in production: it would let visitors believe a slot is booked.
  if (e.CALENDAR_PROVIDER === "mock" && !isProduction()) return mockCalendar(e.CALENDAR_TIMEZONE);
  return noneCalendar;
}

export function getNotifier(): Notifier {
  return makeNotifier(env().NOTIFY_PROVIDER, isProduction());
}

/** Public-safe configuration passed to client components. Contains no secrets. */
export interface PublicConfig {
  aiMode: "anthropic" | "demo";
  calendar: { connected: boolean; devOnly: boolean; timezone: string };
  whatsappNumber: string | null;
  contactEmail: string | null;
  codeDelivery: "delivers" | "dev_outbox" | "none";
  /** Pre-rendered Remotion intro is present in public/media (fallback for constrained devices). */
  introVideo: boolean;
}

let introVideoCache: boolean | null = null;
function hasIntroVideo() {
  introVideoCache ??= existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "public/media/intro.mp4"));
  return introVideoCache;
}

export function getPublicConfig(): PublicConfig {
  const e = env();
  const cal = getCalendar();
  const n = getNotifier();
  return {
    aiMode: aiMode(),
    calendar: { connected: cal.connected, devOnly: cal.devOnly, timezone: e.CALENDAR_TIMEZONE },
    whatsappNumber: e.WHATSAPP_NUMBER ?? null,
    contactEmail: e.CONTACT_EMAIL ?? null,
    codeDelivery: n.delivers ? "delivers" : n.devOutbox ? "dev_outbox" : "none",
    introVideo: hasIntroVideo(),
  };
}
