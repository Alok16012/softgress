import { articles } from "@/content/blog";
import { departments } from "@/content/departments";
import { locations } from "@/content/locations";
import { homeFaqs, serviceSearchName } from "@/content/seo";
import { services } from "@/content/services";
import { LLMS_SUMMARY, llmsFacts, textResponse } from "@/lib/llms";
import { absUrl } from "@/lib/seo";

// /llms.txt (llmstxt.org): a plain-markdown summary of Softgress for AI assistants and answer engines.
// The full text of every page listed here is in /llms-full.txt.
export function GET() {
  const depts = departments.filter((d) => d.slug !== "reception");
  return textResponse([
    "# Softgress",
    "",
    `> ${LLMS_SUMMARY}`,
    "",
    ...llmsFacts(),
    "",
    "## Key pages",
    "",
    `- [Home](${absUrl("/")}): overview of every department and service`,
    `- [All services](${absUrl("/services")})`,
    `- [About Softgress](${absUrl("/about")}): story, values and leadership`,
    `- [Contact / request a quote](${absUrl("/contact")})`,
    `- [Full text for AI assistants](${absUrl("/llms-full.txt")}): every service, location page and guide in one markdown file`,
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
    "## Guides",
    "",
    ...articles.map((a) => `- [${a.title}](${absUrl(`/blog/${a.slug}`)}): ${a.description}`),
    "",
    "## FAQ",
    "",
    ...homeFaqs.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
  ]);
}
