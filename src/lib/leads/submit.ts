import type { Db } from "@/lib/db/driver";
import {
  createSubmission,
  DuplicateReferenceError,
  getService,
  listServices,
  SlotUnavailableError,
  type SubmissionInput,
  addLeadEvent,
  listLeads,
} from "@/lib/db/repository";
import type { CalendarAdapter } from "@/lib/calendar/adapter";
import type { Notifier } from "@/lib/notify/adapter";
import { referenceCode as makeReference } from "@/lib/security/crypto";
import { staffById } from "@/content/staff";
import type { DepartmentSlug } from "@/lib/types";
import { fieldErrors, submissionSchema } from "./schema";
import { formatInZone } from "@/lib/calendar/time";

export type SubmitOutcome =
  | {
      ok: true;
      reference: string;
      kind: string;
      replayed: boolean;
      consultation: { status: string; startAt: string | null } | null;
      notification: "dev_outbox" | "not_configured";
    }
  | { ok: false; status: number; code: string; message: string; fields?: Record<string, string> };

const KIND_LABEL: Record<string, string> = {
  quote: "quote request",
  consultation: "consultation request",
  callback: "callback request",
  brief: "project brief",
};

export async function submitRequest(
  deps: { db: Db; calendar: CalendarAdapter; notifier: Notifier; timezone: string; minElapsedMs?: number },
  raw: unknown,
): Promise<SubmitOutcome> {
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, status: 422, code: "invalid", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) };
  }
  const s = parsed.data;

  // Spam controls: honeypot + minimum human fill time.
  if (s.website) return { ok: false, status: 400, code: "rejected", message: "We couldn't accept this submission. Please try again." };
  if (s.elapsedMs < (deps.minElapsedMs ?? 2500)) {
    return { ok: false, status: 400, code: "too_fast", message: "That was quick! Please review your details and submit again." };
  }

  // Resolve services against the live catalogue (unknown slugs are dropped).
  const active = new Map((await listServices(deps.db)).map((x) => [x.slug, x]));
  const serviceSlugs = s.brief.serviceSlugs.filter((x) => active.has(x));
  const primarySlug = s.primaryServiceSlug && active.has(s.primaryServiceSlug) ? s.primaryServiceSlug : serviceSlugs[0] ?? null;
  const primary = primarySlug ? await getService(deps.db, primarySlug) : null;
  const departmentSlug: DepartmentSlug = primary?.departmentSlug ?? (s.kind === "consultation" ? "strategy" : "reception");

  // Consultation: only a connected calendar can confirm a slot.
  let consultation: SubmissionInput["consultation"] = null;
  if (s.consultation?.mode === "slot") {
    if (!deps.calendar.connected) {
      return { ok: false, status: 409, code: "calendar_not_connected", message: "Live booking isn't connected. Please choose a preferred time instead." };
    }
    const slot = await deps.calendar.validate(deps.db, s.consultation.slotStart);
    if (!slot) return { ok: false, status: 409, code: "slot_taken", message: "That time was just taken. Please choose another slot." };
    consultation = { mode: "slot", startAt: slot.start, endAt: slot.end, timezone: s.consultation.timezone, provider: deps.calendar.id, providerEventId: null };
  } else if (s.consultation?.mode === "preferred") {
    consultation = {
      mode: "preferred",
      window: { date: s.consultation.date, timeOfDay: s.consultation.timeOfDay, note: s.consultation.note },
      timezone: s.consultation.timezone,
    };
  }

  const transcript =
    s.attachTranscript && s.sessionId
      ? s.transcript
          .filter((t) => staffById.has(t.staffId) && t.messages.length)
          .map((t) => ({ staffId: t.staffId, departmentSlug: staffById.get(t.staffId)!.departmentSlug, messages: t.messages }))
      : [];

  const base: Omit<SubmissionInput, "referenceCode"> = {
    idempotencyKey: s.idempotencyKey,
    kind: s.kind,
    contact: s.contact,
    marketingConsent: s.consent.marketing,
    brief: { ...s.brief, serviceSlugs },
    primaryServiceSlug: primarySlug,
    departmentSlug,
    sessionId: s.sessionId,
    locale: s.locale,
    transcript,
    consultation,
  };

  let result;
  for (let attempt = 0; ; attempt++) {
    try {
      result = await createSubmission(deps.db, { ...base, referenceCode: makeReference() });
      break;
    } catch (err) {
      if (err instanceof DuplicateReferenceError && attempt < 3) continue;
      if (err instanceof SlotUnavailableError) {
        return { ok: false, status: 409, code: "slot_taken", message: "That time was just taken. Please choose another slot." };
      }
      throw err;
    }
  }

  // Post-commit notifications are best-effort: the request is already saved.
  let notification: "dev_outbox" | "not_configured" = "not_configured";
  if (!result.replayed) {
    const to = s.contact.preferredChannel === "email" ? s.contact.email : s.contact.phone;
    const when =
      result.consultationStatus === "confirmed" && result.consultationStartAt
        ? ` Your consultation is confirmed for ${formatInZone(result.consultationStartAt, s.consultation?.timezone ?? deps.timezone)}.`
        : result.consultationStatus === "pending_confirmation"
          ? " Your preferred consultation time is pending confirmation by our team."
          : "";
    try {
      if (to) {
        const r = await deps.notifier.send({
          channel: s.contact.preferredChannel === "email" ? "email" : "phone",
          to,
          subject: `Softgress ${KIND_LABEL[s.kind]} received — ${result.reference}`,
          body: `Hi ${s.contact.name}, we've received your ${KIND_LABEL[s.kind]} (reference ${result.reference}).${when} A member of the Softgress team will reply. This is not a contract or payment request.`,
        });
        if (r.outbox) notification = "dev_outbox";
      }
      await deps.notifier.send({
        channel: "staff",
        to: "staff",
        subject: `New ${KIND_LABEL[s.kind]} ${result.reference} (${departmentSlug})`,
        body: `Service: ${primary?.title ?? "not specified"}. Open the CRM inbox to review.`,
      });
      const [lead] = await listLeads(deps.db, { q: result.reference });
      if (lead) await addLeadEvent(deps.db, lead.id, "notification", { visitor: notification, staff: deps.notifier.devOutbox ? "dev_outbox" : "not_configured" }, null);
    } catch {
      // Swallow: notification failure must not turn a committed request into an error.
    }
  }

  return {
    ok: true,
    reference: result.reference,
    kind: result.kind,
    replayed: result.replayed,
    consultation: result.consultationStatus ? { status: result.consultationStatus, startAt: result.consultationStartAt } : null,
    notification,
  };
}
