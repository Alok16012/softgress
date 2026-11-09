"use client";
import { useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// The questions only jog the visitor's memory. We never write the review for them: Google
// removes reviews whose text looks alike, and a review must be the customer's own words.

const SERVICES = ["Website", "Online store", "Mobile app", "Software", "SEO", "Google / Meta ads", "Social media", "Branding / design", "Video", "AI / WhatsApp"];
const PLACES = ["Pune", "Pimpri-Chinchwad", "Mumbai", "Bangalore", "Other city", "Outside India"];
const EXPERIENCES = ["Excellent", "Very good", "Good", "Average", "Poor"];
const POSITIVE = ["Excellent", "Very good", "Good"];
const LIKED = ["On-time delivery", "Clear communication", "Great design", "Good support", "More enquiries", "Fair pricing"];
const IMPROVE = ["Delivery time", "Communication", "Design", "Support", "Results", "Pricing"];

const lower = (xs: string[]) => xs.map((x) => x.toLowerCase());
const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} or ${xs.at(-1)}`);

/** Questions to answer in their own words, shaped by what the visitor picked. Never review text. */
function hints(service: string, place: string, experience: string, points: string[]) {
  const positive = !experience || POSITIVE.includes(experience);
  const out = [service ? `What did we do for you (your ${service.toLowerCase()}), and what was it for?` : "What did we work on for you?"];
  if (place && place !== "Other city") out.push(`Is your business ${place === "Outside India" ? "outside India" : `in ${place}`}? You can mention it.`);
  out.push(
    points.length
      ? positive
        ? `What happened that made ${join(lower(points))} stand out?`
        : `What should we improve about ${join(lower(points))}?`
      : positive
        ? "What went well, in your own words?"
        : "What could have been better?",
  );
  out.push("Would you recommend Softgress, and to whom?");
  return out;
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

  const titles = ["Which service did you use?", "Where is your business?", "How was your experience?", positive ? "What stood out? (pick up to 2)" : "What could be better? (pick up to 2)", "Write it in your own words"];

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
          {SERVICES.map((s) => (
            <Option key={s} label={s} active={service === s} onClick={() => { setService(s); next(1); }} />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {PLACES.map((p) => (
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
            {(positive ? LIKED : IMPROVE).map((p) => (
              <Option
                key={p}
                label={p}
                active={points.includes(p)}
                onClick={() => setPoints((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p].slice(-2)))}
              />
            ))}
          </div>
          <button type="button" onClick={() => setStep(4)} className="pill pill-dark mt-6 min-h-[56px] w-full justify-center text-[16px]">
            {points.length ? "Next" : "Skip"} <ArrowRight size={16} aria-hidden />
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <p className="mt-3 text-[15px] text-steel">A few lines are enough. Some ideas:</p>
          <ul className="mt-2 space-y-1.5 text-[15px] leading-snug text-ink">
            {hints(service, place, experience, points).map((h) => (
              <li key={h} className="flex gap-2">
                <span aria-hidden className="text-teal-dark">•</span>
                {h}
              </li>
            ))}
          </ul>
          <label className="sr-only" htmlFor="review-text">
            Your review
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your review, in your own words…"
            maxLength={1000}
            rows={4}
            className="mt-4 w-full resize-none rounded-2xl border-2 border-ink/10 px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-teal-dark"
          />
          <button type="button" onClick={go} className="pill pill-dark mt-5 min-h-[56px] w-full justify-center text-[16px]">
            {text.trim() ? "Copy & review on Google" : "Review on Google"} <ArrowRight size={16} aria-hidden />
          </button>
          <p className="mt-3 text-center text-[14px] text-steel">{text.trim() ? "Paste it on Google and choose your stars." : "You can also write it directly on Google and choose your stars."}</p>
        </>
      )}
    </section>
  );
}
