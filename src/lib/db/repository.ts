// All SQL lives here. Runs unchanged on PGlite and Postgres (Supabase).
import type {
  Department,
  DepartmentSlug,
  KnowledgeDocument,
  LeadStage,
  PricingType,
  Project,
  ProjectBrief,
  RequestKind,
  Service,
  ConsultationStatus,
  ContactChannel,
} from "@/lib/types";
import type { Db } from "./driver";

const iso = (v: unknown): string | null =>
  v == null ? null : v instanceof Date ? v.toISOString() : new Date(String(v)).toISOString();
const num = (v: unknown): number | null => (v == null ? null : Number(v));

export class SlotUnavailableError extends Error {
  constructor() {
    super("slot_unavailable");
  }
}
export class DuplicateReferenceError extends Error {
  constructor() {
    super("duplicate_reference");
  }
}

function pgCode(err: unknown): { code?: string; constraint?: string } {
  const e = err as { code?: string; constraint?: string; constraint_name?: string; detail?: string; message?: string };
  return { code: e?.code, constraint: e?.constraint ?? e?.constraint_name ?? e?.message };
}

// ─────────────────────────────────────────────────────────────
// Catalogue
// ─────────────────────────────────────────────────────────────
type DeptRow = { slug: DepartmentSlug; name: string; short_name: string; description: string; scene_id: string; active: boolean };

export async function listDepartments(db: Db): Promise<Department[]> {
  const rows = await db.query<DeptRow>(
    `select slug, name, short_name, description, scene_id, active from public.departments order by sort_order, slug`,
  );
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    shortName: r.short_name,
    description: r.description,
    sceneId: r.scene_id as Department["sceneId"],
    active: r.active,
  }));
}

type ServiceRow = {
  slug: string; department_slug: DepartmentSlug; title: string; summary: string; description: string;
  deliverables: string[]; process: string[]; what_we_need: string[]; keywords: string[];
  pricing_type: PricingType; starting_price: unknown; currency: string; active: boolean;
};
const SERVICE_COLS = `s.slug, d.slug as department_slug, s.title, s.summary, s.description, s.deliverables, s.process,
  s.what_we_need, s.keywords, s.pricing_type, s.starting_price, s.currency, s.active`;
const mapService = (r: ServiceRow): Service => ({
  slug: r.slug,
  departmentSlug: r.department_slug,
  title: r.title,
  summary: r.summary,
  description: r.description,
  deliverables: r.deliverables ?? [],
  process: r.process ?? [],
  whatWeNeed: r.what_we_need ?? [],
  keywords: r.keywords ?? [],
  pricingType: r.pricing_type,
  startingPrice: num(r.starting_price),
  currency: r.currency,
  active: r.active,
});

export async function listServices(db: Db, opts: { includeInactive?: boolean } = {}): Promise<Service[]> {
  const rows = await db.query<ServiceRow>(
    `select ${SERVICE_COLS} from public.services s join public.departments d on d.id = s.department_id
     ${opts.includeInactive ? "" : "where s.active and d.active"}
     order by d.sort_order, s.sort_order, s.slug`,
  );
  return rows.map(mapService);
}

export async function getService(db: Db, slug: string): Promise<Service | null> {
  const rows = await db.query<ServiceRow>(
    `select ${SERVICE_COLS} from public.services s join public.departments d on d.id = s.department_id where s.slug = $1`,
    [slug],
  );
  return rows[0] ? mapService(rows[0]) : null;
}

export interface ServicePatch {
  title?: string;
  summary?: string;
  description?: string;
  pricingType?: PricingType;
  startingPrice?: number | null;
  currency?: string;
  active?: boolean;
}

export async function updateService(db: Db, slug: string, patch: ServicePatch, actorId: string) {
  return db.tx(async (tx) => {
    const before = await getService(tx, slug);
    if (!before) return null;
    const next = { ...before, ...patch };
    if (next.pricingType === "custom") next.startingPrice = null;
    await tx.query(
      `update public.services set title=$2, summary=$3, description=$4, pricing_type=$5, starting_price=$6,
         currency=$7, active=$8 where slug=$1`,
      [slug, next.title, next.summary, next.description, next.pricingType, next.startingPrice, next.currency, next.active],
    );
    await audit(tx, actorId, "service.update", "service", slug, { before: pick(before, patch), after: patch });
    return next;
  });
}

