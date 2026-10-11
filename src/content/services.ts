import type { Service } from "@/lib/types";

// DEMO SEED — every service ships as "custom" pricing. No prices are invented;
// admins publish prices in /admin/services.
type Seed = Omit<Service, "pricingType" | "startingPrice" | "currency" | "active">;

const seeds: Seed[] = [
  // ── Software ──────────────────────────────────────────────
  {
    slug: "website-development",
    departmentSlug: "software",
    title: "Website Development",
    summary: "Fast, accessible, SEO-ready business websites and landing pages.",
    description:
      "Marketing sites, corporate websites and landing pages built with modern frameworks, an editable CMS, analytics and technical SEO foundations.",
    deliverables: ["Information architecture", "Responsive design implementation", "CMS setup", "Technical SEO & analytics setup", "Launch & handover"],
    process: ["Discovery call", "Sitemap & wireframes", "Design", "Build", "QA & launch"],
    whatWeNeed: ["Pages you need", "Reference sites you like", "Brand assets", "Content owner", "Target launch date"],
    keywords: ["website", "site", "web", "landing page", "wordpress", "next.js", "corporate", "portfolio", "webpage"],
  },
  {
    slug: "ecommerce-development",
    departmentSlug: "software",
    title: "E-commerce Development",
    summary: "Online stores with catalogue, cart, payments and order management.",
    description:
      "Custom or platform-based (e.g. Shopify, WooCommerce, headless) stores with payment gateway integration, inventory, shipping and analytics.",
    deliverables: ["Store architecture", "Product catalogue & search", "Checkout & payment gateway integration", "Order & inventory workflows", "Analytics & conversion tracking"],
    process: ["Catalogue & operations review", "Platform recommendation", "Design", "Build & integrations", "Test orders & launch"],
    whatWeNeed: ["Number of products/SKUs", "Payment & shipping partners", "Existing platform (if any)", "Integrations (ERP, CRM, marketplaces)", "Launch timeline"],
    keywords: ["ecommerce", "e-commerce", "online store", "shop", "shopify", "woocommerce", "cart", "checkout", "dukaan", "store", "sell online"],
  },
  {
    slug: "mobile-app-development",
    departmentSlug: "software",
    title: "Mobile App Development",
    summary: "iOS and Android apps, cross-platform or native.",
    description:
      "Cross-platform (React Native / Flutter) or native apps with backend APIs, authentication, push notifications and store submission.",
    deliverables: ["Product scope & user flows", "UI design", "App build", "Backend/API", "App Store & Play Store submission"],
    process: ["Discovery", "Prototype", "Iterative sprints", "Beta testing", "Store release"],
    whatWeNeed: ["Target platforms", "Core user journeys", "Expected users", "Integrations", "Deadline"],
    keywords: ["app", "mobile", "android", "ios", "iphone", "flutter", "react native", "application"],
  },
  {
    slug: "saas-platform-development",
    departmentSlug: "software",
    title: "SaaS Platforms",
    summary: "Multi-tenant web platforms, dashboards and subscription products.",
    description:
      "Design and engineering of SaaS products: multi-tenant architecture, role-based access, billing integration, admin consoles and observability.",
    deliverables: ["Architecture & data model", "MVP scope", "Auth, roles & tenancy", "Billing integration", "Admin & analytics"],
    process: ["Product discovery", "Architecture", "MVP sprints", "Beta", "Scale-up roadmap"],
    whatWeNeed: ["Problem & target users", "Must-have features", "Pricing model", "Compliance needs", "Timeline"],
    keywords: ["saas", "platform", "subscription", "dashboard", "portal", "multi-tenant", "product", "mvp", "startup"],
  },
  {
    slug: "crm-erp-development",
    departmentSlug: "software",
    title: "CRM & ERP Systems",
    summary: "Custom CRM/ERP modules or tailored implementations for your operations.",
    description:
      "Custom internal tools and business systems for sales, inventory, HR, billing and operations, or customisation of existing CRM/ERP products.",
    deliverables: ["Process mapping", "Module design", "Build or configuration", "Data migration", "Training & support"],
    process: ["Process audit", "Requirements", "Phased build", "Migration", "Rollout"],
    whatWeNeed: ["Current tools & spreadsheets", "Teams and roles", "Key workflows", "Data volumes", "Go-live date"],
    keywords: ["crm", "erp", "inventory", "billing", "internal tool", "management system", "hrms", "software system"],
  },
  {
    slug: "custom-integrations",
    departmentSlug: "software",
    title: "Custom Integrations & APIs",
    summary: "Connect payment, logistics, CRM, ERP and third-party APIs.",
    description:
      "API design and integration between your systems and third-party services, with monitoring, retries and documentation.",
    deliverables: ["Integration design", "API development", "Error handling & monitoring", "Documentation"],
    process: ["Systems review", "Integration spec", "Build", "Test with sandbox accounts", "Go-live"],
    whatWeNeed: ["Systems to connect", "API access/sandbox", "Data flows", "Volumes", "Security requirements"],
    keywords: ["integration", "api", "connect", "webhook", "sync", "payment gateway", "razorpay", "stripe"],
  },
  {
    slug: "maintenance-support",
    departmentSlug: "software",
    title: "Maintenance & Support",
    summary: "Updates, monitoring, security patches and improvements after launch.",
    description:
      "Ongoing care for websites and applications: updates, backups, uptime monitoring, bug fixes and small enhancements under an agreed support scope.",
    deliverables: ["Support scope & response times (agreed in contract)", "Monitoring", "Updates & patches", "Monthly report"],
    process: ["Technical audit", "Support plan", "Onboarding", "Ongoing support"],
    whatWeNeed: ["Current stack & hosting", "Access", "Known issues", "Expected change volume"],
    keywords: ["maintenance", "support", "amc", "bug", "fix", "update", "hosting", "security"],
  },
  // ── Marketing ─────────────────────────────────────────────
  {
    slug: "seo",
    departmentSlug: "marketing",
    title: "Search Engine Optimisation (SEO)",
    summary: "Technical, on-page and content SEO to grow organic visibility.",
    description:
      "Technical audits, keyword research, on-page optimisation, content planning and local SEO. Rankings depend on many external factors and are never guaranteed.",
    deliverables: ["Technical SEO audit", "Keyword & competitor research", "On-page recommendations", "Content plan", "Monthly reporting"],
    process: ["Audit", "Strategy", "Implementation", "Content", "Measure & iterate"],
    whatWeNeed: ["Website URL", "Target locations", "Competitors", "Search Console/Analytics access", "Goals"],
    keywords: ["seo", "google ranking", "organic", "search", "rank", "keywords", "local seo"],
  },
  {
    slug: "google-ads",
    departmentSlug: "marketing",
    title: "Google Ads",
    summary: "Search, Performance Max, Display and YouTube campaigns.",
    description:
      "Campaign structure, keyword strategy, ad copy, conversion tracking and ongoing optimisation. Ad spend is paid by the client directly to the platform.",
    deliverables: ["Account audit or setup", "Conversion tracking", "Campaign build", "Optimisation", "Reporting"],
    process: ["Goals & tracking", "Campaign plan", "Launch", "Optimise", "Report"],
    whatWeNeed: ["Monthly ad budget range", "Target geography", "Offer/landing page", "Conversion goal", "Account access"],
    keywords: ["google ads", "adwords", "ppc", "search ads", "youtube ads", "performance max", "sem"],
  },
  {
    slug: "meta-ads",
    departmentSlug: "marketing",
    title: "Meta Ads (Facebook & Instagram)",
    summary: "Facebook and Instagram campaigns for awareness, leads and sales.",
    description:
      "Audience strategy, creative testing, pixel/Conversions API setup and campaign optimisation on Meta platforms. Results vary by offer, creative, budget and market.",
    deliverables: ["Pixel & Conversions API setup", "Audience strategy", "Creative testing plan", "Campaign management", "Reporting"],
    process: ["Goals & tracking", "Audience & creative plan", "Launch", "Test & optimise", "Report"],
    whatWeNeed: ["Monthly ad budget range", "Target audience & geography", "Offer", "Existing creatives", "Business Manager access"],
    keywords: ["meta ads", "facebook ads", "instagram ads", "fb ads", "insta ads", "meta", "facebook", "instagram"],
  },
  {
    slug: "social-media-marketing",
    departmentSlug: "marketing",
    title: "Social Media Marketing",
    summary: "Content calendars, posting and community management.",
    description:
      "Platform strategy, content calendars, design and posting, and community management for Instagram, LinkedIn, Facebook, YouTube and more.",
    deliverables: ["Platform strategy", "Monthly content calendar", "Post design & copy", "Community management", "Monthly insights"],
    process: ["Brand & audience review", "Strategy", "Calendar", "Publish", "Review"],
    whatWeNeed: ["Platforms", "Brand guidelines", "Posting frequency", "Approval process"],
    keywords: ["social media", "instagram", "linkedin", "posts", "reels", "content calendar", "smm"],
  },
  {
    slug: "performance-marketing",
    departmentSlug: "marketing",
    title: "Performance Marketing",
    summary: "Multi-channel paid acquisition managed against your business KPIs.",
    description:
      "Channel planning across search, social and other paid media, with measurement frameworks, attribution and budget allocation.",
    deliverables: ["Measurement plan", "Channel mix", "Campaign management", "Budget allocation", "KPI dashboard"],
    process: ["KPI definition", "Tracking", "Channel plan", "Launch", "Optimise"],
    whatWeNeed: ["Business KPIs", "Unit economics if available", "Budget range", "Channels used so far"],
    keywords: ["performance marketing", "paid ads", "roas", "cac", "acquisition", "growth marketing"],
  },
  {
    slug: "lead-generation",
    departmentSlug: "marketing",
    title: "Lead Generation",
    summary: "Campaigns, landing pages and follow-up flows for qualified enquiries.",
    description:
      "Lead-focused campaigns with landing pages, forms, CRM routing and follow-up automation, measured by lead quality as well as volume.",
    deliverables: ["Offer & landing page", "Lead forms & tracking", "Campaigns", "CRM routing", "Lead quality reporting"],
    process: ["Ideal customer profile", "Offer", "Funnel build", "Launch", "Qualify & optimise"],
    whatWeNeed: ["Ideal customer", "Sales process", "CRM used", "Budget range"],
    keywords: ["leads", "lead generation", "enquiries", "inquiries", "b2b", "funnel", "customers"],
  },
  {
    slug: "content-strategy",
    departmentSlug: "marketing",
    title: "Content Strategy",
    summary: "Editorial plans, blogs and content that supports search and sales.",
    description:
      "Audience research, content pillars, editorial calendars and production of articles, guides and sales collateral.",
    deliverables: ["Audience & topic research", "Content pillars", "Editorial calendar", "Content production"],
    process: ["Research", "Strategy", "Calendar", "Produce", "Measure"],
    whatWeNeed: ["Audience", "Topics you own", "Subject-matter experts", "Approval workflow"],
    keywords: ["content", "blog", "articles", "copywriting", "editorial", "content marketing"],
  },
  {
    slug: "analytics-reporting",
    departmentSlug: "marketing",
    title: "Analytics & Reporting",
    summary: "GA4, tag management, dashboards and conversion tracking.",
    description:
      "Measurement plans, GA4 and tag manager setup, server-side tracking where appropriate, and reporting dashboards.",
    deliverables: ["Measurement plan", "GA4 / GTM setup", "Conversion tracking", "Dashboards"],
    process: ["Audit", "Plan", "Implement", "Validate", "Report"],
    whatWeNeed: ["Sites/apps", "Current tools", "KPIs", "Access"],
    keywords: ["analytics", "ga4", "google analytics", "tracking", "dashboard", "reporting", "gtm"],
  },
  // ── Creative ──────────────────────────────────────────────
  {
    slug: "brand-identity",
    departmentSlug: "creative",
    title: "Brand Identity",
    summary: "Logo, visual identity systems and brand guidelines.",
    description:
      "Brand discovery, naming support, logo design, typography, colour systems and brand guidelines for consistent use across channels.",
    deliverables: ["Brand discovery", "Logo concepts & refinement", "Visual identity system", "Brand guidelines"],
    process: ["Discovery workshop", "Concepts", "Refinement", "Guidelines", "Handover"],
    whatWeNeed: ["Brand story & audience", "Competitors", "Style references", "Deadline"],
    keywords: ["brand", "branding", "logo", "identity", "brand guidelines", "rebrand"],
  },
  {
    slug: "ui-ux-design",
    departmentSlug: "creative",
    title: "UI/UX Design",
    summary: "Research-informed interfaces for websites, apps and dashboards.",
    description:
      "User research, journey mapping, wireframes, interactive prototypes, design systems and usability testing.",
    deliverables: ["User flows", "Wireframes", "High-fidelity UI", "Clickable prototype", "Design system"],
    process: ["Research", "Flows", "Wireframes", "UI", "Test & iterate"],
    whatWeNeed: ["Users & goals", "Existing product (if any)", "Brand assets", "Platforms"],
    keywords: ["ui", "ux", "design", "figma", "prototype", "wireframe", "user experience", "interface"],
  },
  {
    slug: "video-production",
    departmentSlug: "creative",
    title: "Video Production & Editing",
    summary: "Brand films, product videos, reels and editing.",
    description:
      "Scripting, shoot planning, studio or on-location production, editing, motion graphics and platform-specific cut-downs.",
    deliverables: ["Concept & script", "Shoot", "Edit & colour", "Motion graphics", "Platform cut-downs"],
    process: ["Brief", "Script & storyboard", "Shoot", "Edit", "Review & deliver"],
    whatWeNeed: ["Purpose & platform", "Length", "Locations/talent", "References", "Deadline"],
    keywords: ["video", "editing", "reels", "shoot", "film", "motion graphics", "youtube video", "ad film"],
  },
  {
    slug: "content-creation",
    departmentSlug: "creative",
    title: "Content Creation",
    summary: "Photography, social creatives and campaign content.",
    description:
      "Product and lifestyle photography, social media creatives and campaign assets produced to your brand guidelines.",
    deliverables: ["Shot list", "Photography", "Social creatives", "Asset library"],
    process: ["Brief", "Plan", "Produce", "Edit", "Deliver"],
    whatWeNeed: ["Products/services", "Brand guidelines", "Volume needed", "Channels"],
    keywords: ["photography", "photos", "content creation", "product shoot", "creatives", "posts"],
  },
  {
    slug: "ad-creatives",
    departmentSlug: "creative",
    title: "Ad Creatives",
    summary: "Static, motion and video ads designed for testing.",
    description:
      "Performance-oriented ad creatives in multiple formats and variations so campaigns can test hooks, offers and visuals.",
    deliverables: ["Creative concepts", "Static & motion variants", "Platform sizes", "Iteration rounds"],
    process: ["Brief", "Concepts", "Production", "Variants", "Iterate on results"],
    whatWeNeed: ["Offer", "Audience", "Platforms", "Brand assets", "Past winners (if any)"],
    keywords: ["ad creative", "ads design", "banner", "creative", "static ads", "video ads"],
  },
  {
    slug: "graphic-design",
    departmentSlug: "creative",
    title: "Graphic Design",
    summary: "Presentations, brochures, packaging and marketing collateral.",
    description:
      "Print and digital collateral including pitch decks, brochures, packaging, signage and event material.",
    deliverables: ["Concepts", "Final designs", "Print-ready files"],
    process: ["Brief", "Concepts", "Revisions", "Final files"],
    whatWeNeed: ["Items needed", "Sizes/formats", "Content", "Deadline"],
    keywords: ["graphic design", "brochure", "packaging", "pitch deck", "presentation", "flyer", "poster"],
  },
  // ── Automation ────────────────────────────────────────────
  {
    slug: "ai-chatbots",
    departmentSlug: "automation",
    title: "AI Chatbots & Assistants",
    summary: "Website and support assistants grounded in your approved content.",
    description:
      "Assistants for websites, support and internal knowledge, grounded in your approved documents, with guardrails, human hand-off and analytics.",
    deliverables: ["Use-case & guardrail design", "Knowledge preparation", "Assistant build", "Human hand-off", "Evaluation & monitoring"],
    process: ["Use-case discovery", "Data review", "Prototype", "Evaluate", "Deploy & monitor"],
    whatWeNeed: ["Use cases", "Knowledge sources", "Channels", "Volumes", "Data/privacy constraints"],
    keywords: ["chatbot", "ai chatbot", "assistant", "bot", "gpt", "llm", "ai agent", "customer support bot"],
  },
  {
    slug: "whatsapp-automation",
    departmentSlug: "automation",
    title: "WhatsApp Automation",
    summary: "WhatsApp Business API flows for enquiries, updates and support.",
    description:
      "WhatsApp Business Platform integrations for lead capture, notifications, catalogues and support, following Meta's messaging policies and opt-in rules.",
    deliverables: ["Flow design", "Business API setup via a provider", "Templates & opt-in", "CRM integration", "Reporting"],
    process: ["Use cases", "Provider & policy setup", "Flow build", "Test", "Launch"],
    whatWeNeed: ["Use cases", "Message volumes", "Current WhatsApp setup", "CRM used"],
    keywords: ["whatsapp", "whatsapp automation", "whatsapp bot", "wa", "business api", "broadcast"],
  },
  {
    slug: "crm-automation",
    departmentSlug: "automation",
    title: "CRM Automation & Integration",
    summary: "Automate pipelines, follow-ups and data sync in your CRM.",
    description:
      "Automation of lead stages, tasks, reminders and data sync across CRM, forms, ads platforms and spreadsheets.",
    deliverables: ["Pipeline design", "Automations", "Integrations", "Team training"],
    process: ["Audit", "Design", "Build", "Test", "Train"],
    whatWeNeed: ["CRM used", "Sales process", "Lead sources", "Team size"],
    keywords: ["crm automation", "hubspot", "zoho", "salesforce", "pipeline", "follow up", "sync"],
  },
  {
    slug: "lead-routing",
    departmentSlug: "automation",
    title: "Lead Routing",
    summary: "Send every enquiry to the right person instantly.",
    description:
      "Rules- or AI-assisted routing of leads by service, location, value or availability, with alerts and SLA tracking.",
    deliverables: ["Routing rules", "Alerts", "Assignment logic", "SLA dashboard"],
    process: ["Map sources", "Define rules", "Build", "Test", "Monitor"],
    whatWeNeed: ["Lead sources", "Team structure", "Routing criteria", "Tools used"],
    keywords: ["lead routing", "assign leads", "distribution", "round robin", "alerts"],
  },
  {
    slug: "email-automation",
    departmentSlug: "automation",
    title: "Email Automation",
    summary: "Lifecycle and nurture sequences with consent management.",
    description:
      "Welcome, nurture, abandoned-cart and re-engagement flows with segmentation, consent handling and deliverability best practices.",
    deliverables: ["Lifecycle map", "Flows", "Templates", "Segmentation", "Reporting"],
    process: ["Audit", "Plan", "Build", "Test", "Optimise"],
    whatWeNeed: ["Email platform", "Lists & consent status", "Key journeys"],
    keywords: ["email automation", "newsletter", "drip", "nurture", "mailchimp", "email marketing"],
  },
  {
    slug: "reporting-agents",
    departmentSlug: "automation",
    title: "Reporting Agents",
    summary: "Automated reports and summaries from your business data.",
    description:
      "Scheduled reports and AI-assisted summaries that pull from analytics, ads, CRM and databases, with human review where accuracy matters.",
    deliverables: ["Data source connections", "Report design", "Automation", "Review workflow"],
    process: ["KPIs", "Sources", "Build", "Validate", "Schedule"],
    whatWeNeed: ["Data sources", "Audience of reports", "Frequency", "Access"],
    keywords: ["reporting", "reports", "dashboard", "automated report", "summary", "mis"],
  },
  // ── Strategy ──────────────────────────────────────────────
  {
    slug: "discovery-consultation",
    departmentSlug: "strategy",
    title: "Discovery Consultation",
    summary: "A working session to clarify goals, scope and the right approach.",
    description:
      "A consultation with our team to understand your business goals, review options and agree next steps toward a proposal.",
    deliverables: ["Goals & constraints summary", "Recommended approach", "Next steps toward a proposal"],
    process: ["Book", "Consultation", "Summary", "Proposal (if relevant)"],
    whatWeNeed: ["Business context", "Goals", "Budget range", "Timeline"],
    keywords: ["consultation", "meeting", "call", "discuss", "strategy", "advice", "baat", "milna"],
  },
  {
    slug: "project-scoping",
    departmentSlug: "strategy",
    title: "Project Scoping & Proposal",
    summary: "A written scope, plan and quote for your project.",
    description:
      "We turn your brief into a scoped proposal with deliverables, milestones, assumptions and a quote. A request is not a contract until both sides sign.",
    deliverables: ["Scope of work", "Milestones", "Assumptions & exclusions", "Quote"],
    process: ["Brief review", "Clarifications", "Proposal", "Revisions", "Sign-off"],
    whatWeNeed: ["Project brief", "Decision makers", "Budget range", "Timeline"],
    keywords: ["proposal", "quote", "estimate", "scope", "pricing", "cost", "kitna", "price"],
  },
];

export const services: Service[] = seeds.map((s) => ({
  ...s,
  pricingType: "custom",
  startingPrice: null,
  currency: "INR",
  active: true,
}));
