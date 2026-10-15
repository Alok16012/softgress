import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { priceLabel } from "@/lib/pricing";
import type { Service } from "@/lib/types";

/**
 * Apexon-style service index: divider-separated rows instead of boxed cards.
 * Prices appear only when published; the "custom quote" default lives on the service page.
 */
export function ServiceList({ services, cols = 2, headingLevel = "h3" }: { services: Service[]; cols?: 2 | 3; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className={clsx("grid gap-x-10 border-b border-ink/10", cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
      {services.map((s) => (
        <li key={s.slug} className="border-t border-ink/10">
          <Link href={`/services/${s.slug}`} className="group flex h-full items-start gap-5 py-6">
            <div className="flex-1">
              <Heading className="font-display text-[19px] leading-snug font-bold text-ink transition-colors group-hover:text-teal-dark">{s.title}</Heading>
              <p className="mt-1.5 text-[15px] leading-relaxed text-steel">{s.summary}</p>
              {s.pricingType !== "custom" && s.startingPrice != null && <p className="mt-2 text-xs font-bold text-teal-dark">{priceLabel(s)}</p>}
            </div>
            <span className="arrow-dot mt-0.5 w-9 h-9">
              <ArrowRight size={16} aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
