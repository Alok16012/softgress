"use server";
import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import * as repo from "@/lib/db/repository";
import { invalidateCatalog } from "@/lib/catalog";
import { briefSchema, clean } from "@/lib/leads/schema";
import { generateLeadSummary } from "@/lib/ai/summary";
import { can, getAdmin, type Permission } from "@/lib/security/admin-auth";
import { DEPARTMENT_SLUGS, LEAD_STAGES } from "@/lib/types";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function guard(perm: Permission) {
  const admin = await getAdmin();
  if (!admin) throw new Error("unauthorised");
  if (!can(admin.role, perm)) return { admin, allowed: false as const };
  return { admin, allowed: true as const };
}

const uuid = z.string().uuid();
const text = (max: number) => z.string().max(max * 2).transform(clean).pipe(z.string().max(max));

export async function setStageAction(leadId: string, stage: string): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't change lead stages." };
  const p = z.object({ leadId: uuid, stage: z.enum(LEAD_STAGES) }).safeParse({ leadId, stage });
  if (!p.success) return { ok: false, error: "Invalid stage." };
  await repo.updateLeadStage(await getDb(), p.data.leadId, p.data.stage, admin.id);
  refresh();
  return { ok: true };
}

export async function addNoteAction(leadId: string, note: string): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't add notes." };
  const p = z.object({ leadId: uuid, note: text(2000).pipe(z.string().min(1)) }).safeParse({ leadId, note });
  if (!p.success) return { ok: false, error: "Note is empty or too long." };
  await repo.addLeadEvent(await getDb(), p.data.leadId, "note", { text: p.data.note }, admin.id);
  refresh();
  return { ok: true };
}

export async function addTaskAction(leadId: string, title: string, due: string): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't add tasks." };
  const p = z
    .object({ leadId: uuid, title: text(200).pipe(z.string().min(1)), due: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]) })
    .safeParse({ leadId, title, due });
  if (!p.success) return { ok: false, error: "Task needs a title (and an optional valid date)." };
  await repo.addLeadEvent(await getDb(), p.data.leadId, "task", { title: p.data.title, due: p.data.due || null }, admin.id);
  refresh();
  return { ok: true };
}

export async function completeTaskAction(leadId: string, taskId: string): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't complete tasks." };
  if (!uuid.safeParse(leadId).success || !uuid.safeParse(taskId).success) return { ok: false, error: "Invalid task." };
  await repo.addLeadEvent(await getDb(), leadId, "task_done", { taskId }, admin.id);
  refresh();
  return { ok: true };
}

export async function saveBriefAction(requestId: string, brief: unknown): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't edit briefs." };
  const id = uuid.safeParse(requestId);
  const b = briefSchema.safeParse(brief);
  if (!id.success || !b.success) return { ok: false, error: "Brief is invalid." };
  await repo.updateRequestBrief(await getDb(), id.data, b.data, admin.id);
  refresh();
  return { ok: true, message: "Brief saved." };
}

export async function updateConsultationAction(id: string, status: string, startAt: string, durationMin: number): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't update consultations." };
  const p = z
    .object({
      id: uuid,
      status: z.enum(["pending_confirmation", "confirmed", "cancelled", "completed"]),
      startAt: z.union([z.literal(""), z.string().datetime({ offset: true })]),
      durationMin: z.number().int().min(15).max(240),
    })
    .safeParse({ id, status, startAt, durationMin });
  if (!p.success) return { ok: false, error: "Invalid consultation update." };
  if (p.data.status === "confirmed" && !p.data.startAt) return { ok: false, error: "A confirmed consultation needs a start time agreed with the visitor." };
  const start = p.data.startAt ? new Date(p.data.startAt) : null;
  try {
    await repo.updateConsultation(
      await getDb(),
      p.data.id,
      { status: p.data.status, startAt: start?.toISOString() ?? null, endAt: start ? new Date(start.getTime() + p.data.durationMin * 60_000).toISOString() : null },
      admin.id,
    );
  } catch {
    return { ok: false, error: "That time is already confirmed for another consultation." };
  }
  refresh();
  return { ok: true, message: "Consultation updated." };
}

export async function summariseLeadAction(leadId: string): Promise<ActionResult> {
  const { admin, allowed } = await guard("leads:write");
  if (!allowed) return { ok: false, error: "Your role can't generate summaries." };
  if (!uuid.safeParse(leadId).success) return { ok: false, error: "Invalid lead." };
  const db = await getDb();
  const lead = await repo.getLeadDetail(db, leadId);
  if (!lead) return { ok: false, error: "Lead not found." };
  try {
    const e = env();
    const s = await generateLeadSummary(lead, { apiKey: e.AI_PROVIDER === "demo" ? undefined : e.ANTHROPIC_API_KEY, model: e.AI_MODEL });
    await repo.setLeadSummary(db, leadId, s.summary, s.nextAction, admin.id, s.model);
  } catch {
    return { ok: false, error: "The AI service couldn't generate a summary right now." };
  }
  refresh();
  return { ok: true };
}

const servicePatch = z.object({
  title: text(120).pipe(z.string().min(2)),
  summary: text(300),
  description: text(3000),
  pricingType: z.enum(["custom", "starting_at", "fixed"]),
  startingPrice: z.union([z.literal(""), z.coerce.number().positive().max(1e10)]),
  currency: z.string().regex(/^[A-Z]{3}$/),
  active: z.boolean(),
});

export async function updateServiceAction(slug: string, input: unknown): Promise<ActionResult> {
  const { admin, allowed } = await guard("catalog:write");
  if (!allowed) return { ok: false, error: "Only owners can edit the service catalogue." };
  const p = servicePatch.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Invalid service." };
  const price = p.data.startingPrice === "" ? null : p.data.startingPrice;
  if (p.data.pricingType !== "custom" && price == null) return { ok: false, error: "Published pricing needs an amount; otherwise choose “custom”." };
  await repo.updateService(await getDb(), slug, { ...p.data, startingPrice: p.data.pricingType === "custom" ? null : price }, admin.id);
  invalidateCatalog();
  refresh();
  return { ok: true, message: "Service saved." };
}

export async function saveKnowledgeAction(input: unknown): Promise<ActionResult> {
  const { admin, allowed } = await guard("knowledge:write");
  if (!allowed) return { ok: false, error: "Your role can't edit knowledge." };
  const p = z
    .object({
      id: z.string().regex(/^kb-[a-z0-9-]{2,40}$/).optional(),
      departmentSlug: z.union([z.enum(DEPARTMENT_SLUGS), z.literal("")]),
      title: text(160).pipe(z.string().min(3)),
      body: text(8000).pipe(z.string().min(20)),
      visibility: z.enum(["public", "internal"]),
    })
    .safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Invalid document." };
  await repo.saveKnowledge(await getDb(), { ...p.data, departmentSlug: p.data.departmentSlug || null }, admin.id);
  invalidateCatalog();
  refresh();
  return { ok: true, message: "Saved as draft. It must be approved before AI guides can use it." };
}

export async function approveKnowledgeAction(id: string, approved: boolean): Promise<ActionResult> {
  const { admin, allowed } = await guard("knowledge:approve");
  if (!allowed) return { ok: false, error: "Only owners can approve knowledge." };
  if (!/^kb-[a-z0-9-]{2,40}$/.test(id)) return { ok: false, error: "Invalid document." };
  await repo.setKnowledgeApproval(await getDb(), id, approved, admin.id);
  invalidateCatalog();
  refresh();
  return { ok: true };
}
