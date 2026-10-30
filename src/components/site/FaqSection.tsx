import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/seo";

/**
 * Server-rendered FAQ: answers sit in the HTML (inside <details>) so search engines,
 * answer boxes and AI assistants can read them. Pair with faqLd() on the same page.
 */
export function FaqSection({ id = "faq", title = "Frequently asked questions", faqs, tone = "light" }: { id?: string; title?: string; faqs: Faq[]; tone?: "light" | "paper" }) {
  return (
    <section aria-labelledby={id} className={tone === "paper" ? "bg-paper" : "bg-white"}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
        <h2 id={id} className="font-display text-[32px] sm:text-[44px] leading-tight font-bold tracking-tight text-ink">
          {title}
        </h2>
        <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          {faqs.map((f, i) => (
            <details key={f.q} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-[19px] font-bold leading-snug text-ink [&::-webkit-details-marker]:hidden">
                <h3>{f.q}</h3>
                <ChevronDown size={22} aria-hidden className="mt-0.5 flex-none text-teal-dark transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[17px] leading-relaxed text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
