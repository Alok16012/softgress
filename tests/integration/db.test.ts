import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createPgliteDb, type Db } from "@/lib/db/driver";
import { migrate } from "@/lib/db/migrate";
import { seed } from "@/lib/db/seed";
import * as repo from "@/lib/db/repository";
import type { SubmissionInput } from "@/lib/db/repository";
import { emptyBrief } from "@/lib/leads/schema";

let db: Db;

const baseInput = (over: Partial<SubmissionInput> = {}): SubmissionInput => ({
  idempotencyKey: crypto.randomUUID(),
  referenceCode: `SG-${Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X")}-TEST`,
  kind: "quote",
  contact: { name: "Test Visitor", email: "visitor@example.com", phone: null, preferredChannel: "email", company: null },
  marketingConsent: false,
  brief: { ...emptyBrief(), projectType: "E-commerce website", serviceSlugs: ["ecommerce-development"] },
  primaryServiceSlug: "ecommerce-development",
  departmentSlug: "software",
  sessionId: null,
  locale: "en",
  transcript: [],
  consultation: null,
  ...over,
});

beforeAll(async () => {
  db = await createPgliteDb();
  await migrate(db, { localRoles: true });
  await seed(db);
});
afterAll(async () => db.close());

describe("migrations & seed", () => {
  it("is idempotent", async () => {
    await migrate(db, { localRoles: true });
    await seed(db);
    const services = await repo.listServices(db);
    expect(services.length).toBeGreaterThan(20);
    expect(services.every((s) => s.pricingType === "custom" && s.startingPrice === null)).toBe(true);
  });

  it("rejects a custom-priced service carrying a price", async () => {
    await expect(
      db.query(`update public.services set starting_price = 1000 where slug = 'seo'`),
    ).rejects.toThrow(/services_price_consistency/);
  });
});

describe("row level security", () => {
  async function asRole<T>(role: string, fn: () => Promise<T>) {
    await db.exec(`set role ${role}`);
    try {
      return await fn();
    } finally {
      await db.exec(`reset role`);
    }
  }

  it("lets anon read the active catalogue", async () => {
    const rows = await asRole("anon", () => db.query(`select slug from public.services`));
    expect(rows.length).toBeGreaterThan(20);
    const view = await asRole("anon", () => db.query(`select slug from public.public_services`));
    expect(view.length).toBe(rows.length);
  });

  it("never lets anon or authenticated read or write private tables", async () => {
    await repo.createSubmission(db, baseInput());
    for (const role of ["anon", "authenticated"]) {
      for (const table of ["leads", "service_requests", "consultations", "messages", "conversations", "lead_events", "contact_verifications", "admin_users", "audit_logs", "visitor_sessions", "lead_drafts"]) {
        await expect(asRole(role, () => db.query(`select * from public.${table}`))).rejects.toThrow(/permission denied/);
      }
      await expect(
        asRole(role, () => db.query(`insert into public.leads (contact_name, email, contact_consent_at) values ('x','x@y.z', now())`)),
      ).rejects.toThrow(/permission denied/);
    }
  });

  it("hides unapproved knowledge and inactive services from anon", async () => {
    await db.query(`insert into public.knowledge_documents (id, title, body) values ('kb-draft', 'Draft', 'secret draft')`);
    await db.query(`update public.services set active = false where slug = 'graphic-design'`);
    const kb = await asRole("anon", () => db.query<{ id: string }>(`select id from public.knowledge_documents`));
    expect(kb.find((k) => k.id === "kb-draft")).toBeUndefined();
    const svc = await asRole("anon", () => db.query<{ slug: string }>(`select slug from public.services`));
    expect(svc.find((s) => s.slug === "graphic-design")).toBeUndefined();
    await db.query(`update public.services set active = true where slug = 'graphic-design'`);
  });
});

