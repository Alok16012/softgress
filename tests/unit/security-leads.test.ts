import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { contactSchema, normalisePhone, submissionSchema, emptyBrief } from "@/lib/leads/schema";
import { rateLimit, resetRateLimits } from "@/lib/security/rate-limit";
import { hashPassword, referenceCode, verifyPassword, oneTimeCode } from "@/lib/security/crypto";
import { isSameOrigin } from "@/lib/security/request";
import { zonedToUtc, tzOffsetMs } from "@/lib/calendar/time";
import { mockCalendar, noneCalendar } from "@/lib/calendar/adapter";
import { makeNotifier, devOutbox } from "@/lib/notify/adapter";
import { submitRequest } from "@/lib/leads/submit";
import { createPgliteDb, type Db } from "@/lib/db/driver";
import { migrate } from "@/lib/db/migrate";
import { seed } from "@/lib/db/seed";

describe("contact validation", () => {
  it("normalises phone numbers", () => {
    expect(normalisePhone("+91 98765-43210")).toBe("+919876543210");
    expect(normalisePhone("(022) 2345 6789")).toBe("02223456789");
    expect(normalisePhone("12")).toBeNull();
    expect(normalisePhone("call me maybe")).toBeNull();
  });

  it("requires at least one contact method matching the preferred channel", () => {
    expect(contactSchema.safeParse({ name: "Asha", email: "", phone: "", preferredChannel: "email" }).success).toBe(false);
    expect(contactSchema.safeParse({ name: "Asha", email: "", phone: "+919876543210", preferredChannel: "email" }).success).toBe(false);
    expect(contactSchema.safeParse({ name: "Asha", email: "", phone: "+919876543210", preferredChannel: "whatsapp" }).success).toBe(true);
    expect(contactSchema.safeParse({ name: "Asha", email: "not-an-email", phone: "", preferredChannel: "email" }).success).toBe(false);
  });

  it("strips control characters and bidi overrides", () => {
    const p = contactSchema.parse({ name: "Ash‮a\u0007", email: "A@B.CO", phone: "", preferredChannel: "email" });
    expect(p.name).toBe("Asha");
    expect(p.email).toBe("a@b.co");
  });

  it("requires contact consent and keeps marketing opt-in separate", () => {
    const base = {
      idempotencyKey: crypto.randomUUID(),
      kind: "quote",
      contact: { name: "Asha", email: "a@b.co", phone: "", preferredChannel: "email" },
      brief: emptyBrief(),
      elapsedMs: 5000,
    };
    expect(submissionSchema.safeParse({ ...base, consent: { contact: false } }).success).toBe(false);
    const ok = submissionSchema.parse({ ...base, consent: { contact: true } });
    expect(ok.consent.marketing).toBe(false);
  });

  it("requires consultation details only for consultations", () => {
    const base = {
      idempotencyKey: crypto.randomUUID(),
      contact: { name: "Asha", email: "a@b.co", phone: "", preferredChannel: "email" },
      consent: { contact: true },
      brief: emptyBrief(),
      elapsedMs: 5000,
    };
    expect(submissionSchema.safeParse({ ...base, kind: "consultation" }).success).toBe(false);
    expect(
      submissionSchema.safeParse({ ...base, kind: "quote", consultation: { mode: "preferred", date: "2030-01-01", timeOfDay: "morning", timezone: "Asia/Kolkata" } }).success,
    ).toBe(false);
    expect(
      submissionSchema.safeParse({ ...base, kind: "consultation", consultation: { mode: "preferred", date: "2030-01-01", timeOfDay: "morning", timezone: "Not/AZone" } }).success,
    ).toBe(false);
  });
});