type ProjectRow = { slug: string; title: string; summary: string; body: string; industry: string; service_slugs: string[]; is_sample: boolean; published: boolean };
export async function listProjects(db: Db, opts: { includeUnpublished?: boolean } = {}): Promise<Project[]> {
  const rows = await db.query<ProjectRow>(
    `select slug, title, summary, body, industry, service_slugs, is_sample, published from public.projects
     ${opts.includeUnpublished ? "" : "where published"} order by created_at, slug`,
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    body: r.body,
    industry: r.industry,
    serviceSlugs: r.service_slugs ?? [],
    isSample: r.is_sample,
    published: r.published,
  }));
}

type KnowledgeRow = {
  id: string; department_slug: DepartmentSlug | null; title: string; body: string;
  visibility: "public" | "internal"; approved_at: unknown; version: number; is_seed: boolean; updated_at?: unknown;
};
const mapKnowledge = (r: KnowledgeRow): KnowledgeDocument => ({
  id: r.id,
  departmentSlug: r.department_slug,
  title: r.title,
  body: r.body,
  visibility: r.visibility,
  approvedAt: iso(r.approved_at),
  version: r.version,
  isSeed: r.is_seed,
});

export async function listKnowledge(
  db: Db,
  opts: { approvedOnly?: boolean } = {},
): Promise<KnowledgeDocument[]> {
  const rows = await db.query<KnowledgeRow>(
    `select k.id, d.slug as department_slug, k.title, k.body, k.visibility, k.approved_at, k.version, k.is_seed
     from public.knowledge_documents k left join public.departments d on d.id = k.department_id
     ${opts.approvedOnly ? "where k.approved_at is not null" : ""}
     order by d.slug nulls first, k.id`,
  );
  return rows.map(mapKnowledge);
}

export interface KnowledgeInput {
  id?: string;
  departmentSlug: DepartmentSlug | null;
  title: string;
  body: string;
  visibility: "public" | "internal";
}

/** Create or edit. Any edit clears approval: content must be re-approved before AI guides use it. */
export async function saveKnowledge(db: Db, input: KnowledgeInput, actorId: string) {
  return db.tx(async (tx) => {
    const id = input.id ?? `kb-${crypto.randomUUID().slice(0, 8)}`;
    const existing = await tx.query<{ version: number }>(`select version from public.knowledge_documents where id=$1`, [id]);
    if (existing[0]) {
      await tx.query(
        `update public.knowledge_documents set department_id=(select id from public.departments where slug=$2),
           title=$3, body=$4, visibility=$5, approved_at=null, approved_by=null, version=version+1, is_seed=false
         where id=$1`,
        [id, input.departmentSlug, input.title, input.body, input.visibility],
      );
      await audit(tx, actorId, "knowledge.update", "knowledge_document", id, { title: input.title });
    } else {
      await tx.query(
        `insert into public.knowledge_documents (id, department_id, title, body, visibility)
         values ($1, (select id from public.departments where slug=$2), $3, $4, $5)`,
        [id, input.departmentSlug, input.title, input.body, input.visibility],
      );
      await audit(tx, actorId, "knowledge.create", "knowledge_document", id, { title: input.title });
    }
    return id;
  });
}

export async function setKnowledgeApproval(db: Db, id: string, approved: boolean, actorId: string) {
  return db.tx(async (tx) => {
    await tx.query(
      `update public.knowledge_documents set approved_at = case when $2 then now() else null end,
         approved_by = case when $2 then $3::uuid else null end where id=$1`,
      [id, approved, actorId],
    );
    await audit(tx, actorId, approved ? "knowledge.approve" : "knowledge.unapprove", "knowledge_document", id, {});
  });
}

export async function listAssets(db: Db) {
  return db.query<{ id: string; zone: string; name: string; kind: string; status: string; source: string; license: string; triangle_budget: number | null; notes: string }>(
    `select id, zone, name, kind, status, source, license, triangle_budget, notes from public.asset_manifest order by zone, id`,
  );
}

