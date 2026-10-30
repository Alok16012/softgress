"use client";
import { useState } from "react";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";

const WORDS = ["Excellent", "Professional", "Fast", "Creative", "Helpful", "Reliable", "Good", "Average"];

/** Prompts that help visitors think of what to say; they are never inserted into the text. */
const HINTS = ["Which service did you use? (website, app, SEO, ads, branding…)", "What did you like most?", "What changed for your business?"];

/** One question, one word: the visitor picks or types their own word, copies it and opens Google's review form. */
export function ReviewClient({ reviewUrl }: { reviewUrl: string }) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  async function go() {
    if (text.trim()) {
      try {
        await navigator.clipboard.writeText(text.trim());
        setCopied(true);
      } catch {
        // Clipboard can be blocked; the visitor can still type on Google.
      }
    }
    window.location.href = reviewUrl;
  }

  return (
    <div className="rounded-[28px] bg-white p-6 sm:p-8 text-ink shadow-xl">
      <h2 className="font-display text-[26px] sm:text-[30px] font-bold leading-tight">How was your experience with Softgress, in one word?</h2>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Pick a word">
        {WORDS.map((w) => (
          <li key={w}>
            <button
              type="button"
              onClick={() => setText((t) => (!t.trim() || WORDS.includes(t.trim()) ? w : t.startsWith(`${w}.`) ? t : `${w}. ${t}`))}
              aria-pressed={text === w || text.startsWith(`${w}.`)}
              className={clsx("rounded-full border px-4 py-2 text-[15px] font-medium transition-colors", text === w || text.startsWith(`${w}.`) ? "border-teal-dark bg-teal-dark text-white" : "border-ink/15 hover:border-teal-dark")}
            >
              {w}
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-6 block text-sm text-steel" htmlFor="review-word">
        Want to add a line? You could mention:
      </label>
      <ul className="mt-2 space-y-1 text-[15px] text-steel">
        {HINTS.map((h) => (
          <li key={h}>• {h}</li>
        ))}
      </ul>
      <textarea
        id="review-word"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Write in your own words"
        className="mt-3 w-full resize-y rounded-2xl border border-ink/15 px-4 py-3 text-[17px] outline-none focus:border-teal-dark"
      />
      <button type="button" onClick={go} className="pill pill-dark mt-6 w-full justify-center">
        {copied ? <Check size={16} aria-hidden /> : null} Copy &amp; review on Google <ArrowRight size={16} aria-hidden />
      </button>
      <p className="mt-4 text-sm text-steel">Your text is copied. On Google, paste it, add anything you like and choose your stars.</p>
    </div>
  );
}
