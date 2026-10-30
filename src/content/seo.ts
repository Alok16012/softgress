// Search copy: page titles, descriptions and FAQ answers. Answers lead with the direct
// answer in one or two sentences so search snippets and AI assistants can quote them.
// Same no-fabrication rule as the rest of the site: no invented years, clients,
// team size, awards, prices or guaranteed results.

import { departments } from "@/content/departments";
import type { Faq } from "@/lib/seo";
import type { Service } from "@/lib/types";

export const HOME_TITLE = "Software & Digital Marketing Company in Pune | Softgress";
export const HOME_DESCRIPTION =
  "Softgress is a software development and digital marketing company in Pimpri-Chinchwad, Pune. Websites, apps, SEO, Google & Meta ads, branding and AI automation for businesses in Pune, Mumbai, Bangalore, India and abroad.";

export const homeFaqs: Faq[] = [
  {
    q: "What does Softgress do?",
    a: "Softgress is a software development and digital marketing company based in Pimpri-Chinchwad, Pune. Five teams under one roof build websites, mobile apps, SaaS and CRM systems, run SEO and Google and Meta ads, create brand and video content, and set up AI chatbots and WhatsApp automation.",
  },
  {
    q: "Where is Softgress located?",
    a: "Our office is at Akurdi Chowk, Shubhashri Residency, Ganga Nagar, Akurdi, Pimpri-Chinchwad, Maharashtra 411035, in the Pune metropolitan region. You can call or WhatsApp us on +91 74472 07700.",
  },
  {
    q: "Do you work with clients outside Pune?",
    a: "Yes. We work with businesses in Mumbai, Bangalore and across India, and with international clients in the US, UK, UAE, Canada and Australia. Projects run remotely with video calls, shared project boards and regular demos, and in-person meetings can be arranged.",
  },
  {
    q: "Why choose one agency for software and marketing?",
    a: "When the same team plans your website, campaigns, content and automation, every piece works together and nobody loses context in handovers. You get one written brief, one point of contact and one team accountable for the result.",
  },
  {
    q: "How much does a website, app or marketing project cost?",
    a: "Every project is quoted after a short scoping call, because cost depends on features, integrations, content readiness and timeline. Requesting a quote or consultation is free and does not commit you to anything. Ad spend is paid directly to the ad platform.",
  },
  {
    q: "How do I start a project with Softgress?",
    a: "Send an enquiry on the website, call or WhatsApp +91 74472 07700. We hold a discovery conversation, send a written proposal with scope, milestones and a quote, then deliver in phases with regular check-ins, launch and ongoing support.",
  },
];

/** Shorter, search-friendly names where the catalogue title is long. */
const SEARCH_NAME: Record<string, string> = {
  seo: "SEO Services",
  "saas-platform-development": "SaaS Development",
  "crm-erp-development": "CRM & ERP Development",
  "maintenance-support": "Website & App Maintenance",
  "discovery-consultation": "Digital Strategy Consultation",
};

export const serviceSearchName = (s: Service) => SEARCH_NAME[s.slug] ?? s.title;

export function serviceTitle(s: Service) {
  return `${serviceSearchName(s)} in Pune, India`;
}

export function serviceDescription(s: Service) {
  return `${s.summary} ${serviceSearchName(s)} by Softgress, Pimpri-Chinchwad, Pune, for businesses in Pune, Mumbai, Bangalore, India and abroad. Request a free quote.`;
}

/** Lower-cases a leading capital mid-sentence, but keeps acronyms such as CMS or UI.  */
const lc = (x: string) => (/^[A-Z][a-z]/.test(x) ? x[0]!.toLowerCase() + x.slice(1) : x);
const list = (xs: string[]) => { const ys = xs.map(lc); return ys.length < 2 ? ys.join("") : `${ys.slice(0, -1).join(", ")} and ${ys.at(-1)}`; };

/** Service FAQs built from the catalogue entry, so every answer matches what the page shows. */
export function serviceFaqs(s: Service): Faq[] {
  const name = serviceSearchName(s);
  const dept = departments.find((d) => d.slug === s.departmentSlug);
  return [
    {
      q: `What is included in ${name} from Softgress?`,
      a: `${s.description} Typical deliverables are ${list(s.deliverables)}, agreed in a written proposal before work starts.`,
    },
    {
      q: `How does the ${name} process work?`,
      a: `We follow ${s.process.length} steps: ${list(s.process)}. You get regular check-ins and reviews at each stage, run by our ${dept?.name ?? "delivery"} team.`,
    },
    {
      q: `What do you need from me to get started?`,
      a: `To scope ${name} accurately we ask for: ${list(s.whatWeNeed)}. If you don't have everything yet, a short discovery call is enough to begin.`,
    },
    {
      q: `How much does ${name} cost?`,
      a: `${name} is quoted per project, because cost depends on scope, integrations, content readiness and timeline. Requesting a quote or a consultation is free, and you get a written quote before any work begins.`,
    },
    {
      q: `Do you offer ${name} outside Pune?`,
      a: `Yes. Our team works from Pimpri-Chinchwad, Pune and delivers ${name} for clients in Mumbai, Bangalore, across India and internationally, with remote collaboration and in-person meetings by arrangement.`,
    },
  ];
}

/** Department titles aimed at "<department> company in Pune" searches. */
const DEPARTMENT_TITLE: Record<string, string> = {
  software: "Software Development Company in Pune, India",
  marketing: "Digital Marketing Agency in Pune, India",
  creative: "Branding, Design & Video Studio in Pune",
  automation: "AI & Automation Company in Pune, India",
  strategy: "Digital Strategy Consulting in Pune",
};

export const departmentTitle = (slug: string, name: string) => DEPARTMENT_TITLE[slug] ?? `${name} in Pune, India`;