// ─────────────────────────────────────────────────────────────
// Visitor sessions & conversation metadata (no message bodies)
// ─────────────────────────────────────────────────────────────
export async function touchSession(db: Db, sessionId: string, locale: string | null) {
  await db.query(
    `insert into public.visitor_sessions (id, locale) values ($1, $2)
     on conflict (id) do update set last_seen_at = now(), locale = coalesce(excluded.locale, public.visitor_sessions.locale)`,
    [sessionId, locale],
  );
}

export async function recordConversationTurn(db: Db, sessionId: string, staffId: string, departmentSlug: DepartmentSlug) {
  await db.tx(async (tx) => {
    await touchSession(tx, sessionId, null);
    await tx.query(
      `insert into public.conversations (session_id, staff_id, department_id, message_count)
       values ($1, $2, (select id from public.departments where slug=$3), 2)
       on conflict (session_id, staff_id) do update set message_count = public.conversations.message_count + 2`,
      [sessionId, staffId, departmentSlug],
    );
  });
}

/** Privacy reset: deletes the anonymous session, its drafts and conversation metadata. */
export async function deleteSession(db: Db, sessionId: string) {
  const rows = await db.query<{ id: string }>(
    `delete from public.visitor_sessions where id = $1 returning id`,
    [sessionId],
  );
  return rows.length > 0;
}

// ─────────────────────────────────────────────────────────────
// Submissions
// ─────────────────────────────────────────────────────────────
export interface SubmissionInput {
  idempotencyKey: string;
  referenceCode: string;
  kind: RequestKind;
  contact: { name: string; email: string | null; phone: string | null; preferredChannel: ContactChannel; company: string | null };
  marketingConsent: boolean;
  brief: ProjectBrief;
  primaryServiceSlug: string | null;
  departmentSlug: DepartmentSlug;
  sessionId: string | null;
  locale: string | null;
  transcript: { staffId: string; departmentSlug: DepartmentSlug; messages: { role: "user" | "assistant"; content: string }[] }[];
  consultation:
    | { mode: "slot"; startAt: string; endAt: string; timezone: string; provider: string; providerEventId: string | null }
    | { mode: "preferred"; window: { date: string; timeOfDay: string; note: string }; timezone: string }
    | null;
}

export interface SubmissionResult {
  reference: string;
  kind: RequestKind;
  requestStatus: string;
  consultationStatus: ConsultationStatus | null;
  consultationStartAt: string | null;
  replayed: boolean;
}

export async function findSubmissionByKey(db: Db, key: string): Promise<SubmissionResult | null> {
  const rows = await db.query<{ reference_code: string; kind: RequestKind; status: string; c_status: ConsultationStatus | null; start_at: unknown }>(
    `select r.reference_code, r.kind, r.status, c.status as c_status, c.start_at
     from public.service_requests r left join public.consultations c on c.service_request_id = r.id
     where r.idempotency_key = $1`,
    [key],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    reference: r.reference_code,
    kind: r.kind,
    requestStatus: r.status,
    consultationStatus: r.c_status,
    consultationStartAt: iso(r.start_at),
    replayed: true,
  };
}

