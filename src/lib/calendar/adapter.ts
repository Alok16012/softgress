import type { Db } from "@/lib/db/driver";
import { confirmedSlotStarts } from "@/lib/db/repository";
import { localDateParts, zonedToUtc } from "./time";

export interface Slot {
  start: string; // ISO UTC
  end: string;
}

export interface CalendarAdapter {
  id: "none" | "mock";
  /** False → the UI must offer a "preferred time" request labelled pending confirmation. */
  connected: boolean;
  /** Development-only adapters must be visibly labelled in the UI. */
  devOnly: boolean;
  listAvailable(db: Db, opts: { days: number; now?: Date }): Promise<Slot[]>;
  /** Validates the slot is bookable. The reservation itself is the DB insert (unique index). */
  validate(db: Db, start: string, now?: Date): Promise<Slot | null>;
}

const SLOT_MIN = 30;

export const noneCalendar: CalendarAdapter = {
  id: "none",
  connected: false,
  devOnly: false,
  listAvailable: async () => [],
  validate: async () => null,
};

/**
 * MOCK calendar for local development: weekdays 10:00–17:30 in the configured
 * time zone, 30-minute slots, from tomorrow. Bookings are real DB rows, but no
 * external calendar event is created — the UI badges this as development-only.
 */
export function mockCalendar(tz: string): CalendarAdapter {
  const grid = (now: Date, days: number): Slot[] => {
    const out: Slot[] = [];
    const today = localDateParts(tz, now);
    for (let i = 1; out.length < 400 && i <= days + 6; i++) {
      const dayUtc = new Date(Date.UTC(today.year, today.month - 1, today.day + i, 12));
      const p = localDateParts(tz, dayUtc);
      if (p.weekday === "Sat" || p.weekday === "Sun") continue;
      for (let h = 10; h < 18; h++) {
        for (const m of [0, 30]) {
          const start = zonedToUtc(tz, p.year, p.month, p.day, h, m);
          out.push({ start: start.toISOString(), end: new Date(start.getTime() + SLOT_MIN * 60_000).toISOString() });
        }
      }
      if (out.length >= days * 16) break;
    }
    return out;
  };

  return {
    id: "mock",
    connected: true,
    devOnly: true,
    async listAvailable(db, { days, now = new Date() }) {
      const all = grid(now, days);
      if (!all.length) return [];
      const taken = new Set(await confirmedSlotStarts(db, "mock", all[0].start, all[all.length - 1].end));
      return all.filter((s) => !taken.has(s.start));
    },
    async validate(db, start, now = new Date()) {
      const slot = grid(now, 14).find((s) => s.start === new Date(start).toISOString());
      if (!slot) return null;
      const taken = await confirmedSlotStarts(db, "mock", slot.start, slot.end);
      return taken.length ? null : slot;
    },
  };
}