describe("security primitives", () => {
  beforeEach(() => resetRateLimits());

  it("rate limits within a sliding window", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, t + i).ok).toBe(true);
    const blocked = rateLimit("k", 3, 1000, t + 10);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(rateLimit("k", 3, 1000, t + 1500).ok).toBe(true);
  });

  it("hashes passwords with scrypt and verifies in constant time", () => {
    const h = hashPassword("correct horse", 1024);
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("correct horse", h)).toBe(true);
    expect(verifyPassword("wrong", h)).toBe(false);
    expect(verifyPassword("x", "garbage")).toBe(false);
  });

  it("generates unguessable references and 6-digit codes", () => {
    const refs = new Set(Array.from({ length: 2000 }, referenceCode));
    expect(refs.size).toBe(2000);
    for (const r of [...refs].slice(0, 50)) expect(r).toMatch(/^SG-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(oneTimeCode()).toMatch(/^\d{6}$/);
  });

  it("accepts same-origin and rejects cross-origin requests", () => {
    const mk = (h: Record<string, string>) => new Request("http://localhost:3000/api/leads", { method: "POST", headers: h });
    expect(isSameOrigin(mk({ origin: "http://localhost:3000", host: "localhost:3000" }))).toBe(true);
    expect(isSameOrigin(mk({ origin: "https://evil.example", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(mk({ "sec-fetch-site": "cross-site", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(mk({ "sec-fetch-site": "same-origin", host: "localhost:3000" }))).toBe(true);
  });
});

describe("time zones", () => {
  it("converts Asia/Kolkata wall time to UTC", () => {
    expect(zonedToUtc("Asia/Kolkata", 2030, 1, 7, 10, 0).toISOString()).toBe("2030-01-07T04:30:00.000Z");
    expect(tzOffsetMs("Asia/Kolkata", new Date("2030-01-07T00:00:00Z"))).toBe(5.5 * 3600_000);
  });
  it("handles DST zones", () => {
    expect(zonedToUtc("America/New_York", 2030, 7, 1, 9, 0).toISOString()).toBe("2030-07-01T13:00:00.000Z");
    expect(zonedToUtc("America/New_York", 2030, 1, 7, 9, 0).toISOString()).toBe("2030-01-07T14:00:00.000Z");
  });
});

describe("submission service", () => {
  let db: Db;
  beforeAll(async () => {
    db = await createPgliteDb();
    await migrate(db, { localRoles: true });
    await seed(db);
  });
  afterAll(async () => db.close());

  const payload = (over: Record<string, unknown> = {}) => ({
    idempotencyKey: crypto.randomUUID(),
    kind: "quote",
    contact: { name: "Ravi Kumar", email: "ravi@example.com", phone: "", preferredChannel: "email" },
    consent: { contact: true, marketing: false },
    brief: { ...emptyBrief(), serviceSlugs: ["meta-ads", "not-a-service"], projectType: "Meta ads" },
    elapsedMs: 8000,
    ...over,
  });
  const deps = (calendar = noneCalendar) => ({ db, calendar, notifier: makeNotifier("console", false), timezone: "Asia/Kolkata" });

  it("assigns the department of the primary service and drops unknown services", async () => {
    const r = await submitRequest(deps(), payload());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const [row] = await db.query<{ dept: string; brief: { serviceSlugs: string[] } }>(
      `select d.slug as dept, r.brief_json as brief from public.service_requests r join public.departments d on d.id = r.department_id where r.reference_code = $1`,
      [r.reference],
    );
    expect(row.dept).toBe("marketing");
    expect(row.brief.serviceSlugs).toEqual(["meta-ads"]);
    expect(r.notification).toBe("dev_outbox");
    expect(devOutbox()[1]?.subject ?? devOutbox()[0].subject).toContain(r.reference);
  });

  it("rejects bots: honeypot and too-fast submissions", async () => {
    expect(await submitRequest(deps(), payload({ website: "http://spam" }))).toMatchObject({ ok: false, code: "rejected" });
    expect(await submitRequest(deps(), payload({ elapsedMs: 300 }))).toMatchObject({ ok: false, code: "too_fast" });
  });

  it("returns field errors for invalid input", async () => {
    const r = await submitRequest(deps(), payload({ contact: { name: "", email: "x", phone: "", preferredChannel: "email" } }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.status).toBe(422);
    expect(Object.keys(r.fields ?? {})).toEqual(expect.arrayContaining(["contact.name", "contact.email"]));
  });

  it("never confirms a slot without a connected calendar", async () => {
    const r = await submitRequest(deps(noneCalendar), payload({ kind: "consultation", consultation: { mode: "slot", slotStart: "2030-01-07T05:00:00.000Z", timezone: "Asia/Kolkata" } }));
    expect(r).toMatchObject({ ok: false, code: "calendar_not_connected" });
  });

  it("saves a preferred time as pending confirmation", async () => {
    const d = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
    const r = await submitRequest(deps(), payload({ kind: "consultation", consultation: { mode: "preferred", date: d, timeOfDay: "afternoon", timezone: "Asia/Kolkata" } }));
    expect(r).toMatchObject({ ok: true, consultation: { status: "pending_confirmation", startAt: null } });
  });

  it("confirms a real mock-calendar slot once, and reports the second booking as taken", async () => {
    const cal = mockCalendar("Asia/Kolkata");
    const [slot] = await cal.listAvailable(db, { days: 5 });
    const mk = () => payload({ kind: "consultation", consultation: { mode: "slot", slotStart: slot.start, timezone: "Asia/Kolkata" } });
    const first = await submitRequest(deps(cal), mk());
    expect(first).toMatchObject({ ok: true, consultation: { status: "confirmed", startAt: slot.start } });
    const second = await submitRequest(deps(cal), mk());
    expect(second).toMatchObject({ ok: false, code: "slot_taken" });
    const after = await cal.listAvailable(db, { days: 5 });
    expect(after.find((s) => s.start === slot.start)).toBeUndefined();
  });

  it("rejects slots that aren't on the calendar grid", async () => {
    const cal = mockCalendar("Asia/Kolkata");
    const r = await submitRequest(deps(cal), payload({ kind: "consultation", consultation: { mode: "slot", slotStart: "2031-03-03T03:17:00.000Z", timezone: "Asia/Kolkata" } }));
    expect(r).toMatchObject({ ok: false, code: "slot_taken" });
  });

  it("replays duplicate submissions without creating a second request", async () => {
    const p = payload();
    const a = await submitRequest(deps(), p);
    const b = await submitRequest(deps(), p);
    expect(a.ok && b.ok && a.reference === b.reference && b.replayed).toBe(true);
  });

  it("does not deliver notifications in production without a provider", async () => {
    const n = makeNotifier("console", true);
    expect(n.devOutbox).toBe(false);
    expect((await n.send({ channel: "email", to: "x@y.z", subject: "s", body: "b" })).delivered).toBe(false);
  });
});
