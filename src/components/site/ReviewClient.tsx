"use client";
import { useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const SERVICES: Record<string, string> = {
  Website: "built our website",
  "Online store": "built our online store",
  "Mobile app": "developed our mobile app",
  Software: "built our custom software",
  SEO: "handled our SEO",
  "Google / Meta ads": "ran our Google and Meta ads",
  "Social media": "managed our social media marketing",
  "Branding / design": "did our branding and design",
  Video: "produced our videos",
  "AI / WhatsApp": "set up our AI and WhatsApp automation",
};

const PLACES: Record<string, string> = {
  Pune: "in Pune",
  "Pimpri-Chinchwad": "in Pimpri-Chinchwad",
  Mumbai: "in Mumbai",
  Bangalore: "in Bangalore",
  "Other city": "",
  "Outside India": "outside India",
};

const EXPERIENCES = ["Excellent", "Very good", "Good", "Average", "Poor"];
const POSITIVE = ["Excellent", "Very good", "Good"];

const LIKED: Record<string, string> = {
  "On-time delivery": "on-time delivery",
  "Clear communication": "clear communication",
  "Great design": "great design",
  "Good support": "good support",
  "More enquiries": "more enquiries",
  "Fair pricing": "fair pricing",
};

const IMPROVE: Record<string, string> = {
  "Delivery time": "delivery time",
  Communication: "communication",
  Design: "design",
  Support: "support",
  Results: "results",
  Pricing: "pricing",
};

const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

/**
 * Builds one sentence purely from the visitor's own choices (service, place, how it went, what stood
 * out). The visitor can edit it before copying, and always picks the stars on Google.
 */
function sentence(service: string, place: string, experience: string, points: string[]) {
  const where = PLACES[place] ? ` for our business ${PLACES[place]}` : "";
  const parts = [service ? `Softgress ${SERVICES[service]}${where}.` : ""];
  if (experience) {
    const positive = POSITIVE.includes(experience);
    const verdict = experience === "Poor" ? "Not a good experience" : `${experience} experience`;
    const detail = points.map((p) => (positive ? LIKED[p] : IMPROVE[p])).filter(Boolean);
    parts.push(detail.length ? `${verdict}${positive ? ": " : ". Could be better: "}${join(detail)}.` : `${verdict}.`);
  }
  return parts.filter(Boolean).join(" ");
}

function Option({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "flex min-h-[56px] w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 text-left text-[16px] font-medium transition-colors active:scale-[0.98]",
        active ? "border-teal-dark bg-teal-dark/10 text-ink" : "border-ink/10 bg-white text-ink",
      )}
    >
      {label}
      {active && <Check size={18} className="flex-none text-teal-dark" aria-hidden />}
    </button>
  );
}

const TOTAL = 5;

/** One question per screen; single-choice answers move on automatically. */
export function ReviewClient({ reviewUrl }: { reviewUrl: string }) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("");
  const [place, setPlace] = useState("");
  const [experience, setExperience] = useState("");
  const [points, setPoints] = useState<string[]>([]);
  const [text, setText] = useState("");

  const positive = !experience || POSITIVE.includes(experience);
  const next = (to: number) => setTimeout(() => setStep(to), 180);

  function finish(p = points) {
    setText(sentence(service, place, experience, p));
    setStep(4);
  }

  async function go() {
    if (text.trim()) {
      try {
        await navigator.clipboard.writeText(text.trim());
      } catch {
        // Clipboard can be blocked; the visitor can still type on Google.
      }
    }
    window.location.href = reviewUrl;
  }

  const titles = ["Which service did you use?", "Where is your business?", "How was your experience?", positive ? "What stood out? (pick up to 2)" : "What could be better? (pick up to 2)", "Your review"];

  return (
    <section className="mt-6 rounded-[28px] bg-white p-5 text-ink shadow-xl sm:p-7">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="grid h-10 w-10 flex-none place-items-center rounded-full bg-paper" aria-label="Back">
            <ArrowLeft size={18} aria-hidden />
          </button>
        ) : (
          <span className="h-10 w-10 flex-none" />
        )}
        <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${TOTAL}`}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <span key={i} className={clsx("h-1.5 flex-1 rounded-full", i <= step ? "bg-teal-dark" : "bg-ink/10")} />
          ))}
        </div>
        <span className="h-10 w-10 flex-none" />
      </div>

      <h1 className="mt-5 font-display text-[24px] font-bold leading-tight">{titles[step]}</h1>

      {step === 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {Object.keys(SERVICES).map((s) => (
            <Option key={s} label={s} active={service === s} onClick={() => { setService(s); next(1); }} />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {Object.keys(PLACES).map((p) => (
            <Option key={p} label={p} active={place === p} onClick={() => { setPlace(p); next(2); }} />
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="mt-5 grid gap-2.5">
          {EXPERIENCES.map((e) => (
            <Option key={e} label={e} active={experience === e} onClick={() => { setExperience(e); setPoints([]); next(3); }} />
          ))}
        </div>
      )}

      {step === 3 && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {Object.keys(positive ? LIKED : IMPROVE).map((p) => (
              <Option
                key={p}
                label={p}
                active={points.includes(p)}
                onClick={() => setPoints((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p].slice(-2)))}
              />
            ))}
          </div>
          <button type="button" onClick={() => finish()} className="pill pill-dark mt-6 min-h-[56px] w-full justify-center text-[16px]">
            {points.length ? "Next" : "Skip"} <ArrowRight size={16} aria-hidden />
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <label className="mt-3 block text-[15px] text-steel" htmlFor="review-text">
            Edit it or add anything you like.
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border-2 border-ink/10 px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-teal-dark"
          />
          <button type="button" onClick={go} className="pill pill-dark mt-5 min-h-[56px] w-full justify-center text-[16px]">
            Copy &amp; review on Google <ArrowRight size={16} aria-hidden />
          </button>
          <p className="mt-3 text-center text-[14px] text-steel">Paste it on Google and choose your stars.</p>
        </>
      )}
    </section>
  );
}
