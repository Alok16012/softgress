"use client";
import { useState } from "react";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";

const WORDS = ["Excellent", "Professional", "Fast", "Creative", "Helpful", "Reliable", "Good", "Average"];

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
              onClick={() => setText(w)}
              aria-pressed={text === w}
              className={clsx("rounded-full border px-4 py-2 text-[15px] font-medium transition-colors", text === w ? "border-teal-dark bg-teal-dark text-white" : "border-ink/15 hover:border-teal-dark")}
            >
              {w}
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-6 block text-sm text-steel" htmlFor="review-word">
        Or write your own
      </label>
      <input
        id="review-word"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        placeholder="Your word or a few words"
        className="mt-2 w-full rounded-2xl border border-ink/15 px-4 py-3 text-[17px] outline-none focus:border-teal-dark"
      />
      <button type="button" onClick={go} className="pill pill-dark mt-6 w-full justify-center">
        {copied ? <Check size={16} aria-hidden /> : null} Copy &amp; review on Google <ArrowRight size={16} aria-hidden />
      </button>
      <p className="mt-4 text-sm text-steel">Your text is copied. On Google, paste it, add anything you like and choose your stars.</p>
    </div>
  );
}
