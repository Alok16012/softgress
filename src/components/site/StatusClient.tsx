"use client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Status {
  reference: string;
  kind: string;
  status: string;
  createdAt: string;
  service: string | null;
  consultation: { status: string; startAt: string | null; timezone: string | null } | null;
}

const STATUS_TEXT: Record<string, string> = {
  submitted: "Received: waiting for review",
  in_review: "In review with the team",
  proposal_sent: "Proposal sent",
  closed: "Closed",
};

export function StatusClient({ devOutbox }: { devOutbox: boolean }) {
  const [step, setStep] = useState<"ask" | "code" | "done">("ask");
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  const post = async (url: string, body: unknown) => {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error?.message ?? "Something went wrong. Please try again.");
      return j;
    } catch (e) {
      setErr((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (step === "done" && status) {
    return (
      <div className="glass rounded-3xl p-6" role="status">
        <p className="text-sm text-white/60">Reference</p>
        <p className="text-2xl font-bold tracking-widest text-mint">{status.reference}</p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-white/60">Request</dt>
          <dd className="capitalize">{status.kind}{status.service ? `: ${status.service}` : ""}</dd>
          <dt className="text-white/60">Status</dt>
          <dd>{STATUS_TEXT[status.status] ?? status.status}</dd>
          <dt className="text-white/60">Submitted</dt>
          <dd>{new Date(status.createdAt).toLocaleString()}</dd>
          {status.consultation && (
            <>
              <dt className="text-white/60">Consultation</dt>
              <dd>
                {status.consultation.status === "confirmed" && status.consultation.startAt
                  ? `Confirmed for ${new Date(status.consultation.startAt).toLocaleString()}`
                  : status.consultation.status === "pending_confirmation"
                    ? "Pending confirmation by the team"
                    : status.consultation.status}
              </dd>
            </>
          )}
        </dl>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6">
      {err && <p role="alert" className="mb-4 rounded-xl border border-red-300/40 bg-red-400/10 px-4 py-3 text-sm text-red-100">{err}</p>}
      {msg && <p role="status" className="mb-4 rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm">{msg}</p>}
      {step === "ask" ? (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const j = await post("/api/status/request-code", { reference, contact });
            if (j) {
              setMsg(j.message);
              if (j.delivery !== "none") setStep("code");
            }
          }}
        >
          <div>
            <label className="label" htmlFor="ref">Reference code</label>
            <input id="ref" className="field uppercase" placeholder="SG-XXXX-XXXX" value={reference} onChange={(e) => setReference(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="contact">Email or phone used on the request</label>
            <input id="contact" className="field" value={contact} onChange={(e) => setContact(e.target.value)} required autoComplete="email" />
          </div>
          <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="animate-spin" size={16} aria-hidden />} Send verification code</button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const j = await post("/api/status/verify", { reference, code });
            if (j?.status) {
              setStatus(j.status);
              setStep("done");
            }
          }}
        >
          <div>
            <label className="label" htmlFor="code">6-digit code</label>
            <input id="code" className="field tracking-[0.4em]" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required autoComplete="one-time-code" />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="animate-spin" size={16} aria-hidden />} View status</button>
            <button type="button" className="btn-ghost" onClick={() => setStep("ask")}>Start over</button>
          </div>
          {devOutbox && (
            <p className="text-xs text-[#ffd75e]">
              Development: no email/SMS provider is connected. The code is in the <Link href="/dev/outbox" className="underline" target="_blank">dev outbox</Link>.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
