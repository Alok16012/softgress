import type { Department } from "@/lib/types";

// DEMO SEED — brand copy written as a documented assumption (docs/ASSUMPTIONS.md).
export const departments: Department[] = [
  {
    slug: "reception",
    name: "Reception & Visitor Desk",
    shortName: "Reception",
    description:
      "Start here. Our AI receptionist explains what Softgress does, points you to the right team and helps you book a conversation with a person.",
    sceneId: "reception",
    active: true,
  },
  {
    slug: "software",
    name: "Software Development",
    shortName: "Software",
    description:
      "Websites, e-commerce, mobile apps, SaaS platforms, CRM/ERP systems and custom integrations, built and maintained by our engineering team.",
    sceneId: "software",
    active: true,
  },
  {
    slug: "marketing",
    name: "Digital Marketing",
    shortName: "Marketing",
    description:
      "SEO, Google and Meta advertising, social media, content strategy, lead generation and analytics: planned around your goals and budget.",
    sceneId: "marketing",
    active: true,
  },
  {
    slug: "creative",
    name: "Creative Production Studio",
    shortName: "Creative",
    description:
      "Brand identity, UI/UX design, video production, graphics and ad creatives, produced in our studio.",
    sceneId: "creative",
    active: true,
  },
  {
    slug: "automation",
    name: "AI & Automation Lab",
    shortName: "AI Automation",
    description:
      "Practical AI chatbots, WhatsApp workflows, lead routing, CRM and email automation, and reporting agents connected to the tools you already use.",
    sceneId: "automation",
    active: true,
  },
  {
    slug: "strategy",
    name: "Client Strategy & Project Gallery",
    shortName: "Strategy",
    description:
      "Our boardroom: review approved work, scope your project and plan the right package or a custom engagement.",
    sceneId: "strategy",
    active: true,
  },
];
