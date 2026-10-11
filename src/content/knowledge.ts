import type { KnowledgeDocument } from "@/lib/types";

// DEMO SEED knowledge base. These are the ONLY facts AI guides may rely on
// besides the service catalogue. Admins must review/replace before production
// (flagged `isSeed` in /admin/knowledge).
type Seed = Pick<KnowledgeDocument, "id" | "departmentSlug" | "title" | "body">;

const seeds: Seed[] = [
  // ── Shared ──────────────────────────────────────────────
  {
    id: "kb-about",
    departmentSlug: null,
    title: "About Softgress",
    body: `Softgress is a digital marketing and software development agency. Tagline: "Ideas engineered. Growth accelerated."
Softgress has five delivery teams: Software Development, Digital Marketing, Creative Production, AI & Automation, and Client Strategy. Reception helps visitors find the right team.
Approved facts about founding year, team size, office address, certifications, awards and client names have not been published on this site. If asked, say that information is not available here and offer to connect the visitor with the team.`,
  },
  {
    id: "kb-process",
    departmentSlug: null,
    title: "How engagements work",
    body: `Typical engagement process: 1) Discovery: a conversation or brief to understand goals, scope and constraints. 2) Proposal: a written scope with deliverables, milestones, assumptions and a quote. 3) Kick-off after both sides sign. 4) Delivery in phases with regular check-ins and reviews. 5) Launch and handover. 6) Optional ongoing support or retainer.
Submitting a request on this website is not a contract and does not commit either side. A team member reviews each request and replies through the visitor's preferred channel.`,
  },
  {
    id: "kb-pricing",
    departmentSlug: null,
    title: "Pricing policy",
    body: `Prices are only those published in the service catalogue. Where no price is published the answer is "Custom quote required"; pricing depends on scope, features, integrations, content readiness and timeline.
AI guides must never estimate, invent or imply a price, discount or package amount. They can explain what affects cost and help the visitor prepare a brief so the team can quote accurately.
For advertising services, ad spend is paid by the client directly to the ad platform and is separate from Softgress fees.
Online payment is not available on this website. No payment is requested for a quote or consultation request.`,
  },
  {
    id: "kb-timelines",
    departmentSlug: null,
    title: "Timelines and commitments",
    body: `Delivery timelines are agreed in the proposal after scoping. AI guides must not promise delivery dates, launch dates, staff availability or turnaround times.
Factors that affect timelines: scope and number of features, integrations, content and asset readiness, review/approval speed, third-party approvals (e.g. app stores, ad platforms, WhatsApp templates).`,
  },
  {
    id: "kb-guarantees",
    departmentSlug: null,
    title: "Results and guarantees",
    body: `Softgress does not guarantee search rankings, ad performance (ROAS, CPL, CPA), lead volumes, revenue, virality or app store approval. Marketing results depend on market, offer, budget, creative, website experience and competition.
What Softgress can commit to is defined in each signed proposal (deliverables, process, reporting).`,
  },
  {
    id: "kb-booking",
    departmentSlug: null,
    title: "Booking a consultation and request types",
    body: `Visitors can choose: Request a Quote, Book a Consultation, Request a Callback, or Submit a Project Brief. All require a name, at least one contact method (email or phone) and consent to be contacted. Marketing emails are a separate optional choice, off by default.
Consultation booking: a time is confirmed only when a connected calendar returns a real slot. Otherwise the visitor's preferred time is saved as "pending confirmation" and a team member confirms it.
Each submission returns a reference code. Visitors can check status on the Status page using the reference code plus a one-time verification code sent to their contact method (when a delivery channel is configured).`,
  },
  {
    id: "kb-privacy",
    departmentSlug: null,
    title: "Privacy and AI guides",
    body: `The guides in this virtual office (Aanya, Kabir, Meera, Rohan, Ira, Dev) are AI assistants, not real people. Their answers can be imperfect, and a human team member reviews every request.
Chat messages are kept in the visitor's browser session and are not stored by Softgress unless the visitor chooses to attach the conversation to a submitted request. Visitors can reset their session at any time, which clears the chat and draft brief.
Do not share passwords, card numbers, government IDs or other sensitive personal data in chat.`,
  },
  {
    id: "kb-languages",
    departmentSlug: null,
    title: "Languages",
    body: `Guides understand English, Hindi and Hinglish and reply in the visitor's language unless asked otherwise.`,
  },
  {
    id: "kb-contact",
    departmentSlug: null,
    title: "Contacting the team",
    body: `The reliable way to reach the team from this website is the request form (quote, consultation, callback or brief). Additional channels such as email or WhatsApp are shown on the Contact page only when they have been configured by the Softgress team.`,
  },
  // ── Software ────────────────────────────────────────────
  {
    id: "kb-software-approach",
    departmentSlug: "software",
    title: "Software development approach",
    body: `The software team works in phases: discovery, architecture, design, iterative build with demos, QA, launch and support.
Typical technologies (selected per project, not mandatory): Next.js/React for web, React Native or Flutter for cross-platform mobile, native Swift/Kotlin when required, Node.js or Python backends, PostgreSQL, cloud hosting such as Vercel/AWS/GCP. E-commerce may use Shopify, WooCommerce or a headless build depending on catalogue size, budget and operations.
Quality practices: version control, code review, automated tests where appropriate, staging environments, accessibility and performance checks before launch.
Code ownership and licensing terms are defined in the signed proposal.`,
  },
  {
    id: "kb-software-scoping",
    departmentSlug: "software",
    title: "What we need to scope a software project",
    body: `To scope a website, app or platform the team typically needs: the type of product, target users and expected volume, the must-have features for launch, platforms (web, Android, iOS), integrations (payments, CRM/ERP, logistics, marketplaces), content and design readiness, a target launch window and a budget range.
For e-commerce: approximate number of products/SKUs, payment gateway and shipping partners, inventory source, and whether marketplaces need syncing.
Cross-platform vs native: cross-platform is often efficient for most business apps; native is preferred for heavy device features or performance-critical apps. The team recommends after discovery.`,
  },
  // ── Marketing ───────────────────────────────────────────
  {
    id: "kb-marketing-approach",
    departmentSlug: "marketing",
    title: "Digital marketing approach",
    body: `The marketing team starts with goals and measurement: what counts as a conversion, how leads or sales are tracked, and what budget range is realistic.
Campaign work includes tracking setup (e.g. GA4, Google Tag Manager, Meta Pixel and Conversions API), audience and keyword research, creative testing, ongoing optimisation and regular reporting.
SEO is a medium-to-long-term channel; early work focuses on technical fixes and content foundations. Paid ads can generate traffic faster but performance must be tested and is never guaranteed.
Ad spend is paid directly by the client to Google/Meta and is separate from management fees.`,
  },
  {
    id: "kb-marketing-discovery",
    departmentSlug: "marketing",
    title: "What we ask before proposing a marketing plan",
    body: `Industry and offer, target geography, primary goal (leads, sales, awareness, app installs), channels used before and what happened, monthly ad budget range, existing assets (website, landing pages, creatives, CRM), and desired launch date.
Dashboards shown in the virtual marketing room are illustrative mock-ups with synthetic data, not real client results.`,
  },
  // ── Creative ────────────────────────────────────────────
  {
    id: "kb-creative-approach",
    departmentSlug: "creative",
    title: "Creative studio workflow",
    body: `Creative projects follow: brief, references and moodboard, concepts, feedback rounds, refinement and final delivery. The number of concepts and revision rounds is defined in each proposal.
Brand identity typically includes discovery, logo, colour and typography system, and guidelines. UI/UX typically includes flows, wireframes, high-fidelity UI and a prototype. Video includes script, shoot, edit and platform cut-downs.
Helpful inputs: purpose, audience, examples you like and dislike, platforms, brand assets and deadline.
The before/after showcase in the virtual studio uses original sample concepts made for this website, not client work.`,
  },
  // ── Automation ──────────────────────────────────────────
  {
    id: "kb-automation-approach",
    departmentSlug: "automation",
    title: "AI & automation approach",
    body: `Automation projects start by mapping the current workflow: triggers, tools, people, volumes and failure points. The team then designs automations with clear ownership, logging and human hand-off.
AI assistants are grounded in approved content, include guardrails against making things up, and escalate to humans when uncertain.
WhatsApp automation uses the WhatsApp Business Platform through an approved provider and must follow Meta's opt-in and template policies.
Data handling: only the minimum data needed is processed; access, retention and vendors are agreed with the client.
The workflow shown in the virtual lab uses synthetic demo data.`,
  },
  // ── Strategy ────────────────────────────────────────────
  {
    id: "kb-strategy-portfolio",
    departmentSlug: "strategy",
    title: "Portfolio and case studies",
    body: `Only case studies approved and published by Softgress may be presented as client work. At the moment the project gallery shows sample concept projects, clearly labelled as samples, created to demonstrate capabilities; they are not client engagements and carry no results claims.
If a visitor asks for client references, explain that references can be discussed with the team during a consultation.`,
  },
  {
    id: "kb-strategy-packages",
    departmentSlug: "strategy",
    title: "Packages and custom scoping",
    body: `Softgress scopes most work custom because needs vary. Where packages are published in the service catalogue, the guide may describe them exactly as published. Otherwise: "Custom quote required".
After a quote or proposal request, a team member reviews the brief, may ask clarifying questions, and shares a proposal. Consultations help when the visitor is unsure which services fit.`,
  },
];

export const knowledgeDocuments: KnowledgeDocument[] = seeds.map((s) => ({
  ...s,
  visibility: "public",
  approvedAt: "2026-10-11T00:00:00.000Z",
  version: 1,
  isSeed: true,
}));
