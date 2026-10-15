"use client";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Copy, FileText, Loader2, PhoneCall, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RequestKind } from "@/lib/types";
import { useBrief, briefIsEmpty } from "@/stores/brief";
import { useChat } from "@/stores/chat";
import { useCatalog } from "./CatalogContext";
import { BriefEditor } from "./BriefEditor";

const KINDS: { kind: RequestKind; title: string; desc: string; icon: typeof Receipt }[] = [
  { kind: "quote", title: "Request a quote", desc: "Get a scoped proposal and quote for your project.", icon: Receipt },
  { kind: "consultation", title: "Book a consultation", desc: "A conversation with our team about goals and options.", icon: CalendarClock },
  { kind: "callback", title: "Request a callback", desc: "We'll call you back on your preferred number.", icon: PhoneCall },
  { kind: "brief", title: "Submit project brief", desc: "Send your requirements for review, no meeting needed.", icon: FileText },
];

type Step = "kind" | "brief" | "schedule" | "contact" | "done";
interface Slot {
  start: string;
  end: string;
}
interface Success {
  reference: string;
  kind: RequestKind;
  consultation: { status: string; startAt: string | null } | null;
  notification: "dev_outbox" | "not_configured";
  replayed: boolean;
}

function fmt(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** Submission flow used by the /contact page. */
export function RequestFlow({ initialKind }: { initialKind?: RequestKind }) {
  const { config } = useCatalog();
  const brief = useBrief((b) => b.brief);
  const resetBrief = useBrief((b) => b.reset);
  const chat = useChat();
  const [kind, setKind] = useState<RequestKind | null>(initialKind ?? null);
  const [step, setStep] = useState<Step>(initialKind ? "brief" : "kind");
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);
  const idempotencyKey = useRef(crypto.randomUUID());
  const visitorTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || config.calendar.timezone, [config.calendar.timezone]);

  // Contact & consent
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [channel, setChannel] = useState<"email" | "phone" | "whatsapp">("email");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [attach, setAttach] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  // Schedule
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsState, setSlotsState] = useState<"idle" | "loading" | "error">("idle");
  const [slot, setSlot] = useState<string | null>(null);
  const [prefDate, setPrefDate] = useState("");
  const [prefTime, setPrefTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [prefNote, setPrefNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const hasChat = Object.values(chat.threads).some((t) => t.messages.some((m) => !m.note && m.role === "user"));

  const loadSlots = async () => {
    setSlotsState("loading");
    try {
      const r = await fetch("/api/consultations/slots");
      const j = await r.json();
      if (!r.ok) throw new Error();
      setSlots(j.connected ? j.slots : []);
      setSlotsState("idle");
    } catch {
      setSlotsState("error");
      setSlots([]);
    }
  };

  const steps: Step[] = kind === "consultation" ? ["kind", "brief", "schedule", "contact"] : ["kind", "brief", "contact"];
  const idx = steps.indexOf(step);
  const next = () => {
    const to = steps[Math.min(steps.length - 1, idx + 1)];
    if (to === "schedule" && config.calendar.connected && slots === null) void loadSlots();
    setStep(to);
  };
  const back = () => setStep(steps[Math.max(0, idx - 1)]);

  const today = new Date();
  const minDate = new Date(today.getTime() + 86_400_000).toISOString().slice(0, 10);
  const maxDate = new Date(today.getTime() + 90 * 86_400_000).toISOString().slice(0, 10);

  const scheduleValid = kind !== "consultation" || (config.calendar.connected && slots && slots.length ? Boolean(slot) : Boolean(prefDate));

  const submit = async () => {
    setFormError(null);
    setErrors({});
    const local: Record<string, string> = {};
    if (name.trim().length < 2) local["contact.name"] = "Please enter your name";
    if (!email.trim() && !phone.trim()) local["contact.email"] = "Add an email or a phone number so we can reply";
    if (channel === "email" && !email.trim()) local["contact.email"] = "Email is required for email replies";
    if (channel !== "email" && !phone.trim()) local["contact.phone"] = "Phone is required for phone/WhatsApp replies";
    if (!consent) local["consent.contact"] = "Please confirm we may contact you about this request";
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    setSubmitting(true);
    const useSlot = kind === "consultation" && config.calendar.connected && slot;
    const payload = {
      idempotencyKey: idempotencyKey.current,
      kind,
      contact: { name, email, phone, company, preferredChannel: channel },
      consent: { contact: consent, marketing },
      brief,
      primaryServiceSlug: brief.serviceSlugs[0] ?? null,
      sessionId: chat.sessionId,
      locale: navigator.language?.slice(0, 12) ?? null,
      attachTranscript: attach,
      transcript: attach
        ? Object.values(chat.threads)
            .filter((t) => t.messages.length)
            .map((t) => ({
              staffId: t.staffId,
              messages: t.messages.filter((m) => !m.note && m.status !== "error" && m.content.trim()).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
            }))
        : [],
      consultation:
        kind !== "consultation"
          ? null
          : useSlot
            ? { mode: "slot", slotStart: slot, timezone: visitorTz }
            : { mode: "preferred", date: prefDate, timeOfDay: prefTime, note: prefNote, timezone: visitorTz },
      website,
      elapsedMs: Date.now() - openedAt.current,
    };
    try {
      const r = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.ok) {
        setSuccess(j as Success);
        setStep("done");
        resetBrief();
        return;
      }
      const err = j?.error;
      if (err?.code === "slot_taken") {
        setSlot(null);
        setSlots(null);
        setStep("schedule");
        setFormError(err.message);
        void loadSlots();
      } else if (err?.fields) {
        setErrors(err.fields);
        setFormError(err.message);
        if (Object.keys(err.fields).some((k: string) => k.startsWith("brief"))) setStep("brief");
      } else {
        setFormError(err?.message ?? "We couldn't save your request. Nothing was submitted; please try again.");
      }
    } catch {
      setFormError("Network problem: your request was NOT submitted. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done" && success) {
    const c = success.consultation;
    return (
      <div className="text-center py-4" role="status" aria-live="polite">
        <CheckCircle2 size={52} className="mx-auto text-teal" aria-hidden />
        <h3 className="mt-3 text-2xl font-bold">Request received</h3>
        <p className="mt-2 text-white/75">Saved securely. Your reference code:</p>
        <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-teal/50 bg-teal/10 px-5 py-3">
          <code className="text-2xl font-bold tracking-widest text-mint" data-testid="reference-code">
            {success.reference}
          </code>
          <button type="button" className="hud-btn" aria-label="Copy reference" onClick={() => void navigator.clipboard?.writeText(success.reference)}>
            <Copy size={18} />
          </button>
        </div>
        {c && (
          <p className="mt-4 text-sm">
            {c.status === "confirmed" && c.startAt ? (
              <>
                Consultation <strong className="text-mint">confirmed</strong> for {fmt(c.startAt, visitorTz)} ({visitorTz}).
                {config.calendar.devOnly && <span className="block mt-1 badge badge-warn">Development mock calendar: no real calendar invite is sent</span>}
              </>
            ) : (
              <>
                Your preferred time is <strong className="text-[#ffd75e]">pending confirmation</strong>. A team member will confirm a slot; it isn&apos;t booked yet.
              </>
            )}
          </p>
        )}
        <ul className="mt-5 text-left text-sm text-white/80 space-y-1.5 max-w-md mx-auto list-disc pl-5">
          <li>A Softgress team member will review your request and reply via your preferred channel.</li>
          <li>This is a request, not a contract or payment.</li>
          {success.notification === "dev_outbox" ? (
            <li>Development: the confirmation message was written to the dev outbox, not emailed.</li>
          ) : (
            <li>Automatic confirmation messages aren&apos;t configured on this site yet; keep your reference code.</li>
          )}
        </ul>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/status" className="btn-ghost">
            Check status later
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="flex items-center gap-2 text-xs text-white/60 mb-5" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 ${i === idx ? "text-mint font-semibold" : ""}`} aria-current={i === idx ? "step" : undefined}>
            <span className={`grid place-items-center w-6 h-6 rounded-full border ${i <= idx ? "border-teal bg-teal/20" : "border-white/25"}`}>{i + 1}</span>
            <span className="hidden sm:inline capitalize">{s === "kind" ? "Request type" : s === "brief" ? "Review brief" : s === "schedule" ? "Time" : "Contact"}</span>
            {i < steps.length - 1 && <span className="w-5 h-px bg-white/20" aria-hidden />}
          </li>
        ))}
      </ol>

      {formError && (
        <div role="alert" className="mb-4 rounded-xl border border-red-300/40 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {formError}
        </div>
      )}

      {step === "kind" && (
        <div>
          <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Request type">
            {KINDS.map(({ kind: k, title, desc, icon: Icon }) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={`text-left rounded-2xl border p-4 transition ${kind === k ? "border-teal bg-teal/10" : "border-white/15 hover:border-white/35"}`}
              >
                <Icon className="text-teal" size={22} aria-hidden />
                <span className="mt-2 block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-white/65">{desc}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/55">A request isn&apos;t a payment or a contract. No payment is collected on this site.</p>
          <div className="mt-5 flex justify-end">
            <button type="button" className="btn-primary" disabled={!kind} onClick={next}>
              Continue <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === "brief" && (
        <div>
          {briefIsEmpty(brief) && (
            <p className="mb-4 text-sm text-white/70">Your brief is empty. Add a few details below, or continue and describe it to us later.</p>
          )}
          <BriefEditor errors={errors} compact />
          <div className="mt-6 flex justify-between">
            <button type="button" className="btn-ghost" onClick={back}>
              <ArrowLeft size={18} aria-hidden /> Back
            </button>
            <button type="button" className="btn-primary" onClick={next}>
              Continue <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === "schedule" && (
        <div>
          {config.calendar.connected ? (
            <>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-semibold">Choose a time</h3>
                {config.calendar.devOnly && <span className="badge badge-warn">Mock calendar · development only</span>}
              </div>
              <p className="text-sm text-white/65 mb-3">
                Times shown in your time zone ({visitorTz}). Team calendar: {config.calendar.timezone}.
              </p>
              {slotsState === "loading" && (
                <p className="flex items-center gap-2 text-white/70">
                  <Loader2 className="animate-spin" size={16} aria-hidden /> Loading real availability…
                </p>
              )}
              {slotsState === "error" && <p className="text-sm text-red-200">Availability couldn&apos;t be loaded. You can request a preferred time below instead.</p>}
              {slots && slots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-thin pr-1" role="radiogroup" aria-label="Available slots">
                  {slots.slice(0, 60).map((s) => (
                    <button key={s.start} type="button" role="radio" aria-checked={slot === s.start} className="chip justify-center !py-2.5" onClick={() => setSlot(s.start)}>
                      {fmt(s.start, visitorTz)}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}
          {(!config.calendar.connected || (slots !== null && slots.length === 0 && slotsState !== "loading")) && (
            <div className="space-y-4">
              <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-[#ffe08a]">
                Live booking isn&apos;t connected. Tell us a preferred time: it will be saved as <strong>pending confirmation</strong> and a team member will confirm.
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="pref-date">
                    Preferred date
                  </label>
                  <input id="pref-date" type="date" className="field" min={minDate} max={maxDate} value={prefDate} onChange={(e) => setPrefDate(e.target.value)} />
                  {errors["consultation.date"] && <p className="field-error">{errors["consultation.date"]}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="pref-time">
                    Time of day
                  </label>
                  <select id="pref-time" className="field" value={prefTime} onChange={(e) => setPrefTime(e.target.value as typeof prefTime)}>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label" htmlFor="pref-note">
                  Note (optional)
                </label>
                <input id="pref-note" className="field" maxLength={300} value={prefNote} onChange={(e) => setPrefNote(e.target.value)} placeholder="e.g. after 4 pm works best" />
              </div>
              <p className="text-xs text-white/55">Time zone: {visitorTz}</p>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <button type="button" className="btn-ghost" onClick={back}>
              <ArrowLeft size={18} aria-hidden /> Back
            </button>
            <button type="button" className="btn-primary" onClick={next} disabled={!scheduleValid}>
              Continue <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === "contact" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-name">
                Your name *
              </label>
              <input id="c-name" className="field" autoComplete="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors["contact.name"])} aria-describedby="c-name-e" />
              {errors["contact.name"] && (
                <p id="c-name-e" className="field-error">
                  {errors["contact.name"]}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="c-email">
                Email
              </label>
              <input id="c-email" type="email" className="field" autoComplete="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors["contact.email"])} aria-describedby="c-email-e" />
              {errors["contact.email"] && (
                <p id="c-email-e" className="field-error">
                  {errors["contact.email"]}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="c-phone">
                Phone
              </label>
              <input id="c-phone" type="tel" className="field" autoComplete="tel" value={phone} maxLength={30} placeholder="+91 98xxxxxx00" onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(errors["contact.phone"])} aria-describedby="c-phone-e" />
              {errors["contact.phone"] && (
                <p id="c-phone-e" className="field-error">
                  {errors["contact.phone"]}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="c-company">
                Company (optional)
              </label>
              <input id="c-company" className="field" autoComplete="organization" value={company} maxLength={120} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="c-channel">
                Preferred reply channel
              </label>
              <select id="c-channel" className="field" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
                <option value="email">Email</option>
                <option value="phone">Phone call</option>
                {config.whatsappNumber && <option value="whatsapp">WhatsApp</option>}
              </select>
            </div>
          </div>
          {/* Honeypot: hidden from people and assistive tech */}
          <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor="c-website">Website</label>
            <input id="c-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <fieldset className="mt-5 space-y-3 text-sm">
            <legend className="sr-only">Consent</legend>
            <label className="flex gap-3 items-start">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-teal" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(errors["consent.contact"])} />
              <span>
                I agree that Softgress may contact me about this request using the details above. *
                {errors["consent.contact"] && <span className="block field-error">{errors["consent.contact"]}</span>}
              </span>
            </label>
            <label className="flex gap-3 items-start">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-teal" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              <span className="text-white/80">Optional: send me occasional updates and insights. You can unsubscribe any time.</span>
            </label>
            {hasChat && (
              <label className="flex gap-3 items-start">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-teal" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
                <span className="text-white/80">Optional: attach my conversation with the AI guides so the team has context. Otherwise it isn&apos;t stored.</span>
              </label>
            )}
          </fieldset>
          <p className="mt-4 text-xs text-white/55">
            We use these details only to respond to this request. See our{" "}
            <Link href="/privacy" className="underline">
              privacy notice
            </Link>
            .
          </p>
          <div className="mt-6 flex justify-between gap-3">
            <button type="button" className="btn-ghost" onClick={back} disabled={submitting}>
              <ArrowLeft size={18} aria-hidden /> Back
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} aria-hidden /> Submitting…
                </>
              ) : (
                <>Submit {kind === "quote" ? "quote request" : kind === "consultation" ? "consultation request" : kind === "callback" ? "callback request" : "brief"}</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