describe("submissions", () => {
  it("creates one lead + one service request with the right department", async () => {
    const input = baseInput();
    const res = await repo.createSubmission(db, input);
    expect(res.reference).toBe(input.referenceCode);
    expect(res.replayed).toBe(false);
    const leads = await repo.listLeads(db, { q: input.referenceCode });
    expect(leads).toHaveLength(1);
    expect(leads[0].department).toBe("software");
    expect(leads[0].serviceSlug).toBe("ecommerce-development");
  });

  it("is idempotent on the idempotency key (duplicate submit)", async () => {
    const input = baseInput();
    const a = await repo.createSubmission(db, input);
    const b = await repo.createSubmission(db, { ...input, referenceCode: "SG-ZZZZ-ZZZZ" });
    expect(b.replayed).toBe(true);
    expect(b.reference).toBe(a.reference);
    const [{ n }] = await db.query<{ n: number }>(`select count(*)::int as n from public.service_requests where idempotency_key = $1`, [input.idempotencyKey]);
    expect(n).toBe(1);
  });

  it("flags but never merges possible duplicates", async () => {
    const email = `dup-${Date.now()}@example.com`;
    await repo.createSubmission(db, baseInput({ contact: { name: "A", email, phone: null, preferredChannel: "email", company: null } }));
    await repo.createSubmission(db, baseInput({ contact: { name: "B", email, phone: null, preferredChannel: "email", company: null } }));
    const rows = await repo.listLeads(db, { q: email });
    expect(rows).toHaveLength(2);
    expect(rows.filter((r) => r.possibleDuplicate)).toHaveLength(1);
  });

  it("allows a confirmed slot only once under concurrency", async () => {
    const startAt = "2030-01-07T05:30:00.000Z";
    const endAt = "2030-01-07T06:00:00.000Z";
    const mk = () =>
      baseInput({
        kind: "consultation",
        consultation: { mode: "slot", startAt, endAt, timezone: "Asia/Kolkata", provider: "mock", providerEventId: null },
      });
    const results = await Promise.allSettled([repo.createSubmission(db, mk()), repo.createSubmission(db, mk())]);
    const ok = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    expect(ok).toHaveLength(1);
    expect(failed[0].reason).toBeInstanceOf(repo.SlotUnavailableError);
    expect((ok[0] as PromiseFulfilledResult<repo.SubmissionResult>).value.consultationStatus).toBe("confirmed");
  });

  it("saves preferred-time requests as pending confirmation", async () => {
    const res = await repo.createSubmission(
      db,
      baseInput({ kind: "consultation", consultation: { mode: "preferred", window: { date: "2030-02-01", timeOfDay: "morning", note: "" }, timezone: "Asia/Kolkata" } }),
    );
    expect(res.consultationStatus).toBe("pending_confirmation");
  });

  it("rejects a lead without any contact method at the database level", async () => {
    await expect(
      db.query(`insert into public.leads (contact_name, contact_consent_at) values ('x', now())`),
    ).rejects.toThrow(/leads_contact_required/);
  });

  it("stores transcripts only when attached and deletes session data on reset", async () => {
    const sessionId = crypto.randomUUID();
    await repo.recordConversationTurn(db, sessionId, "kabir-software", "software");
    await repo.createSubmission(
      db,
      baseInput({
        sessionId,
        transcript: [{ staffId: "kabir-software", departmentSlug: "software", messages: [{ role: "user", content: "hi" }, { role: "assistant", content: "hello" }] }],
      }),
    );
    const [{ n }] = await db.query<{ n: number }>(
      `select count(*)::int as n from public.messages m join public.conversations c on c.id = m.conversation_id where c.session_id = $1`,
      [sessionId],
    );
    expect(n).toBe(2);
    expect(await repo.deleteSession(db, sessionId)).toBe(true);
    const [{ m }] = await db.query<{ m: number }>(`select count(*)::int as m from public.conversations where session_id = $1`, [sessionId]);
    expect(m).toBe(0);
  });
});

describe("status verification", () => {
  it("verifies once, caps attempts and expires", async () => {
    const input = baseInput();
    await repo.createSubmission(db, input);
    const match = await repo.findRequestForContact(db, input.referenceCode, { email: "VISITOR@example.com" });
    expect(match?.channel).toBe("email");
    expect(await repo.findRequestForContact(db, input.referenceCode, { email: "other@example.com" })).toBeNull();
    await repo.createVerification(db, match!.requestId, "email", "a".repeat(64), 10);
    expect(await repo.consumeVerification(db, input.referenceCode, "b".repeat(64))).toBeNull();
    expect(await repo.consumeVerification(db, input.referenceCode, "a".repeat(64))).toBe(match!.requestId);
    // consumed: cannot be reused
    expect(await repo.consumeVerification(db, input.referenceCode, "a".repeat(64))).toBeNull();
    await repo.createVerification(db, match!.requestId, "email", "c".repeat(64), 10);
    for (let i = 0; i < 5; i++) await repo.consumeVerification(db, input.referenceCode, "d".repeat(64));
    expect(await repo.consumeVerification(db, input.referenceCode, "c".repeat(64))).toBeNull();
  });
});

describe("crm", () => {
  it("records stage changes in events and the audit log", async () => {
    const input = baseInput();
    await repo.createSubmission(db, input);
    const [lead] = await repo.listLeads(db, { q: input.referenceCode });
    const actor = await repo.upsertAdminUser(db, "owner@example.com", "owner");
    expect(await repo.updateLeadStage(db, lead.id, "qualified", actor)).toBe(true);
    const detail = await repo.getLeadDetail(db, lead.id);
    expect(detail?.stage).toBe("qualified");
    expect(detail?.events.some((e) => e.type === "status_changed" && e.actor === "owner@example.com")).toBe(true);
    const audit = await repo.listAudit(db, 5);
    expect(audit[0].action).toBe("lead.stage");
  });

  it("knowledge edits clear approval and bump version", async () => {
    const actor = await repo.upsertAdminUser(db, "owner@example.com", "owner");
    await repo.saveKnowledge(db, { id: "kb-pricing", departmentSlug: null, title: "Pricing policy", body: "edited", visibility: "public" }, actor);
    const kb = (await repo.listKnowledge(db)).find((k) => k.id === "kb-pricing")!;
    expect(kb.approvedAt).toBeNull();
    expect(kb.version).toBe(2);
    expect((await repo.listKnowledge(db, { approvedOnly: true })).find((k) => k.id === "kb-pricing")).toBeUndefined();
    await repo.setKnowledgeApproval(db, "kb-pricing", true, actor);
    expect((await repo.listKnowledge(db, { approvedOnly: true })).find((k) => k.id === "kb-pricing")).toBeDefined();
  });
});