export async function createSubmission(db: Db, input: SubmissionInput): Promise<SubmissionResult> {
  try {
    return await db.tx(async (tx) => {
      const existing = await findSubmissionByKey(tx, input.idempotencyKey);
      if (existing) return existing;

      // Cautious duplicate detection: flag, never merge.
      const dup = await tx.query<{ id: string }>(
        `select id from public.leads
         where ($1::text is not null and lower(email) = lower($1)) or ($2::text is not null and phone = $2)
         order by created_at limit 1`,
        [input.contact.email, input.contact.phone],
      );

      if (input.sessionId) await touchSession(tx, input.sessionId, input.locale);

      const [lead] = await tx.query<{ id: string }>(
        `insert into public.leads (contact_name, email, phone, preferred_channel, company, source, department_id,
           session_id, possible_duplicate_of, locale, contact_consent_at, marketing_consent_at)
         values ($1,$2,$3,$4,$5,'virtual_tour',(select id from public.departments where slug=$6),$7,$8,$9, now(),
                 case when $10 then now() else null end)
         returning id`,
        [
          input.contact.name, input.contact.email, input.contact.phone, input.contact.preferredChannel,
          input.contact.company, input.departmentSlug, input.sessionId, dup[0]?.id ?? null, input.locale,
          input.marketingConsent,
        ],
      );

      const [request] = await tx.query<{ id: string; status: string }>(
        `insert into public.service_requests (lead_id, service_id, department_id, kind, brief_json, reference_code, idempotency_key)
         values ($1, (select id from public.services where slug=$2), (select id from public.departments where slug=$3),
                 $4, $5::jsonb, $6, $7)
         returning id, status`,
        [lead.id, input.primaryServiceSlug, input.departmentSlug, input.kind, JSON.stringify(input.brief), input.referenceCode, input.idempotencyKey],
      );

      let consultationStatus: ConsultationStatus | null = null;
      let consultationStartAt: string | null = null;
      if (input.consultation) {
        const c = input.consultation;
        const status: ConsultationStatus = c.mode === "slot" ? "confirmed" : "pending_confirmation";
        await tx.query(
          `insert into public.consultations (lead_id, service_request_id, start_at, end_at, timezone, preferred_window,
             status, provider, provider_event_id, idempotency_key)
           values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)`,
          [
            lead.id, request.id,
            c.mode === "slot" ? c.startAt : null,
            c.mode === "slot" ? c.endAt : null,
            c.timezone,
            c.mode === "preferred" ? JSON.stringify(c.window) : null,
            status,
            c.mode === "slot" ? c.provider : "none",
            c.mode === "slot" ? c.providerEventId : null,
            input.idempotencyKey,
          ],
        );
        consultationStatus = status;
        consultationStartAt = c.mode === "slot" ? c.startAt : null;
      }

      await tx.query(
        `insert into public.lead_events (lead_id, type, metadata_json) values ($1, 'created', $2::jsonb)`,
        [lead.id, JSON.stringify({ kind: input.kind, reference: input.referenceCode, possibleDuplicate: Boolean(dup[0]) })],
      );

      if (input.sessionId && input.transcript.length) {
        for (const t of input.transcript) {
          const [conv] = await tx.query<{ id: string }>(
            `insert into public.conversations (session_id, staff_id, department_id, status, message_count)
             values ($1, $2, (select id from public.departments where slug=$3), 'attached', $4)
             on conflict (session_id, staff_id) do update set status='attached', message_count=excluded.message_count
             returning id`,
            [input.sessionId, t.staffId, t.departmentSlug, t.messages.length],
          );
          await tx.query(`delete from public.messages where conversation_id=$1`, [conv.id]);
          for (const m of t.messages) {
            await tx.query(`insert into public.messages (conversation_id, role, content) values ($1,$2,$3)`, [conv.id, m.role, m.content]);
          }
        }
      }

      return {
        reference: input.referenceCode,
        kind: input.kind,
        requestStatus: request.status,
        consultationStatus,
        consultationStartAt,
        replayed: false,
      };
    });
  } catch (err) {
    const { code, constraint } = pgCode(err);
    if (code === "23505") {
      if (constraint?.includes("consultations_confirmed_slot_uniq")) throw new SlotUnavailableError();
      if (constraint?.includes("reference_code")) throw new DuplicateReferenceError();
      if (constraint?.includes("idempotency_key")) {
        const replay = await findSubmissionByKey(db, input.idempotencyKey);
        if (replay) return replay;
      }
    }
    throw err;
  }
}

export async function confirmedSlotStarts(db: Db, provider: string, fromIso: string, toIso: string): Promise<string[]> {
  const rows = await db.query<{ start_at: unknown }>(
    `select start_at from public.consultations where provider=$1 and status='confirmed' and start_at >= $2 and start_at < $3`,
    [provider, fromIso, toIso],
  );
  return rows.map((r) => iso(r.start_at)!);
}

