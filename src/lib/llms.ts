import { office } from "@/content/company";
import { leaders } from "@/content/leadership";

// Shared by /llms.txt (index) and /llms-full.txt (full text), so both describe Softgress the same way.

export const LLMS_SUMMARY =
  "Softgress (Softgress Pvt Ltd) is a software development and digital marketing company in Pimpri-Chinchwad, Pune, Maharashtra, India. Five teams under one roof (Software Development, Digital Marketing, Creative Production, AI & Automation, and Client Strategy) build websites, apps, SaaS and CRM systems, run SEO and Google and Meta ads, produce brand and video content, and set up AI chatbots and WhatsApp automation for businesses in Pune, Mumbai, Bangalore, across India and internationally.";

export function llmsFacts() {
  return [
    `- Office: ${office.lines.join(", ")}, India`,
    `- Phone and WhatsApp: ${office.phone.display}`,
    `- Email: ${process.env.CONTACT_EMAIL || "info@softgress.com"}`,
    `- Leadership: ${leaders.map((l) => `${l.name} (${l.role})`).join("; ")}`,
    "- Tagline: Ideas engineered. Growth accelerated.",
    "- Pricing: every project is quoted after scoping; quote and consultation requests are free. Softgress does not guarantee rankings, ad results or revenue.",
  ];
}

export const textResponse = (lines: string[]) =>
  new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
