import { articles } from "@/content/blog";
import { departments } from "@/content/departments";
import { locations } from "@/content/locations";
import { homeFaqs, serviceFaqs, serviceSearchName } from "@/content/seo";
import { services } from "@/content/services";
import { LLMS_SUMMARY, llmsFacts, textResponse } from "@/lib/llms";
import type { Faq } from "@/lib/seo";
import { absUrl } from "@/lib/seo";

// /llms-full.txt: the full text of Softgress's services, location pages and guides as one markdown
// file, so AI assistants can quote accurate details without crawling every page. Built from the
// same bundled content as the pages, so the two never disagree.

const faqBlock = (faqs: Faq[], level = "###") => faqs.flatMap((f) => [`${level} ${f.q}`, "", f.a, ""]);
const list = (xs: string[]) => xs.map((x) => `- ${x}`);

export function GET() {
  const depts = departments.filter((d) => d.slug !== "reception");
  return textResponse([
    "# Softgress: full reference",
    "",
    `> ${LLMS_SUMMARY}`,
    "",
    ...llmsFacts(),
    `- Website: ${absUrl("/")}`,
    `- Short index: ${absUrl("/llms.txt")}`,
    "",
    "## Frequently asked questions",
    "",
    ...faqBlock(homeFaqs),
    "## Services",
    "",
    ...depts.flatMap((d) => [
      `### ${d.name}`,
      "",
      d.description,
      "",
      ...services
        .filter((s) => s.departmentSlug === d.slug)
        .flatMap((s) => [
          `#### ${serviceSearchName(s)}`,
          "",
          `URL: ${absUrl(`/services/${s.slug}`)}`,
          "",
          `${s.summary} ${s.description}`,
          "",
          "Deliverables:",
          ...list(s.deliverables),
          "",
          `Process: ${s.process.join(" → ")}`,
          "",
          ...faqBlock(serviceFaqs(s), "#####"),
        ]),
    ]),
    "## Locations served",
    "",
    ...locations.flatMap((l) => [
      `### ${l.h1}`,
      "",
      `URL: ${absUrl(`/locations/${l.slug}`)}`,
      "",
      ...l.intro.flatMap((p) => [p, ""]),
      ...list(l.points.map((p) => `${p.title}: ${p.body}`)),
      "",
      `Industries: ${l.industries.join(", ")}`,
      "",
      ...faqBlock(l.faqs, "####"),
    ]),
    "## Guides",
    "",
    ...articles.flatMap((a) => [
      `### ${a.title}`,
      "",
      `URL: ${absUrl(`/blog/${a.slug}`)} · Published ${a.date} · By the Softgress team`,
      "",
      a.intro,
      "",
      ...a.sections.flatMap((s) => [`#### ${s.h}`, "", ...s.body.flatMap((p) => [p, ""]), ...(s.bullets ? [...list(s.bullets), ""] : [])]),
      ...faqBlock(a.faqs, "####"),
    ]),
  ]);
}