// ─────────────────────────────────────────────────────────────
// Visitor status lookup (verified)
// ─────────────────────────────────────────────────────────────
export async function findRequestForContact(db: Db, reference: string, contact: { email?: string; phone?: string }) {
  const rows = await db.query<{ id: string; email: string | null; phone: string | null }>(
    `select r.id, l.email, l.phone from public.service_requests r join public.leads l on l.id = r.lead_id
     where r.reference_code = $1`,
    [reference],
  );
  const r = rows[0];
  if (!r) return null;
  if (contact.email && r.email && r.email.toLowerCase() === contact.email.toLowerCase())
    return { requestId: r.id, channel: "email" as const, destination: r.email };
  if (contact.phone && r.phone && r.phone === contact.phone)
    return { requestId: r.id, channel: "phone" as const, destination: r.phone };
  return null;
}

export async function createVerification(db: Db, requestId: string, channel: "email" | "phone", codeHash: string, ttlMinutes: number) {
  await db.tx(async (tx) => {
    await tx.query(
      `update public.contact_verifications set consumed_at = now() where service_request_id=$1 and consumed_at is null`,
      [requestId],
    );
    await tx.query(
      `insert into public.contact_verifications (service_request_id, channel, code_hash, expires_at)
       values ($1,$2,$3, now() + make_interval(mins => $4))`,
      [requestId, channel, codeHash, ttlMinutes],
    );
  });
}

export async function recentVerificationCount(db: Db, requestId: string, minutes: number) {
  const [r] = await db.query<{ n: number | string }>(
    `select count(*) as n from public.contact_verifications where service_request_id=$1 and created_at > now() - make_interval(mins => $2)`,
    [requestId, minutes],
  );
  return Number(r.n);
}

/** Returns the request id when the code is valid; burns attempts otherwise (max 5). */
export async function consumeVerification(db: Db, reference: string, codeHash: string): Promise<string | null> {
  return db.tx(async (tx) => {
    const rows = await tx.query<{ id: string; request_id: string; code_hash: string; attempts: number }>(
      `select v.id, v.service_request_id as request_id, v.code_hash, v.attempts
       from public.contact_verifications v join public.service_requests r on r.id = v.service_request_id
       where r.reference_code=$1 and v.consumed_at is null and v.expires_at > now()
       order by v.created_at desc limit 1 for update`,
      [reference],
    );
    const v = rows[0];
    if (!v || v.attempts >= 5) return null;
    if (!timingSafeEqualHex(v.code_hash, codeHash)) {
      await tx.query(`update public.contact_verifications set attempts = attempts + 1 where id=$1`, [v.id]);
      return null;
    }
    await tx.query(`update public.contact_verifications set consumed_at = now() where id=$1`, [v.id]);
    return v.request_id;
  });
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function getPublicStatus(db: Db, requestId: string) {
  const rows = await db.query<{
    reference_code: string; kind: RequestKind; status: string; created_at: unknown; service_title: string | null;
    c_status: ConsultationStatus | null; start_at: unknown; timezone: string | null;
  }>(
    `select r.reference_code, r.kind, r.status, r.created_at, s.title as service_title, c.status as c_status, c.start_at, c.timezone
     from public.service_requests r left join public.services s on s.id = r.service_id
     left join public.consultations c on c.service_request_id = r.id where r.id = $1`,
    [requestId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    reference: r.reference_code,
    kind: r.kind,
    status: r.status,
    createdAt: iso(r.created_at)!,
    service: r.service_title,
    consultation: r.c_status ? { status: r.c_status, startAt: iso(r.start_at), timezone: r.timezone } : null,
  };
}

// ─────────────────────────────────────────────────────────────
// CRM
// ─────────────────────────────────────────────────────────────
export interface LeadListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  stage: LeadStage;
  department: DepartmentSlug | null;
  createdAt: string;
  reference: string | null;
  kind: RequestKind | null;
  service: string | null;
  serviceSlug: string | null;
  consultationStatus: ConsultationStatus | null;
  possibleDuplicate: boolean;
}

export async function listLeads(
  db: Db,
  f: { stage?: LeadStage; department?: DepartmentSlug; service?: string; q?: string } = {},
): Promise<LeadListItem[]> {
  const rows = await db.query<{
    id: string; contact_name: string; email: string | null; phone: string | null; status: LeadStage;
    dept: DepartmentSlug | null; created_at: unknown; reference_code: string | null; kind: RequestKind | null;
    service_title: string | null; service_slug: string | null; c_status: ConsultationStatus | null; dup: string | null;
  }>(
    `select l.id, l.contact_name, l.email, l.phone, l.status, d.slug as dept, l.created_at, l.possible_duplicate_of as dup,
            r.reference_code, r.kind, s.title as service_title, s.slug as service_slug, c.status as c_status
     from public.leads l
     left join public.departments d on d.id = l.department_id
     left join lateral (select * from public.service_requests sr where sr.lead_id = l.id order by sr.created_at desc limit 1) r on true
     left join public.services s on s.id = r.service_id
     left join public.consultations c on c.service_request_id = r.id
     where ($1::text is null or l.status = $1)
       and ($2::text is null or d.slug = $2)
       and ($3::text is null or s.slug = $3)
       and ($4::text is null or l.contact_name ilike '%' || $4 || '%' or l.email ilike '%' || $4 || '%' or r.reference_code ilike '%' || $4 || '%')
     order by l.created_at desc limit 500`,
    [f.stage ?? null, f.department ?? null, f.service ?? null, f.q?.trim() || null],
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.contact_name,
    email: r.email,
    phone: r.phone,
    stage: r.status,
    department: r.dept,
    createdAt: iso(r.created_at)!,
    reference: r.reference_code,
    kind: r.kind,
    service: r.service_title,
    serviceSlug: r.service_slug,
    consultationStatus: r.c_status,
    possibleDuplicate: Boolean(r.dup),
  }));
}

