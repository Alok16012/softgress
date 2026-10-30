import { office } from "@/content/company";
import { departments } from "@/content/departments";
import { leaders } from "@/content/leadership";
import { locations } from "@/content/locations";
import { homeFaqs, serviceSearchName } from "@/content/seo";
import { services } from "@/content/services";
import { absUrl } from "@/lib/seo";

// /llms.txt (llmstxt.org): a plain-markdown summary of Softgress for AI assistants and answer engines.
export function GET() {
  const depts = departments.filter((d) => d.slug !== "reception");
  const body = [
    "# Softgress",
    "",
    "> Softgress (Softgress Pvt Ltd) is a software development and digital marketing company in Pimpri-Chinchwad, Pune, Maharashtra, India. Five teams under one roof (Software Development, Digital Marketing, Creative Production, AI & Automation, and Client Strategy) build websites, apps, SaaS and CRM systems, run SEO and Google and Meta ads, produce brand and video content, and set up AI chatbots and WhatsApp automation for businesses in Pune, Mumbai, Bangalore, across India and internationally.",
    "",
    `- Office: ${office.lines.join(", ")}, India`,
    `- Phone and WhatsApp: ${office.phone.display}`,
    `- Email: ${process.env.CONTACT_EMAIL || "info@softgress.com"}`,
    `- Leadership: ${leaders.map((l) => `${l.name} (${l.role})`).join("; ")}`,
    "- Tagline: Ideas engineered. Growth accelerated.",
    "- Pricing: every project is quoted after scoping; quote and consultation requests are free. Softgress does not guarantee rankings, ad results or revenue.",
    "",
    "## Key pages",
    "",
    `- [Home](${absUrl("/")}): overview of every department and service`,
    `- [All services](${absUrl("/services")})`,
    `- [About Softgress](${absUrl("/about")}): story, values and leadership`,
    `- [Contact / request a quote](${absUrl("/contact")})`,
    "",
    "## Locations",
    "",
    ...locations.map((l) => `- [${l.title}](${absUrl(`/locations/${l.slug}`)}): ${l.description}`),
    "",
    ...depts.flatMap((d) => [
      `## ${d.name}`,
      "",
      `${d.description} [Department page](${absUrl(`/departments/${d.slug}`)})`,
      "",
      ...services.filter((s) => s.departmentSlug === d.slug).map((s) => `- [${serviceSearchName(s)}](${absUrl(`/services/${s.slug}`)}): ${s.summary}`),
      "",
    ]),
    "## FAQ",
    "",
    ...homeFaqs.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
