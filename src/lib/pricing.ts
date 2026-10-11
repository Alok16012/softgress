import type { Service } from "@/lib/types";

/** Only published catalogue prices are ever shown; everything else is a custom quote. */
export function priceLabel(s: Service): string {
  if (s.pricingType === "custom" || s.startingPrice == null) return "Custom quote required";
  const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: s.currency, maximumFractionDigits: 0 }).format(s.startingPrice);
  return s.pricingType === "fixed" ? `${amount} (published price)` : `From ${amount} (published starting price)`;
}