export async function getLeadDetail(db: Db, id: string) {
  const [lead] = await db.query<{
    id: string; contact_name: string; email: string | null; phone: string | null; preferred_channel: ContactChannel;
    company: string | null; status: LeadStage; dept: DepartmentSlug | null; locale: string | null; created_at: unknown;
    contact_consent_at: unknown; marketing_consent_at: unknown; possible_duplicate_of: string | null;
    ai_summary: string | null; ai_next_action: string | null; ai_summary_at: unknown; session_id: string | null;
  }>(
    `select l.*, d.slug as dept from public.leads l left join public.departments d on d.id = l.department_id where l.id = $1`,
    [id],
  );
  if (!lead) return null;
  const requests = await db.query<{
    id: string; kind: RequestKind; status: string; reference_code: string; brief_json: ProjectBrief; created_at: unknown;
    service_title: string | null; service_slug: string | null; dept: DepartmentSlug | null;
  }>(
    `select r.id, r.kind, r.status, r.reference_code, r.brief_json, r.created_at, s.title as service_title, s.slug as service_slug, d.slug as dept
     from public.service_requests r left join public.services s on s.id = r.service_id
     left join public.departments d on d.id = r.department_id where r.lead_id = $1 order by r.created_at desc`,
    [id],
  );
  const consultations = await db.query<{
    id: string; service_request_id: string; status: ConsultationStatus; start_at: unknown; end_at: unknown; timezone: string;
    preferred_window: { date: string; timeOfDay: string; note: string } | null; provider: string;
  }>(
    `select id, service_request_id, status, start_at, end_at, timezone, preferred_window, provider
     from public.consultations where lead_id = $1 order by created_at desc`,
    [id],
  );
  const events = await db.query<{ id: string; type: string; metadata_json: Record<string, unknown>; created_at: unknown; actor_email: string | null }>(
    `select e.id, e.type, e.metadata_json, e.created_at, a.email as actor_email from public.lead_events e
     left join public.admin_users a on a.id = e.actor_id where e.lead_id = $1 order by e.created_at desc`,
    [id],
  );
  const transcript = lead.session_id
    ? await db.query<{ staff_id: string; role: "user" | "assistant"; content: string; created_at: unknown }>(
        `select c.staff_id, m.role, m.content, m.created_at from public.conversations c
         join public.messages m on m.conversation_id = c.id
         where c.session_id = $1 and c.status = 'attached' order by c.staff_id, m.created_at, m.id`,
        [lead.session_id],
      )
    : [];
  const doneTasks = new Set(events.filter((e) => e.type === "task_done").map((e) => String(e.metadata_json.taskId)));
  return {
    id: lead.id,
    name: lead.contact_name,
    email: lead.email,
    phone: lead.phone,
    preferredChannel: lead.preferred_channel,
    company: lead.company,
    stage: lead.status,
    department: lead.dept,
    locale: lead.locale,
    createdAt: iso(lead.created_at)!,
    contactConsentAt: iso(lead.contact_consent_at),
    marketingConsentAt: iso(lead.marketing_consent_at),
    possibleDuplicateOf: lead.possible_duplicate_of,
    aiSummary: lead.ai_summary,
    aiNextAction: lead.ai_next_action,
    aiSummaryAt: iso(lead.ai_summary_at),
    requests: requests.map((r) => ({
      id: r.id,
      kind: r.kind,
      status: r.status,
      reference: r.reference_code,
      brief: r.brief_json,
      createdAt: iso(r.created_at)!,
      service: r.service_title,
      serviceSlug: r.service_slug,
      department: r.dept,
    })),
    consultations: consultations.map((c) => ({
      id: c.id,
      requestId: c.service_request_id,
      status: c.status,
      startAt: iso(c.start_at),
      endAt: iso(c.end_at),
      timezone: c.timezone,
      preferredWindow: c.preferred_window,
      provider: c.provider,
    })),
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      metadata: e.metadata_json,
      createdAt: iso(e.created_at)!,
      actor: e.actor_email,
      done: e.type === "task" ? doneTasks.has(e.id) : undefined,
    })),
    transcript: transcript.map((t) => ({ staffId: t.staff_id, role: t.role, content: t.content, createdAt: iso(t.created_at)! })),
  };
}
export type LeadDetail = NonNullable<Awaited<ReturnType<typeof getLeadDetail>>>;

