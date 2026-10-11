import type { Project } from "@/lib/types";

// SAMPLE WORK. These are concept projects written for this demo. They are not
// client engagements and must always render with a "Sample concept" label.
export const projects: Project[] = [
  {
    slug: "sample-d2c-storefront",
    title: "Sample concept: D2C storefront for a handmade goods brand",
    summary: "A concept e-commerce experience: catalogue, quick checkout and WhatsApp order updates.",
    body: "This is a sample concept created to illustrate how Softgress approaches an e-commerce build: a mobile-first catalogue, a short checkout, payment-gateway integration and opt-in order updates. It is not a client project and has no performance results.",
    serviceSlugs: ["ecommerce-development", "ui-ux-design", "whatsapp-automation"],
    industry: "Retail / D2C",
    isSample: true,
    published: true,
  },
  {
    slug: "sample-clinic-lead-funnel",
    title: "Sample concept: Lead funnel for a multi-location clinic",
    summary: "Concept landing pages, Meta and Google campaigns, and lead routing by location.",
    body: "A sample concept showing a lead-generation setup: location-specific landing pages, conversion tracking, paid campaigns and automatic routing of enquiries to the nearest branch. Illustrative only: not a client project, no results claimed.",
    serviceSlugs: ["lead-generation", "meta-ads", "google-ads", "lead-routing"],
    industry: "Healthcare",
    isSample: true,
    published: true,
  },
  {
    slug: "sample-field-service-saas",
    title: "Sample concept: Field-service scheduling SaaS",
    summary: "Concept multi-tenant dashboard with job scheduling, technician app and reporting agent.",
    body: "A sample concept of a SaaS product for service businesses: tenant onboarding, job scheduling, a technician mobile app and an automated weekly summary report. Created for demonstration; not a client project.",
    serviceSlugs: ["saas-platform-development", "mobile-app-development", "reporting-agents"],
    industry: "Services",
    isSample: true,
    published: true,
  },
  {
    slug: "sample-cafe-rebrand",
    title: "Sample concept: Neighbourhood café rebrand",
    summary: "Concept identity system, menu design and launch reels.",
    body: "A sample brand concept: logo, palette, menu design and short-form video ideas for launch. Original concept work made for this site; not a client project.",
    serviceSlugs: ["brand-identity", "graphic-design", "video-production"],
    industry: "Food & beverage",
    isSample: true,
    published: true,
  },
];
