// Location landing pages (/locations/[slug]). Each page has its own copy written for
// that market, not a template with the city name swapped, so none of them reads as a
// doorway page. Facts stay true: the only office is in Pimpri-Chinchwad, Pune; other
// markets are served remotely with in-person meetings by arrangement.

import type { Faq } from "@/lib/seo";

export interface Location {
  slug: string;
  /** Short name used in navigation and breadcrumbs. */
  name: string;
  title: string;
  description: string;
  h1: string;
  accent: string;
  intro: string[];
  /** schema.org areaServed for this page. */
  area: { "@type": "City" | "Country" | "Place"; name: string }[];
  /** "Why us here" points: heading + body. */
  points: { title: string; body: string }[];
  /** Industries we commonly scope work for in this market. */
  industries: string[];
  /** Service slugs featured first on this page. */
  featured: string[];
  faqs: Faq[];
}

export const locations: Location[] = [
  {
    slug: "pune",
    name: "Pune",
    title: "Digital Marketing & Software Company in Pune",
    description:
      "Softgress is a Pune digital marketing agency and software development company in Akurdi, Pimpri-Chinchwad. Website development, SEO, Google & Meta ads, apps and AI automation. Call +91 74472 07700.",
    h1: "Digital marketing & software development company in Pune",
    accent: "Local team in Pimpri-Chinchwad. One roof for software, marketing, creative and AI.",
    intro: [
      "Softgress works from Akurdi Chowk in Pimpri-Chinchwad, so Pune businesses can meet the people building their website, running their ads or automating their workflows. Whether you are in Hinjewadi, Wakad, Baner, Kharadi, Viman Nagar, Hadapsar, Kothrud, Chakan or Bhosari, we are a short drive or a quick call away.",
      "Pune has everything from IT and SaaS startups to manufacturing suppliers, education institutes, clinics, real estate and retail. We plan the website, the search and ad strategy, the creative and the automation as one project, so your marketing brings in enquiries and your systems handle them.",
    ],
    area: [
      { "@type": "City", name: "Pune" },
      { "@type": "City", name: "Pimpri-Chinchwad" },
    ],
    points: [
      { title: "Meet us in person", body: "Our office is in Akurdi, Pimpri-Chinchwad. Workshops, reviews and launch days can happen face to face." },
      { title: "Local SEO that fits Pune", body: "Google Business Profile, location pages and local keywords so customers find you when they search in Pune and PCMC." },
      { title: "Software and marketing together", body: "Website, app, ads and WhatsApp automation planned by one team instead of four vendors." },
      { title: "English, Hindi or Hinglish", body: "Talk to us in the language you are comfortable with. Every plan is written down clearly." },
    ],
    industries: ["Manufacturing & engineering suppliers", "IT, SaaS & startups", "Education & coaching institutes", "Clinics & healthcare", "Real estate & construction", "Retail, restaurants & local services"],
    featured: ["website-development", "seo", "google-ads", "meta-ads", "social-media-marketing", "mobile-app-development", "whatsapp-automation", "brand-identity", "ecommerce-development"],
    faqs: [
      {
        q: "Which is a good digital marketing agency in Pune for small and growing businesses?",
        a: "Look for a Pune agency that plans your website, SEO, ads and lead handling together and gives you a written plan before you pay. Softgress does exactly that from its office in Akurdi, Pimpri-Chinchwad, with one team for software, marketing, creative and AI automation.",
      },
      {
        q: "Where is your office in Pune?",
        a: "Softgress Pvt Ltd is at Akurdi Chowk, Shubhashri Residency, Ganga Nagar, Akurdi, Pimpri-Chinchwad, Maharashtra 411035. Call or WhatsApp +91 74472 07700 to fix a meeting.",
      },
      {
        q: "Do you provide local SEO for Pune businesses?",
        a: "Yes. Local SEO for Pune includes Google Business Profile optimisation, location and service pages, local keyword research, citations and review strategy. Rankings depend on competition and many external factors, so we report progress honestly rather than promise positions.",
      },
      {
        q: "How long does it take to build a business website in Pune?",
        a: "Timelines are agreed in the proposal after scoping. They depend on the number of pages, features, integrations and how ready your content is. We share a phase-by-phase plan so you always know what comes next.",
      },
      {
        q: "Can you meet us at our office in Pune or PCMC?",
        a: "Yes. For clients across Pune and Pimpri-Chinchwad we can meet at your office or ours for discovery, reviews and launch. Day-to-day work runs over calls, WhatsApp and a shared project board.",
      },
    ],
  },
  {
    slug: "pimpri-chinchwad",
    name: "Pimpri-Chinchwad",
    title: "Software & Digital Marketing Company in Pimpri-Chinchwad",
    description:
      "Softgress is a software and digital marketing company at Akurdi Chowk, Pimpri-Chinchwad (PCMC). Websites, apps, SEO, Google & Meta ads and WhatsApp automation for PCMC businesses. Visit or call +91 74472 07700.",
    h1: "Software & digital marketing company in Pimpri-Chinchwad",
    accent: "Our office is at Akurdi Chowk, PCMC. Drop in and meet the team.",
    intro: [
      "Softgress is based at Akurdi Chowk, Shubhashri Residency, Ganga Nagar, in the heart of Pimpri-Chinchwad. Businesses in Akurdi, Nigdi, Chinchwad, Pimpri, Bhosari, Ravet, Wakad, Thergaon, Chikhali, Moshi and Talawade can visit us in person to plan a website, an app or a marketing campaign.",
      "PCMC is home to manufacturers, auto-component suppliers, engineering firms, schools and coaching classes, clinics, builders and fast-growing retail. We help these businesses get found on Google, generate enquiries online and automate follow-ups on WhatsApp, with one local team handling the website, the marketing and the software.",
    ],
    area: [
      { "@type": "City", name: "Pimpri-Chinchwad" },
      { "@type": "City", name: "Pune" },
    ],
    points: [
      { title: "Office in Akurdi", body: "Meet us at Akurdi Chowk for discovery, reviews or launch. No need to explain your business over email." },
      { title: "Built for PCMC industry", body: "Websites, catalogues and lead generation for manufacturers, suppliers and B2B companies across MIDC Bhosari, Chakan and Talawade." },
      { title: "Google Maps and local SEO", body: "Google Business Profile, local keywords and location pages so nearby customers find you first." },
      { title: "One accountable team", body: "Software, marketing, creative and automation planned together, with one point of contact." },
    ],
    industries: ["Manufacturing & auto components", "Engineering & B2B suppliers", "Schools & coaching institutes", "Clinics & hospitals", "Builders & real estate", "Retail, showrooms & restaurants"],
    featured: ["website-development", "seo", "google-ads", "ecommerce-development", "crm-erp-development", "whatsapp-automation", "social-media-marketing", "brand-identity", "mobile-app-development"],
    faqs: [
      {
        q: "Is there a software and digital marketing company in Pimpri-Chinchwad?",
        a: "Yes. Softgress Pvt Ltd is at Akurdi Chowk, Shubhashri Residency, Ganga Nagar, Akurdi, Pimpri-Chinchwad 411035. We build websites, apps and custom software, and run SEO, Google Ads, Meta Ads and social media marketing for PCMC businesses.",
      },
      {
        q: "Can I visit your office in Akurdi?",
        a: "Yes. Our office is open Monday to Saturday, 9:30 am to 6:30 pm. Call or WhatsApp +91 74472 07700 before visiting so the right team member is available to meet you.",
      },
      {
        q: "Do you build websites for manufacturing companies in PCMC?",
        a: "Yes. We build B2B websites with product catalogues, enquiry forms and technical SEO for manufacturers and suppliers in Bhosari, Chakan, Talawade and across Pimpri-Chinchwad, and connect enquiries to WhatsApp or a CRM.",
      },
      {
        q: "How can a PCMC business show up on Google Maps?",
        a: "Claim and complete your Google Business Profile with the correct category, address, phone, hours and photos, collect genuine reviews from real customers, and keep your website's name, address and phone consistent. We set this up as part of our local SEO service.",
      },
    ],
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    title: "Software & Digital Marketing Agency for Mumbai",
    description:
      "Web development, mobile apps, SEO, performance marketing and AI automation for Mumbai and Thane businesses, delivered by Softgress from Pune. Get a written proposal and quote.",
    h1: "Software development & digital marketing for Mumbai businesses",
    accent: "Agency-quality delivery from Pune, a short trip from Mumbai.",
    intro: [
      "Mumbai brands move fast and expect agencies to keep up. Softgress builds websites, e-commerce stores and apps, and runs SEO, Google Ads and Meta campaigns for businesses across Mumbai, Navi Mumbai and Thane, from our team in Pimpri-Chinchwad, Pune.",
      "Working with a Pune team gives you senior attention and transparent scoping without the overheads that often come with big-city agencies. Projects run on video calls and shared boards, and we travel to Mumbai for kick-offs and key reviews when it helps.",
    ],
    area: [
      { "@type": "City", name: "Mumbai" },
      { "@type": "City", name: "Navi Mumbai" },
      { "@type": "City", name: "Thane" },
    ],
    points: [
      { title: "Performance marketing that ties to revenue", body: "Google, Meta and landing pages planned together, with conversion tracking set up before spend starts." },
      { title: "E-commerce and D2C builds", body: "Shopify, WooCommerce or headless stores with payment gateways, inventory and analytics." },
      { title: "Clear scope, clear quote", body: "A written proposal with deliverables, milestones and assumptions before any work begins." },
      { title: "On-site when it matters", body: "Kick-offs, workshops and launch reviews in Mumbai by arrangement." },
    ],
    industries: ["D2C & e-commerce brands", "Financial services & fintech", "Media, events & entertainment", "Real estate", "Professional services", "Hospitality & restaurants"],
    featured: ["performance-marketing", "ecommerce-development", "website-development", "seo", "google-ads", "meta-ads", "video-production", "ad-creatives", "crm-automation"],
    faqs: [
      {
        q: "Do you work with businesses in Mumbai even though you are based in Pune?",
        a: "Yes. Softgress delivers software and digital marketing projects for Mumbai, Navi Mumbai and Thane businesses. Daily collaboration runs over calls, WhatsApp and shared project boards, and we visit Mumbai for kick-offs and important reviews by arrangement.",
      },
      {
        q: "Can you run Google and Meta ads for a Mumbai brand?",
        a: "Yes. We plan campaigns, landing pages, creatives and conversion tracking together, then report on leads and sales rather than vanity metrics. Ad spend is paid directly to Google or Meta, and results depend on your offer, budget and competition.",
      },
      {
        q: "Do you build Shopify or custom e-commerce stores for Mumbai D2C brands?",
        a: "Yes. We build Shopify, WooCommerce and custom or headless stores with catalogue, payment gateway, shipping and inventory workflows, plus analytics and conversion tracking. We recommend the platform after reviewing your catalogue and operations.",
      },
      {
        q: "How is a Pune-based agency different from a Mumbai agency?",
        a: "You get the same tools and standards with senior people closely involved and transparent written scoping. Many Mumbai companies already work with Pune teams; what matters is a clear plan, regular demos and one accountable point of contact.",
      },
    ],
  },
  {
    slug: "bangalore",
    name: "Bangalore",
    title: "App, SaaS & Web Development for Bangalore",
    description:
      "Softgress builds SaaS platforms, mobile apps, websites and AI automation, and runs growth marketing for Bangalore (Bengaluru) startups and companies. Get a scoped proposal from our Pune team.",
    h1: "App, SaaS & web development for Bangalore startups and companies",
    accent: "Product engineering, growth marketing and AI automation for Bengaluru.",
    intro: [
      "Bengaluru's startups and product companies need partners who can ship an MVP, scale it, and help it find customers. Softgress designs and engineers SaaS platforms, web apps and mobile apps, and runs SEO, content and paid acquisition to grow them.",
      "Our team works from Pimpri-Chinchwad, Pune and collaborates with Bangalore founders and product teams in sprints, with shared boards, regular demos and clear documentation. Teams in Koramangala, HSR Layout, Indiranagar, Whitefield and Electronic City work with us entirely online.",
    ],
    area: [{ "@type": "City", name: "Bengaluru" }],
    points: [
      { title: "MVP to scale-up", body: "Architecture, multi-tenancy, roles, billing and admin consoles built for the next stage, not just the demo." },
      { title: "AI built into the product", body: "Practical AI chatbots, assistants and reporting agents connected to your data and tools." },
      { title: "Growth after launch", body: "SEO, content and performance marketing from the same team that built the product." },
      { title: "Sprint-based collaboration", body: "Fortnightly demos, shared backlog and written decisions you can always look back on." },
    ],
    industries: ["SaaS & B2B software", "Fintech & insurtech", "Edtech", "Healthtech", "Logistics & mobility", "Consumer apps"],
    featured: ["saas-platform-development", "mobile-app-development", "ai-chatbots", "ui-ux-design", "custom-integrations", "website-development", "content-strategy", "seo", "reporting-agents"],
    faqs: [
      {
        q: "Can Softgress build an MVP for a Bangalore startup?",
        a: "Yes. We start with product discovery and architecture, agree the MVP scope in writing, then build in sprints with regular demos. Typical MVPs include authentication, roles, core workflows, billing integration and an admin console, built so they can scale after launch.",
      },
      {
        q: "Do you develop apps with Flutter or React Native?",
        a: "Yes. We build cross-platform apps with Flutter or React Native, or native iOS and Android when the product needs it, along with backend APIs, push notifications and App Store and Play Store submission.",
      },
      {
        q: "How do you collaborate with Bangalore teams remotely?",
        a: "We work in sprints with a shared backlog, fortnightly demos, a dedicated point of contact and written decisions. Founders and product managers get full visibility through video calls, WhatsApp or Slack and the project board.",
      },
      {
        q: "Can you add AI features to our SaaS product?",
        a: "Yes. Our AI & Automation Lab builds chatbots, in-product assistants, reporting agents and workflow automation that connect to your data and existing tools, with guardrails and human review where it matters.",
      },
    ],
  },
  {
    slug: "india",
    name: "India",
    title: "Software & Digital Marketing Company in India",
    description:
      "Softgress is an Indian software development and digital marketing company. Websites, apps, SaaS, CRM, SEO, Google & Meta ads, branding and AI automation for businesses across India.",
    h1: "Software development & digital marketing company in India",
    accent: "One team for software, marketing, creative and AI, serving businesses across India.",
    intro: [
      "From Delhi NCR, Hyderabad and Chennai to Ahmedabad, Jaipur, Nagpur, Nashik and Indore, Softgress helps Indian businesses get online, get found and run more efficiently. Our team in Pimpri-Chinchwad, Pune plans and delivers every project.",
      "Many companies juggle a developer, an ad agency, a designer and an automation freelancer. We bring all of that under one roof, with one written brief and one point of contact, so your website, marketing and operations work together.",
    ],
    area: [{ "@type": "Country", name: "India" }],
    points: [
      { title: "Built for Indian businesses", body: "Payment gateways, GST-ready invoicing flows, WhatsApp-first communication and regional language support where needed." },
      { title: "Every digital service", body: "Websites, apps, SaaS, CRM/ERP, SEO, ads, social, branding, video and AI automation." },
      { title: "Remote-first delivery", body: "Calls, WhatsApp and shared project boards keep projects moving wherever you are in India." },
      { title: "Honest pricing", body: "No made-up packages. A written quote based on your actual scope." },
    ],
    industries: ["Manufacturing & B2B", "Education", "Healthcare", "Real estate", "Retail & e-commerce", "Professional services"],
    featured: ["website-development", "mobile-app-development", "crm-erp-development", "seo", "google-ads", "social-media-marketing", "whatsapp-automation", "ai-chatbots", "brand-identity"],
    faqs: [
      {
        q: "Does Softgress work with businesses across India?",
        a: "Yes. Softgress is based in Pimpri-Chinchwad, Pune and works with businesses across India, from metro cities to tier-2 and tier-3 towns. Projects run remotely over calls, WhatsApp and shared project boards, with visits by arrangement.",
      },
      {
        q: "What services does Softgress offer?",
        a: "Software development (websites, e-commerce, mobile apps, SaaS, CRM/ERP, integrations), digital marketing (SEO, Google and Meta ads, social media, lead generation, analytics), creative production (branding, UI/UX, video, ad creatives) and AI automation (chatbots, WhatsApp, CRM and email automation).",
      },
      {
        q: "Can you set up WhatsApp Business API automation?",
        a: "Yes. We set up WhatsApp Business workflows for lead capture, follow-ups, order and appointment updates and support, connected to your CRM. Message templates need approval from Meta, which can affect timelines.",
      },
      {
        q: "Do you offer website maintenance and support after launch?",
        a: "Yes. We offer ongoing maintenance and support for websites and apps, including updates, monitoring, fixes and small enhancements, agreed as a retainer or on demand.",
      },
    ],
  },
  {
    slug: "international",
    name: "International",
    title: "Offshore Software & Marketing Partner in India",
    description:
      "Outsource web, app and SaaS development, SEO, digital marketing and AI automation to Softgress in Pune, India. Working with clients in the USA, UK, UAE, Canada and Australia with overlapping hours.",
    h1: "Your offshore software development & digital marketing partner in India",
    accent: "Serving clients in the USA, UK, UAE, Canada, Australia and beyond.",
    intro: [
      "Softgress gives international businesses and agencies an Indian team that designs, builds and grows digital products. From our base in Pune, India, we develop websites, e-commerce stores, SaaS platforms and mobile apps, and run SEO, paid media and marketing automation.",
      "We plan overlapping working hours with your time zone, communicate in clear written English, and document every decision. Agencies can also work with us as a white-label development and marketing partner.",
    ],
    area: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Australia" },
      { "@type": "Place", name: "Worldwide" },
    ],
    points: [
      { title: "Time-zone overlap", body: "Planned overlap with US, UK, Gulf and Australian working hours for calls and reviews." },
      { title: "White-label for agencies", body: "Development, SEO and campaign execution delivered under your brand." },
      { title: "Clear contracts and IP", body: "Written scope, milestones and ownership terms agreed before work starts." },
      { title: "Full-stack capability", body: "Product engineering, marketing, creative and AI automation from one partner." },
    ],
    industries: ["Digital agencies (white-label)", "SaaS companies", "E-commerce brands", "Professional services", "Healthcare & wellness", "Startups"],
    featured: ["saas-platform-development", "website-development", "ecommerce-development", "mobile-app-development", "seo", "performance-marketing", "ai-chatbots", "ui-ux-design", "maintenance-support"],
    faqs: [
      {
        q: "Why outsource software development to India?",
        a: "India has a deep pool of engineers and marketers, so outsourcing can give you strong technical talent at a sensible cost. The key to success is a partner with clear written scope, overlapping hours, regular demos and documentation, which is how Softgress works.",
      },
      {
        q: "Do you work with clients in the USA, UK, UAE and Australia?",
        a: "Yes. Softgress works with international clients remotely from Pune, India. We schedule overlapping hours with your time zone, use your preferred tools such as Slack, Jira or Teams, and share progress through regular demos.",
      },
      {
        q: "Can Softgress be a white-label partner for my agency?",
        a: "Yes. We can deliver website and app development, SEO, paid media and creative production under your agency's brand, with non-disclosure and ownership terms agreed in writing.",
      },
      {
        q: "Who owns the code and designs you create?",
        a: "Ownership and intellectual property terms are agreed in the written proposal and contract before work starts. Typically the client owns the deliverables on payment, and we hand over source code, designs and access.",
      },
    ],
  },
];

export const locationBySlug = (slug: string) => locations.find((l) => l.slug === slug);