export async function updateLeadStage(db: Db, id: string, stage: LeadStage, actorId: string) {
  return db.tx(async (tx) => {
    const [before] = await tx.query<{ status: LeadStage }>(`select status from public.leads where id=$1 for update`, [id]);
    if (!before) return false;
    if (before.status === stage) return true;
    await tx.query(`update public.leads set status=$2 where id=$1`, [id, stage]);
    await tx.query(
      `insert into public.lead_events (lead_id, type, metadata_json, actor_id) values ($1,'status_changed',$2::jsonb,$3)`,
      [id, JSON.stringify({ from: before.status, to: stage }), actorId],
    );
    await audit(tx, actorId, "lead.stage", "lead", id, { from: before.status, to: stage });
    return true;
  });
}

export async function addLeadEvent(
  db: Db,
  leadId: string,
  type: "note" | "task" | "task_done" | "consultation_updated" | "notification",
  metadata: Record<string, unknown>,
  actorId: string | null,
) {
  return db.tx(async (tx) => {
    const [row] = await tx.query<{ id: string }>(
      `insert into public.lead_events (lead_id, type, metadata_json, actor_id) values ($1,$2,$3::jsonb,$4) returning id`,
      [leadId, type, JSON.stringify(metadata), actorId],
    );
    if (actorId) await audit(tx, actorId, `lead.${type}`, "lead", leadId, metadata);
    return row.id;
  });
}

export async function updateRequestBrief(db: Db, requestId: string, brief: ProjectBrief, actorId: string) {
  return db.tx(async (tx) => {
    const [r] = await tx.query<{ lead_id: string }>(
      `update public.service_requests set brief_json=$2::jsonb where id=$1 returning lead_id`,
      [requestId, JSON.stringify(brief)],
    );
    if (!r) return false;
    await tx.query(
      `insert into public.lead_events (lead_id, type, metadata_json, actor_id) values ($1,'brief_edited',$2::jsonb,$3)`,
      [r.lead_id, JSON.stringify({ requestId }), actorId],
    );
    await audit(tx, actorId, "request.brief_edit", "service_request", requestId, {});
    return true;
  });
}

export async function setLeadSummary(db: Db, id: string, summary: string, nextAction: string, actorId: string, model: string) {
  await db.tx(async (tx) => {
    await tx.query(`update public.leads set ai_summary=$2, ai_next_action=$3, ai_summary_at=now() where id=$1`, [id, summary, nextAction]);
    await tx.query(
      `insert into public.lead_events (lead_id, type, metadata_json, actor_id) values ($1,'summary_generated',$2::jsonb,$3)`,
      [id, JSON.stringify({ model }), actorId],
    );
  });
}

