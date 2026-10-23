// Founder Corner content for /about. Edit this file to change what the page shows.
// Keep it to things the leadership team is happy to state publicly: no invented
// years, client names, team size, awards or results (see the no-fabrication
// policy in src/lib/ai/prompts.ts and the "About Softgress" knowledge document).

export interface Leader {
  name: string;
  role: string;
  /** Path under /public. When null the page shows a monogram. */
  photo: string | null;
  /** One line on what this person looks after at Softgress. */
  focus: string;
  /** Public work email, shown as a mailto link. */
  email: string | null;
  /** Optional public profile links. Leave empty to hide them. */
  links: { label: string; href: string }[];
}

export const leaders: Leader[] = [
  {
    name: "Bhagwan Shinde",
    role: "Director – Operations",
    photo: "/images/leadership/bhagwan-shinde.jpg",
    email: "bhagwan.shinde@softgress.com",
    focus: "Keeps every engagement running smoothly, from the first brief and proposal through delivery, launch and support.",
    links: [],
  },
  {
    name: "SB Suryawanshi",
    role: "Director – Technology & AI",
    photo: "/images/leadership/sb-suryawanshi.jpg",
    email: "sb.suryawanshi@softgress.com",
    focus: "Leads how we build: software architecture, engineering quality and the AI and automation we put to work for clients.",
    links: [],
  },
];

/** The leadership note, one string per paragraph, written as "we". */
export const leadershipNote: string[] = [
  "We started Softgress because we kept meeting business owners who had to juggle a developer, an ad agency, a designer and a freelancer for automation, and still nobody owned the result. Every handover lost a little context, and every invoice explained a little less.",
  "So we built one roof for all of it. Software, marketing, creative, AI automation and strategy sit together here, share one brief and answer to one goal: your growth. When the website, the campaign and the workflow are planned by the same team, they actually work together.",
  "We also chose to be honest by default. We publish prices only where they are real, label sample work as samples, and never promise results we cannot stand behind. If something is not the right fit for you, we will say so, even if it means a smaller project for us.",
  "If you have an idea you want engineered, or a business you want to grow, we would genuinely like to hear about it.",
];

/** What the leadership team promises every client. */
export const leadershipPromises: { title: string; body: string }[] = [
  { title: "A clear brief before any code", body: "We agree on goals, scope and assumptions in writing before work begins." },
  { title: "One accountable team", body: "You get one point of contact across every department working on your project." },
  { title: "No invented numbers", body: "Prices, timelines and results are stated only when they are real and agreed." },
];
