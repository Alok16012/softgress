"use client";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import { CheckCircle2, Copy, Loader2, Mail, MessageCircle, Phone, Send } from "lucide-react";

export interface EnquiryServiceGroup {
  name: string;
  services: { slug: string; title: string }[];
}

type Channel = "phone" | "whatsapp" | "email";

const CHANNELS: { value: Channel; label: string; icon: typeof Phone }[] = [
  { value: "phone", label: "Call me", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
];

/** Stored on the lead so the team can tell quick enquiries from full project requests. */
export const ENQUIRY_PROJECT_TYPE = "Website enquiry";

/**
 * One-step customer enquiry form.
 *
 * - mode "save": posts to /api/leads as a "brief" request, so it gets the same
 *   validation, spam controls, reference code and CRM entry as the full flow.
 * - mode "direct": used when no database is configured. Nothing is stored; the
 *   form opens WhatsApp (or the mail app) with the enquiry written out, and the
 *   visitor presses send themselves.
 */
export function EnquiryForm({
  groups,
  whatsappNumber,
  mode = "save",
  directWhatsapp,
  directEmail = null,
  initialService = "",
  variant = "full",
  projectType = ENQUIRY_PROJECT_TYPE,
  bare = false,
  onSent,
  className,
}: {
  groups: EnquiryServiceGroup[];
  whatsappNumber: string | null;
  mode?: "save" | "direct";
  /** Company WhatsApp number for direct mode, e.g. "+917447207700". */
  directWhatsapp: string;
  /** Company email for direct mode. */
  directEmail?: string | null;
  initialService?: string;
  /** "short": name, phone, service and an optional one-line requirement (used by the pop-up). */
  variant?: "full" | "short";
  /** Stored on the lead so the team can see which form it came from. */
  projectType?: string;
  /** Drop the glass panel styling when the form sits inside another panel. */
  bare?: boolean;
  /** Called once the enquiry is saved or handed to WhatsApp/email. */
  onSent?: () => void;
  className?: string;
}) {
  const direct = mode === "direct";
  const short = variant === "short";
  const panel = bare ? "" : "glass rounded-[28px] p-6 sm:p-8";
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const channels = CHANNELS.filter((c) => c.value !== "whatsapp" || whatsappNumber || direct);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(initialService);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<Channel>(whatsappNumber || direct ? "whatsapp" : "phone");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sentVia, setSentVia] = useState<"whatsapp" | "email" | null>(null);

  // Initialised on first render: the server rejects forms submitted faster than a person could fill them.
  const [openedAt] = useState(() => Date.now());
  const idempotencyKey = useRef<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setService(initialService);
    setMessage("");
    setConsent(false);
    setErrors({});
    setFormError(null);
    setReference(null);
    setCopied(false);
    setSentVia(null);
    idempotencyKey.current = null;
  };

  const validate = () => {
    const local: Record<string, string> = {};
    if (name.trim().length < 2) local["contact.name"] = "Please enter your name";
    if (!phone.trim()) local["contact.phone"] = "Please enter your phone number";
    if (channel === "email" && !email.trim()) local["contact.email"] = "Email is required for email replies";
    if (!short && message.trim().length < 10) local["brief.notes"] = "Tell us a little more (at least 10 characters)";
    if (!direct && !consent) local["consent.contact"] = "Please confirm we may contact you about this enquiry";
    setErrors(local);
    return Object.keys(local).length === 0;
  };

  const enquiryText = () => {
    const serviceTitle = groups.flatMap((g) => g.services).find((x) => x.slug === service)?.title ?? "Not sure yet";
    const reply = channel === "phone" ? "Phone call" : channel === "whatsapp" ? "WhatsApp" : "Email";
    return [
      "Hi Softgress, I have an enquiry.",
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      ...(email.trim() ? [`Email: ${email.trim()}`] : []),
      `Interested in: ${serviceTitle}`,
      `Preferred reply: ${reply}`,
      ...(message.trim() ? ["", message.trim()] : []),
    ].join("\n");
  };

  /** Direct mode: hand the enquiry to WhatsApp or the mail app. Runs inside the click so pop-up blockers allow it. */
  const sendDirect = (via: "whatsapp" | "email") => {
    setFormError(null);
    if (!validate()) return;
    const text = enquiryText();
    if (via === "whatsapp") {
      window.open(`https://wa.me/${directWhatsapp.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } else if (directEmail) {
      window.location.href = `mailto:${directEmail}?subject=${encodeURIComponent(`Website enquiry from ${name.trim()}`)}&body=${encodeURIComponent(text)}`;
    }
    setSentVia(via);
    onSent?.();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (direct) {
      sendDirect("whatsapp");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    idempotencyKey.current ??= crypto.randomUUID();
    const payload = {
      idempotencyKey: idempotencyKey.current,
      kind: "brief",
      contact: { name, email, phone, preferredChannel: channel },
      consent: { contact: true, marketing: false },
      brief: { projectType, serviceSlugs: service ? [service] : [], notes: message },
      primaryServiceSlug: service || null,
      locale: navigator.language?.slice(0, 12) ?? null,
      website,
      elapsedMs: Date.now() - openedAt,
    };
    try {
      const r = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.ok) {
        setReference(j.reference as string);
        onSent?.();
        return;
      }
      const err = j?.error;
      if (err?.fields) setErrors(err.fields);
      setFormError(err?.message ?? "We couldn't send your enquiry. Nothing was submitted, so please try again.");
    } catch {
      setFormError("Network problem: your enquiry was NOT sent. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sentVia) {
    return (
      <div className={clsx(panel, !bare && "sm:p-10", "text-center", className)} role="status" aria-live="polite">
        <CheckCircle2 size={52} className="mx-auto text-teal" aria-hidden />
        <h3 className="mt-4 font-display text-[28px] font-bold leading-tight">Almost done, {name.trim().split(/\s+/)[0]}!</h3>
        <p className="mx-auto mt-2 max-w-md text-white/75">
          {sentVia === "whatsapp"
            ? "We opened WhatsApp with your enquiry written out. Press send in WhatsApp to deliver it to the Softgress team."
            : "We opened your email app with your enquiry written out. Press send there to deliver it to the Softgress team."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={() => sendDirect(sentVia)}>
            {sentVia === "whatsapp" ? <MessageCircle size={17} aria-hidden /> : <Mail size={17} aria-hidden />} Open {sentVia === "whatsapp" ? "WhatsApp" : "email"} again
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  if (reference) {
    const via = channel === "phone" ? "a call" : channel === "whatsapp" ? "WhatsApp" : "email";
    return (
      <div className={clsx(panel, !bare && "sm:p-10", "text-center", className)} role="status" aria-live="polite">
        <CheckCircle2 size={52} className="mx-auto text-teal" aria-hidden />
        <h3 className="mt-4 font-display text-[28px] font-bold leading-tight">Thank you, {name.trim().split(/\s+/)[0]}!</h3>
        <p className="mt-2 text-white/75">Your enquiry has been received. Our team will get back to you on {via}.</p>
        <p className="mt-6 text-sm text-white/60">Your reference code</p>
        <div className="mt-2 inline-flex items-center gap-3 rounded-2xl border border-teal/50 bg-teal/10 px-5 py-3">
          <code className="text-2xl font-bold tracking-widest text-mint" data-testid="enquiry-reference">
            {reference}
          </code>
          <button
            type="button"
            className="hud-btn"
            aria-label="Copy reference code"
            onClick={() => {
              void navigator.clipboard?.writeText(reference);
              setCopied(true);
            }}
          >
            <Copy size={18} aria-hidden />
            {copied && <span className="text-xs">Copied</span>}
          </button>
        </div>
        <p className="mt-3 text-xs text-white/50">Keep this code to check the status of your enquiry. This is an enquiry, not a contract or payment.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {whatsappNumber && (
            <a href={`https://wa.me/${whatsappNumber.replace(/^\+/, "")}?text=${encodeURIComponent(`Hi Softgress, I just sent an enquiry. Reference: ${reference}`)}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle size={17} aria-hidden /> Chat on WhatsApp now
            </a>
          )}
          <Link href="/status" className="btn-ghost">
            Check status
          </Link>
          <button type="button" className="btn-ghost" onClick={reset}>
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  return (
    <form noValidate onSubmit={submit} className={clsx(panel, "relative", className)} aria-label={short ? "Quick enquiry form" : "Customer enquiry form"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={id("name")}>
            Full name *
          </label>
          <input id={id("name")} className="field" autoComplete="name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(err("contact.name"))} aria-describedby={err("contact.name") ? id("name-err") : undefined} placeholder="Your name" />
          {err("contact.name") && <p id={id("name-err")} className="field-error">{err("contact.name")}</p>}
        </div>
        <div>
          <label className="label" htmlFor={id("phone")}>
            Phone / WhatsApp number *
          </label>
          <input id={id("phone")} className="field" type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={30} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(err("contact.phone"))} aria-describedby={err("contact.phone") ? id("phone-err") : undefined} placeholder="+91 98765 43210" />
          {err("contact.phone") && <p id={id("phone-err")} className="field-error">{err("contact.phone")}</p>}
        </div>
        {!short && (
        <div>
          <label className="label" htmlFor={id("email")}>
            Email address{channel === "email" ? " *" : " (optional)"}
          </label>
          <input id={id("email")} className="field" type="email" autoComplete="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(err("contact.email"))} aria-describedby={err("contact.email") ? id("email-err") : undefined} placeholder="you@company.com" />
          {err("contact.email") && <p id={id("email-err")} className="field-error">{err("contact.email")}</p>}
        </div>
        )}
        <div className={short ? "sm:col-span-2" : undefined}>
          <label className="label" htmlFor={id("service")}>
            I&apos;m interested in
          </label>
          <select id={id("service")} className="field" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Not sure yet / something else</option>
            {groups.map((g) => (
              <optgroup key={g.name} label={g.name}>
                {g.services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {short ? (
          <div className="sm:col-span-2">
            <label className="label" htmlFor={id("message")}>
              Your requirement (optional)
            </label>
            <input id={id("message")} className="field" value={message} maxLength={300} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. A website for my restaurant" />
          </div>
        ) : (
        <div className="sm:col-span-2">
          <label className="label" htmlFor={id("message")}>
            Your enquiry *
          </label>
          <textarea id={id("message")} className="field min-h-[130px] resize-y" value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} aria-invalid={Boolean(err("brief.notes"))} aria-describedby={err("brief.notes") ? id("message-err") : undefined} placeholder="Tell us what you need: a website, an app, ads, branding, automation… and anything else we should know." />
          <div className="mt-1 flex justify-between gap-4">
            {err("brief.notes") ? <p id={id("message-err")} className="field-error !mt-0">{err("brief.notes")}</p> : <span />}
            <span className="text-xs text-white/40">{message.length}/2000</span>
          </div>
        </div>
        )}
      </div>

      {!short && (
      <fieldset className="mt-5">
        <legend className="label">How should we reply?</legend>
        <div className="flex flex-wrap gap-2">
          {channels.map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" className="chip !py-2 !px-4 !text-[14px]" aria-pressed={channel === value} onClick={() => setChannel(value)}>
              <Icon size={15} aria-hidden /> {label}
            </button>
          ))}
        </div>
      </fieldset>
      )}

      {/* Honeypot: hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {!direct && (
      <label className="mt-5 flex items-start gap-3 text-sm text-white/80">
        <input type="checkbox" className="mt-0.5 h-5 w-5 flex-none accent-teal" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(err("consent.contact"))} />
        <span>
          I agree that Softgress may contact me about this enquiry using the details above. *
          {err("consent.contact") && <span className="block field-error">{err("consent.contact")}</span>}
        </span>
      </label>
      )}

      {formError && (
        <p role="alert" className="mt-5 rounded-xl border border-[#ff7b7b]/40 bg-[#ff7b7b]/10 px-4 py-3 text-sm text-[#ffd0d0]">
          {formError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xs text-xs text-white/45">
          {direct ? "Your enquiry opens in WhatsApp or email; nothing is stored on this website. " : "We use your details only to reply. "}See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
            privacy notice
          </Link>
          .
        </p>
        {direct ? (
          <div className="flex flex-wrap gap-3">
            {directEmail && (
              <button type="button" className="btn-ghost" onClick={() => sendDirect("email")}>
                <Mail size={16} aria-hidden /> Send by email
              </button>
            )}
            <button type="submit" className="btn-primary">
              <MessageCircle size={17} aria-hidden /> Send on WhatsApp
            </button>
          </div>
        ) : (
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              Send enquiry <Send size={16} aria-hidden />
            </>
          )}
        </button>
        )}
      </div>
    </form>
  );
}