export async function updateConsultation(
  db: Db,
  id: string,
  patch: { status: ConsultationStatus; startAt?: string | null; endAt?: string | null },
  actorId: string,
) {
  return db.tx(async (tx) => {
    const [c] = await tx.query<{ lead_id: string; status: string }>(`select lead_id, status from public.consultations where id=$1 for update`, [id]);
    if (!c) return false;
    await tx.query(
      `update public.consultations set status=$2, start_at=coalesce($3, start_at), end_at=coalesce($4, end_at),
         provider = case when $2 = 'confirmed' and provider = 'none' then 'manual' else provider end where id=$1`,
      [id, patch.status, patch.startAt ?? null, patch.endAt ?? null],
    );
    await tx.query(
      `insert into public.lead_events (lead_id, type, metadata_json, actor_id) values ($1,'consultation_updated',$2::jsonb,$3)`,
      [c.lead_id, JSON.stringify({ consultationId: id, from: c.status, to: patch.status, startAt: patch.startAt ?? null }), actorId],
    );
    await audit(tx, actorId, "consultation.update", "consultation", id, { from: c.status, ...patch });
    return true;
  });
}

export async function leadStats(db: Db) {
  const byStage = await db.query<{ status: LeadStage; n: string | number }>(`select status, count(*) as n from public.leads group by status`);
  const byDept = await db.query<{ slug: string | null; n: string | number }>(
    `select d.slug, count(*) as n from public.leads l left join public.departments d on d.id = l.department_id group by d.slug`,
  );
  const byService = await db.query<{ title: string | null; n: string | number }>(
    `select s.title, count(*) as n from public.service_requests r left join public.services s on s.id = r.service_id group by s.title order by n desc limit 10`,
  );
  const byKind = await db.query<{ kind: string; n: string | number }>(`select kind, count(*) as n from public.service_requests group by kind`);
  const last7 = await db.query<{ n: string | number }>(`select count(*) as n from public.leads where created_at > now() - interval '7 days'`);
  return {
    byStage: Object.fromEntries(byStage.map((r) => [r.status, Number(r.n)])) as Partial<Record<LeadStage, number>>,
    byDepartment: byDept.map((r) => ({ key: r.slug ?? "unassigned", n: Number(r.n) })),
    byService: byService.map((r) => ({ key: r.title ?? "No specific service", n: Number(r.n) })),
    byKind: byKind.map((r) => ({ key: r.kind, n: Number(r.n) })),
    last7Days: Number(last7[0]?.n ?? 0),
  };
}

// ─────────────────────────────────────────────────────────────
// Admin users & audit
// ─────────────────────────────────────────────────────────────
export async function upsertAdminUser(db: Db, email: string, role: string) {
  const [row] = await db.query<{ id: string }>(
    `insert into public.admin_users (email, role, last_login_at) values (lower($1), $2, now())
     on conflict (email) do update set role = excluded.role, last_login_at = now() returning id`,
    [email, role],
  );
  return row.id;
}

export async function audit(db: Db, actorId: string | null, action: string, entityType: string, entityId: string, diff: unknown) {
  await db.query(
    `insert into public.audit_logs (actor_id, action, entity_type, entity_id, diff) values ($1,$2,$3,$4,$5::jsonb)`,
    [actorId, action, entityType, entityId, JSON.stringify(diff ?? {})],
  );
}

export async function listAudit(db: Db, limit = 100) {
  const rows = await db.query<{ id: string; action: string; entity_type: string; entity_id: string; diff: unknown; created_at: unknown; email: string | null }>(
    `select l.id, l.action, l.entity_type, l.entity_id, l.diff, l.created_at, a.email from public.audit_logs l
     left join public.admin_users a on a.id = l.actor_id order by l.created_at desc limit $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, created_at: iso(r.created_at)! }));
}

function pick<T extends object>(obj: T, keysFrom: object): Partial<T> {
  const out: Partial<T> = {};
  for (const k of Object.keys(keysFrom) as (keyof T)[]) out[k] = obj[k];
  return out;
}
