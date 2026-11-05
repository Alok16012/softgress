// Insights articles (/blog). Written to answer real questions Pune and PCMC business owners
// search for. Same no-fabrication rule as the rest of the site: no invented prices, client
// names, statistics or guaranteed results.

import type { Faq } from "@/lib/seo";

export interface Article {
  slug: string;
  title: string;
  description: string;
  /** ISO date the article was published. */
  date: string;
  /** Service pages this article supports, for internal links. */
  services: { slug: string; label: string }[];
  intro: string;
  sections: { h: string; body: string[]; bullets?: string[] }[];
  faqs: Faq[];
}

export const articles: Article[] = [
  {
    slug: "how-to-choose-a-digital-marketing-agency-in-pune",
    title: "How to Choose a Digital Marketing Agency in Pune: 10 Questions to Ask",
    description:
      "A practical checklist for Pune and Pimpri-Chinchwad business owners: the 10 questions to ask before hiring a digital marketing agency for SEO, Google Ads or social media.",
    date: "2026-11-01",
    services: [
      { slug: "seo", label: "SEO services" },
      { slug: "google-ads", label: "Google Ads management" },
      { slug: "social-media-marketing", label: "Social media marketing" },
    ],
    intro:
      "Pune has hundreds of digital marketing agencies, from freelancers to large firms. The right one is not the one with the boldest promise, but the one that understands your business, plans with your goals in mind and reports honestly. These ten questions help you compare agencies in Pune and PCMC on what actually matters.",
    sections: [
      {
        h: "1. What will you do in the first 30 days?",
        body: [
          "A good agency starts with discovery: your business goals, your customers, your current website and your competitors in Pune. Ask for a written plan for the first month. If the answer is only \"we will post daily and run ads\", the plan is not built around your business.",
        ],
      },
      {
        h: "2. How will you measure success?",
        body: [
          "Agree on measures that matter to your business, such as enquiries, calls, WhatsApp messages, bookings or sales, not only likes or impressions. Ask which tools they will set up (for example Google Analytics, Search Console and conversion tracking) and who owns those accounts.",
        ],
      },
      {
        h: "3. Do you guarantee rankings or results?",
        body: [
          "No one can honestly guarantee a #1 Google position or a fixed number of leads, because results depend on competition, budget, your offer and your website. Treat guarantees as a warning sign. A trustworthy agency explains what it will do and how progress will be reported.",
        ],
      },
      {
        h: "4. Who owns the accounts and the data?",
        body: [
          "Your Google Ads account, Meta Business account, Google Business Profile, analytics and website should be registered in your business's name, with the agency given access. If you ever change agencies, you keep your history and data.",
        ],
      },
      {
        h: "5. Can you also fix the website?",
        body: [
          "Ads and SEO send people to your website. If the website is slow, unclear or hard to use on a phone, marketing money is wasted. Agencies that handle both the website and the marketing can fix problems at the source instead of blaming each other.",
        ],
      },
      {
        h: "6. How do you approach local SEO for Pune?",
        body: ["For businesses that serve customers in Pune or Pimpri-Chinchwad, local search is often the fastest win. Ask how they will handle:"],
        bullets: [
          "Your Google Business Profile: categories, services, photos, posts and replies to reviews",
          "Location and service pages on your website",
          "Consistent business name, address and phone across directories",
          "Getting genuine reviews from real customers, without fake reviews or incentives",
        ],
      },
      {
        h: "7. What will the reports look like?",
        body: [
          "Ask for a sample report. It should show what was done, what changed (traffic, enquiries, calls, cost per enquiry) and what is planned next, in plain language, not just screenshots of dashboards.",
        ],
      },
      {
        h: "8. Who will actually work on my account?",
        body: ["Find out who your point of contact is, who writes the content and who manages the ads. One accountable contact makes communication much easier."],
      },
      {
        h: "9. How is pricing structured?",
        body: [
          "Pricing usually depends on scope: the services included, the number of platforms, content volume and whether ad spend is managed. Ask for a written quote that separates the agency fee from ad spend, which you normally pay directly to Google or Meta.",
        ],
      },
      {
        h: "10. Can I start small?",
        body: [
          "A focused start, such as fixing your Google Business Profile and website basics, or one well-tracked campaign, lets you judge an agency on real work before committing to a larger plan.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does a digital marketing agency in Pune do?",
        a: "A digital marketing agency helps businesses get customers online through SEO, Google Ads, Meta (Facebook and Instagram) ads, social media, content and analytics. Many Pune agencies, including Softgress, also build and improve the website those campaigns send people to.",
      },
      {
        q: "Should I choose a local agency in Pune or PCMC?",
        a: "A local agency understands the Pune market and can meet you in person for planning and reviews, which helps on projects that need close collaboration. What matters most is a clear plan, honest reporting and one accountable team.",
      },
      {
        q: "How long does SEO take to show results in Pune?",
        a: "Local improvements such as a complete Google Business Profile can help within weeks, while competitive Pune keywords usually take several months of consistent work on the website, content, reviews and links. Timelines depend on competition and are never guaranteed.",
      },
    ],
  },
  {
    slug: "website-development-in-pune-cost-and-timeline-factors",
    title: "Website Development in Pune: What Affects the Cost and Timeline",
    description:
      "Planning a business website in Pune or Pimpri-Chinchwad? Learn what drives website development cost and timeline, what to prepare, and how to get an accurate quote.",
    date: "2026-11-01",
    services: [
      { slug: "website-development", label: "Website development" },
      { slug: "ecommerce-development", label: "E-commerce development" },
      { slug: "maintenance-support", label: "Website maintenance & support" },
    ],
    intro:
      "\"How much does a website cost?\" is the most common question we hear from Pune businesses, and the honest answer is: it depends on what the website needs to do. Two websites can look similar and still differ a lot in effort. Here is what actually drives the cost and timeline, so you can plan better and compare quotes fairly.",
    sections: [
      {
        h: "Number and type of pages",
        body: [
          "A five-page company website (home, about, services, contact, a few service details) is a very different job from a fifty-page site with industry pages, location pages and a blog. List the pages you need before asking for a quote.",
        ],
      },
      {
        h: "Design: template or custom",
        body: [
          "A customised template is quicker. A fully custom design, built around your brand and your customers, takes more time for wireframes, design rounds and approvals, but usually communicates better and stands out from competitors.",
        ],
      },
      {
        h: "Features and integrations",
        body: ["Features add effort. Common ones for Pune businesses include:"],
        bullets: [
          "Enquiry forms connected to email, WhatsApp or a CRM",
          "Online store with catalogue, cart, payment gateway and shipping",
          "Booking or appointment scheduling",
          "Multiple languages (for example English, Hindi and Marathi)",
          "Customer login areas, dashboards or integrations with your ERP",
        ],
      },
      {
        h: "Content readiness",
        body: [
          "Missing text, photos and product details are the most common reason website projects in Pune get delayed. If your content is ready, or you plan for professional copywriting and photography from the start, timelines become predictable.",
        ],
      },
      {
        h: "SEO and speed foundations",
        body: [
          "A website built for search includes clean page structure, fast loading on mobile, titles and descriptions for every page, structured data, a sitemap and analytics. Adding these later costs more than building them in from day one.",
        ],
      },
      {
        h: "Review speed and approvals",
        body: [
          "Projects move as fast as decisions do. Nominate one person on your side to give feedback and approve each stage, and agree on the number of review rounds in the proposal.",
        ],
      },
      {
        h: "After launch: hosting, maintenance and updates",
        body: [
          "Budget for hosting, domain renewal, security updates, backups and small changes after launch. A maintenance plan keeps the site secure and up to date as your business grows.",
        ],
      },
      {
        h: "How to get an accurate quote",
        body: ["Share these with any agency you are comparing, and ask each for a written scope:"],
        bullets: [
          "The pages and features you need",
          "Two or three websites you like, and why",
          "Your logo and brand assets",
          "Who will provide text and photos",
          "Your target launch date",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does it take to build a business website in Pune?",
        a: "It depends on the number of pages, features, integrations and how ready your content is. A clear scope, ready content and quick approvals are the biggest factors in a fast launch. Softgress agrees the timeline in a written proposal after a short discovery call.",
      },
      {
        q: "Why do website quotes in Pune vary so much?",
        a: "Quotes differ because agencies include different things: custom or template design, number of pages, SEO setup, content writing, integrations, testing and post-launch support. Compare written scopes, not just the final number.",
      },
      {
        q: "Do I need a new website for SEO?",
        a: "Not always. Many sites can be improved with better page titles, faster loading, location and service pages and structured data. If the site is very slow, hard to edit or not mobile-friendly, a rebuild is often more cost-effective.",
      },
    ],
  },
  {
    slug: "local-seo-checklist-for-pune-and-pcmc-businesses",
    title: "Local SEO Checklist for Pune & PCMC Businesses (Google Business Profile Guide)",
    description:
      "A step-by-step local SEO checklist for businesses in Pune and Pimpri-Chinchwad: set up your Google Business Profile, earn genuine reviews and rank higher on Google Maps.",
    date: "2026-11-01",
    services: [
      { slug: "seo", label: "Local SEO services" },
      { slug: "website-development", label: "SEO-ready websites" },
      { slug: "content-strategy", label: "Content strategy" },
    ],
    intro:
      "When someone in Pune searches \"near me\" or adds a locality like Wakad, Hinjewadi or Akurdi to their search, Google shows a map with three businesses at the top. Getting into that list depends on how relevant, how close and how prominent your business looks to Google. This checklist covers what you can control.",
    sections: [
      {
        h: "1. Complete your Google Business Profile",
        body: ["Your Google Business Profile is the single most important local SEO asset. Make sure it has:"],
        bullets: [
          "The exact business name you use on signboards and invoices, with no extra keywords",
          "The most accurate primary category, plus relevant secondary categories",
          "Correct address, phone number, website and opening hours",
          "A description that explains what you do and where you serve",
          "Your services listed individually",
          "A logo, a cover photo and real photos of your office, team and work",
        ],
      },
      {
        h: "2. Keep name, address and phone consistent",
        body: [
          "Use exactly the same business name, address and phone number on your website, Google Business Profile, Facebook, Instagram, JustDial, IndiaMART and other directories. Inconsistent details confuse both Google and customers.",
        ],
      },
      {
        h: "3. Earn genuine reviews, the right way",
        body: ["Reviews strongly influence both ranking and trust. Do it properly:"],
        bullets: [
          "Ask real customers soon after you complete their work",
          "Share your review link or QR code so it takes them one tap",
          "Never write reviews yourself, ask staff or family to review, or offer discounts for reviews",
          "Do not filter, only asking happy customers to post on Google",
          "Reply to every review politely, including negative ones",
        ],
      },
      {
        h: "4. Post updates every week",
        body: [
          "Use Google Business Profile posts to share new services, recent work, tips and offers. Regular, useful posts show Google and customers that your business is active.",
        ],
      },
      {
        h: "5. Build location and service pages",
        body: [
          "Your website should have a clear page for each main service and, where relevant, for the areas you serve, such as Pune and Pimpri-Chinchwad, each with genuinely useful, unique content, your address and a map.",
        ],
      },
      {
        h: "6. Get listed in trusted directories",
        body: [
          "Listings on JustDial, Sulekha, IndiaMART, Bing Places and industry directories help Google confirm your business details, and some send customers directly.",
        ],
      },
      {
        h: "7. Track what matters",
        body: [
          "Check Google Business Profile performance (calls, direction requests, website clicks) and Google Search Console every month to see which searches bring customers and which pages need work.",
        ],
      },
    ],
    faqs: [
      {
        q: "How can I rank my business on Google Maps in Pune?",
        a: "Complete and verify your Google Business Profile with the right category, services, hours and photos, keep your name, address and phone consistent everywhere, earn genuine reviews from real customers, post updates regularly and link to a website with clear service and location pages.",
      },
      {
        q: "Is it okay to ask customers for Google reviews?",
        a: "Yes. Google allows businesses to ask customers for reviews. It does not allow fake reviews, reviews from owners or employees, paying or offering discounts for reviews, or asking only happy customers to review.",
      },
      {
        q: "Does a Pimpri-Chinchwad address help me rank in Pune?",
        a: "Distance to the person searching is one ranking factor, so you will usually appear more for searches near your address. Relevant service pages, location pages and a strong, well-reviewed profile help you appear for searches across the wider Pune area.",
      },
    ],
  },
  {
    slug: "mobile-app-development-in-pune-guide",
    title: "Mobile App Development in Pune: A Practical Guide for Businesses",
    description:
      "Planning an Android or iOS app in Pune or Pimpri-Chinchwad? Native vs Flutter vs React Native, what to prepare, how the build works and what affects cost and timeline.",
    date: "2026-11-02",
    services: [
      { slug: "mobile-app-development", label: "Mobile app development" },
      { slug: "ui-ux-design", label: "UI/UX design" },
      { slug: "saas-platform-development", label: "SaaS platforms" },
    ],
    intro:
      "A mobile app can bring customers closer to your business, but only if it solves a clear problem and is built for the way people actually use their phones. This guide explains the main choices Pune businesses face when planning an app, and how to prepare so the project stays on time and on budget.",
    sections: [
      {
        h: "Start with the problem, not the app",
        body: [
          "Write down who will use the app, what they need to do in it and why a website is not enough. Ordering, bookings, loyalty, field-team tracking and customer self-service are common reasons. If the same job can be done on a fast mobile website, start there.",
        ],
      },
      {
        h: "Native, Flutter or React Native?",
        body: ["The technology affects speed, cost and long-term maintenance:"],
        bullets: [
          "Cross-platform (Flutter or React Native): one codebase for Android and iOS, usually the most cost-effective choice for business apps",
          "Native (Kotlin for Android, Swift for iOS): best for apps that rely heavily on device features, complex animations or maximum performance",
          "Progressive web app: installs from the browser, no app store, good for simple tools and internal teams",
        ],
      },
      {
        h: "What the app needs behind the scenes",
        body: [
          "Most apps need a backend: user accounts, a database, an admin panel to manage content and orders, notifications and integrations with payment gateways, CRMs or ERPs. Plan these early, because they are often a large part of the work.",
        ],
      },
      {
        h: "How the build usually works",
        body: ["A typical app project moves through these stages:"],
        bullets: [
          "Discovery: goals, users, must-have features, integrations",
          "Prototype: clickable screens to test the flow before coding",
          "Iterative development in short sprints with regular demos",
          "Beta testing with real users",
          "Play Store and App Store submission and launch",
        ],
      },
      {
        h: "What affects cost and timeline",
        body: [
          "The number of screens and user roles, integrations, offline features, the admin panel, design complexity and app store review all affect effort. A clear written scope and a phased plan (launch a focused first version, then add features) keep projects predictable.",
        ],
      },
      {
        h: "After launch",
        body: [
          "Apps need updates for new Android and iOS versions, bug fixes, security patches and improvements based on how people use them. Budget for ongoing maintenance from the start.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I build my app in Flutter or native?",
        a: "For most business apps, a cross-platform framework such as Flutter or React Native is the most cost-effective choice because one codebase runs on both Android and iOS. Native development suits apps that depend heavily on device hardware or need maximum performance.",
      },
      {
        q: "How long does it take to build a mobile app in Pune?",
        a: "It depends on the number of screens, user roles, integrations and the backend. A focused first version built in phases is the fastest route to launch. Softgress agrees the timeline in a written proposal after discovery.",
      },
      {
        q: "Do you handle Play Store and App Store submission?",
        a: "Yes. Softgress prepares the store listings and builds, submits the app to Google Play and the Apple App Store, and handles review feedback. Approval timelines are decided by Google and Apple.",
      },
    ],
  },
  {
    slug: "google-ads-vs-meta-ads-for-pune-businesses",
    title: "Google Ads vs Meta Ads: Which Is Right for Your Pune Business?",
    description:
      "Google Ads or Facebook and Instagram ads? A simple comparison for Pune and Pimpri-Chinchwad businesses: intent, targeting, creatives, tracking and when to use both.",
    date: "2026-11-02",
    services: [
      { slug: "google-ads", label: "Google Ads management" },
      { slug: "meta-ads", label: "Meta (Facebook & Instagram) ads" },
      { slug: "performance-marketing", label: "Performance marketing" },
    ],
    intro:
      "Google Ads and Meta Ads (Facebook and Instagram) both bring customers, but they work in very different ways. Choosing the right one, or the right mix, depends on whether people already search for what you sell and how visual your offer is.",
    sections: [
      {
        h: "Google Ads: reach people who are already searching",
        body: [
          "Google Search ads appear when someone types a query such as \"website developer in Pune\" or \"dentist near me\". The person already has a need, so these ads often bring high-intent enquiries. They work best when there is clear search demand for your service.",
        ],
      },
      {
        h: "Meta Ads: create demand with the right audience",
        body: [
          "Facebook and Instagram ads appear while people scroll. You choose an audience by location, interests and behaviour, then catch their attention with images or video. They work well for visual products, offers, events, education and building awareness for a new brand.",
        ],
      },
      {
        h: "Side-by-side comparison",
        body: ["The main differences at a glance:"],
        bullets: [
          "Intent: Google catches existing demand; Meta creates new demand",
          "Creative: Google search ads are text-led; Meta depends on strong images and video",
          "Targeting: Google uses keywords and location; Meta uses audiences, interests and lookalikes",
          "Best for: services people search for (Google) vs visual or impulse offers and awareness (Meta)",
        ],
      },
      {
        h: "When to use both",
        body: [
          "Many Pune businesses use Google Ads to capture people ready to buy and Meta Ads to stay visible and retarget visitors who did not enquire the first time. Start with the channel that matches your customers, then add the other once tracking shows what works.",
        ],
      },
      {
        h: "Set up tracking before spending",
        body: [
          "Whichever channel you choose, set up conversion tracking for calls, forms and WhatsApp clicks first, and send ads to a fast, relevant landing page. Without tracking you cannot tell which ads bring customers.",
        ],
      },
      {
        h: "Budget and fees",
        body: [
          "Ad spend is paid directly to Google or Meta and is separate from any agency fee. Start with a test budget, measure cost per enquiry, and increase spend on what works. No agency can honestly guarantee a fixed number of leads.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Google Ads better than Facebook ads for a Pune business?",
        a: "Neither is better for everyone. Google Ads suits services people actively search for, while Meta (Facebook and Instagram) ads suit visual products, offers and building awareness. Many businesses use both, with conversion tracking to see which brings enquiries at a lower cost.",
      },
      {
        q: "How much should I spend on ads?",
        a: "Start with a test budget you are comfortable with, track the cost per enquiry for a few weeks, then increase spend on the campaigns that bring customers. Ad spend is paid directly to Google or Meta and is separate from agency fees.",
      },
      {
        q: "Do I need a landing page for ads?",
        a: "A focused landing page with a clear offer, fast loading and an easy way to call, WhatsApp or fill a form usually converts better than sending ad traffic to a general home page.",
      },
    ],
  },
  {
    slug: "whatsapp-business-automation-guide",
    title: "WhatsApp Business Automation: A Guide for Indian Businesses",
    description:
      "How Pune and Indian businesses use WhatsApp Business API automation for lead replies, follow-ups, order updates and support, plus what you need to get started.",
    date: "2026-11-02",
    services: [
      { slug: "whatsapp-automation", label: "WhatsApp automation" },
      { slug: "ai-chatbots", label: "AI chatbots" },
      { slug: "crm-automation", label: "CRM automation" },
    ],
    intro:
      "Most customers in India prefer WhatsApp to email. Automating the repetitive parts of WhatsApp conversations, such as first replies, follow-ups and order updates, helps businesses respond faster without adding staff. Here is how it works and what you need.",
    sections: [
      {
        h: "WhatsApp Business app vs WhatsApp Business API",
        body: ["There are two different products:"],
        bullets: [
          "WhatsApp Business app: free, runs on one phone, with basic quick replies and labels; good for small teams",
          "WhatsApp Business API (WhatsApp Business Platform): for automation, multiple team members, chatbots and integration with your website, CRM or ERP, accessed through Meta or an approved provider",
        ],
      },
      {
        h: "What businesses automate",
        body: ["Common, high-value automations include:"],
        bullets: [
          "Instant reply to every new enquiry from ads, the website or Google",
          "Lead qualification questions and routing to the right salesperson",
          "Appointment reminders and booking confirmations",
          "Order, payment and delivery updates",
          "Follow-ups for quotes that have not been answered",
          "FAQs answered by a chatbot, with a hand-off to a person",
        ],
      },
      {
        h: "Templates, opt-in and Meta's rules",
        body: [
          "Messages a business starts must use message templates approved by Meta, and customers should opt in to receive them. Template approval can affect timelines, so plan templates early and keep them useful, not spammy.",
        ],
      },
      {
        h: "Connect WhatsApp to your CRM",
        body: [
          "The biggest gains come when WhatsApp is connected to the rest of your system: enquiries land in your CRM automatically, salespeople see the full conversation, and reports show which campaigns bring customers.",
        ],
      },
      {
        h: "How to get started",
        body: ["A practical first step:"],
        bullets: [
          "List the questions your team answers again and again",
          "Map your enquiry and follow-up process",
          "Choose two or three automations that save the most time",
          "Prepare message templates and an opt-in method",
          "Launch, measure response times and conversions, then expand",
        ],
      },
    ],
    faqs: [
      {
        q: "What is WhatsApp Business API automation?",
        a: "It is the use of the WhatsApp Business Platform to send automated, template-based messages and chatbot replies, connected to your website, CRM or ordering system, so enquiries, follow-ups and updates happen without manual work.",
      },
      {
        q: "Is the WhatsApp Business API free?",
        a: "Meta charges for business conversations depending on the message category and volume, and providers may add platform fees. Softgress explains the current charges during scoping; they are separate from our setup fee.",
      },
      {
        q: "Can a WhatsApp chatbot hand over to a human?",
        a: "Yes. A well-designed chatbot answers common questions and collects details, then hands the conversation to a team member when the customer needs help or is ready to buy.",
      },
    ],
  },
  {
    slug: "custom-crm-vs-ready-made-crm-for-pune-businesses",
    title: "Custom CRM vs Ready-Made CRM: What Pune Businesses Should Choose",
    description:
      "Should a Pune or Pimpri-Chinchwad business buy a ready-made CRM like Zoho or HubSpot, or build custom CRM software? A plain comparison of fit, cost factors, timeline and when each makes sense.",
    date: "2026-11-05",
    services: [
      { slug: "crm-erp-development", label: "Custom CRM & ERP development" },
      { slug: "crm-automation", label: "CRM automation & integration" },
      { slug: "custom-integrations", label: "Custom integrations" },
    ],
    intro:
      "Most small and growing businesses in Pune should start with a ready-made CRM and customise it, because it is faster to launch and cheaper to begin with. Custom CRM software makes sense when your sales, service or operations process is unusual, when you need the CRM tightly connected to billing, inventory or your own app, or when per-user subscription costs grow larger than the cost of owning your own system. This guide explains how to decide.",
    sections: [
      {
        h: "What a CRM actually does for your business",
        body: [
          "A CRM (customer relationship management system) keeps every enquiry, customer, conversation and follow-up in one place. Instead of leads sitting in WhatsApp chats, notebooks and Excel sheets, your team sees who enquired, what they asked for, who is handling them and what the next step is.",
          "For businesses in Pune and PCMC that get enquiries from Google, Instagram, IndiaMART, walk-ins and referrals, the biggest benefit is simple: fewer leads are forgotten, and the owner can see the pipeline without asking each salesperson.",
        ],
      },
      {
        h: "Ready-made CRM: when it is the right choice",
        body: [
          "Ready-made CRMs such as Zoho CRM, HubSpot, Salesforce, Freshsales or LeadSquared are mature products with mobile apps, reports, email and WhatsApp integrations already built in. You pay a subscription, usually per user per month.",
        ],
        bullets: [
          "Your sales process is fairly standard: enquiry, follow-up, quotation, closing",
          "You want to start within days or weeks, not months",
          "Your team is small and the per-user cost is manageable",
          "You are happy to adjust some of your process to how the software works",
        ],
      },
      {
        h: "Custom CRM software: when it is worth building",
        body: [
          "A custom CRM is built around your exact workflow. You own the software and the data, and it can include modules a ready-made product does not offer well, such as job cards, site visits, service contracts, batch tracking, dealer management or approvals specific to your industry.",
        ],
        bullets: [
          "Your process has steps that ready-made CRMs handle badly or need many workarounds for",
          "You need one system for sales plus billing, inventory, HR or service, instead of several apps",
          "You want the CRM inside your own website, customer portal or mobile app",
          "You have many users, so long-term subscription costs are high",
          "Data ownership, hosting location or custom access rules matter to you",
        ],
      },
      {
        h: "The middle path: customise and integrate",
        body: [
          "Many businesses get the best result by keeping a ready-made CRM and connecting it to everything else. Website forms, Google and Meta ad leads, WhatsApp and IndiaMART enquiries can flow into the CRM automatically, follow-up reminders can be created on their own, and reports can be sent to the owner every morning.",
          "This approach is usually quicker and lower risk than building from scratch, and it is a good first step even if you later move to a custom system.",
        ],
      },
      {
        h: "What affects the cost and timeline",
        body: [
          "There is no single price for a CRM project, because the scope varies so much. These are the factors that change it the most:",
        ],
        bullets: [
          "Number of modules (leads, quotations, billing, inventory, service, HR)",
          "Number of user roles and approval levels",
          "Integrations with WhatsApp, payment gateways, accounting software, ads platforms or your existing systems",
          "Mobile app or offline needs for field staff",
          "Data migration from Excel or an old system",
          "Reports and dashboards required at launch",
        ],
      },
      {
        h: "How to decide in one meeting",
        body: [
          "Write down your current process from first enquiry to payment, list the problems you face today, and note which other tools the CRM must talk to. With that, a development team can tell you honestly whether a ready-made CRM, an integration project or custom software is the better fit, and what a sensible first phase looks like.",
          "Softgress, based in Akurdi, Pimpri-Chinchwad, builds custom CRM and ERP systems and also sets up and automates ready-made CRMs for businesses across Pune, Mumbai, Bangalore and beyond. A short discovery call is enough to point you in the right direction.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is custom CRM software better than Zoho or HubSpot?",
        a: "Not always. Ready-made CRMs are faster and cheaper to start with and suit standard sales processes. Custom CRM software is better when your workflow is unusual, when you need sales, billing and operations in one system, or when you want to own the software and avoid growing per-user fees.",
      },
      {
        q: "How long does it take to build a custom CRM?",
        a: "It depends on the modules, integrations and number of user roles. A focused first version covering leads and follow-ups is much quicker than a full CRM with billing, inventory and a mobile app. A clear scope at the start keeps the timeline predictable.",
      },
      {
        q: "Can my leads from WhatsApp, IndiaMART and Google ads go into the CRM automatically?",
        a: "Yes. Most lead sources can be connected so that enquiries are created in the CRM automatically with the source recorded, and follow-up tasks are assigned to the right person.",
      },
      {
        q: "Can I move my existing Excel data into a new CRM?",
        a: "Yes. Customer and lead data from Excel or an older system can usually be cleaned and imported, so your team does not start from zero.",
      },
    ],
  },
  {
    slug: "custom-crm-software-for-pune-businesses",
    title: "Custom CRM Software for Pune Businesses: When to Build Instead of Buy",
    description:
      "Should a Pune or Pimpri-Chinchwad business build a custom CRM or use a ready-made one? A practical guide to the signs, the modules, the build process and what to prepare.",
    date: "2026-11-05",
    services: [
      { slug: "crm-erp-development", label: "CRM & ERP development" },
      { slug: "custom-integrations", label: "Custom integrations & APIs" },
      { slug: "crm-automation", label: "CRM automation" },
    ],
    intro:
      "A custom CRM makes sense when your sales, service or operations process does not fit a ready-made tool, when your team works around the software with spreadsheets and WhatsApp, or when you need the CRM to connect closely with billing, inventory or other in-house systems. If your process is simple and standard, a ready-made CRM, configured well, is usually enough. This guide helps business owners in Pune and Pimpri-Chinchwad decide, and explains what a custom build involves.",
    sections: [
      {
        h: "What a CRM actually does for a business",
        body: [
          "A CRM (customer relationship management) system keeps every enquiry, customer, conversation, quote and follow-up in one place. Instead of leads sitting in different phones, notebooks and spreadsheets, the whole team works from the same record, and owners can see what is happening without asking around.",
          "For many growing businesses in Pune and PCMC, the CRM becomes the centre of daily work: sales teams use it to follow up, managers use it to assign leads and review pipelines, and accounts or operations teams use it to move a confirmed order forward.",
        ],
      },
      {
        h: "Ready-made CRM vs custom CRM",
        body: ["Both are valid choices. The right one depends on how unusual your process is:"],
        bullets: [
          "Ready-made CRM: quick to start, monthly per-user subscription, standard sales pipeline features; you adapt your process to the software",
          "Customised ready-made CRM: an existing product configured or extended for your fields, stages and reports; a middle path for many businesses",
          "Custom CRM: built around your own workflow, roles and data; you own the system and can extend it as the business changes",
          "Custom CRM inside a wider ERP: sales connected with inventory, billing, HR or production in one internal system",
        ],
      },
      {
        h: "Signs your business may need a custom CRM",
        body: ["Consider a custom or heavily customised system if several of these sound familiar:"],
        bullets: [
          "Your team still keeps important data in spreadsheets because the current tool cannot handle it",
          "Your sales process has steps, approvals or product configurations that standard CRMs do not support",
          "You need the CRM to talk to your billing, inventory, website or WhatsApp in real time",
          "Different departments or branches need different views, permissions and reports",
          "Per-user subscription costs keep rising as the team grows, while many features go unused",
          "You want full control over your customer data and where it is stored",
        ],
      },
      {
        h: "Common modules in a custom CRM",
        body: [
          "A custom CRM does not need to do everything on day one. Most businesses start with the modules that save the most time, then add more in phases:",
        ],
        bullets: [
          "Lead capture from the website, Google and Meta ads, WhatsApp and phone calls",
          "Lead assignment and routing to the right salesperson or branch",
          "Follow-up reminders, tasks and activity history",
          "Quotations, orders and invoices linked to the customer record",
          "Inventory, service tickets or project tracking, depending on the business",
          "Role-based access for owners, managers and team members",
          "Dashboards and reports for pipeline, conversions and team performance",
        ],
      },
      {
        h: "How a custom CRM is built",
        body: [
          "A good custom CRM project starts with your process, not with screens. At Softgress, CRM and ERP work follows a clear path: a process audit, written requirements, a phased build, data migration from your current tools, and a planned rollout with training and support.",
          "Building in phases matters. The first phase should solve the most painful problem, for example missed follow-ups or scattered leads, and go live with real users. Feedback from that phase then shapes the next modules, so the system grows with how your team actually works.",
        ],
      },
      {
        h: "What to prepare before you talk to a developer",
        body: ["You will get a clearer scope and a more realistic plan if you gather a few things first:"],
        bullets: [
          "The tools and spreadsheets your team uses today",
          "The teams and roles that will use the CRM, and what each needs to see",
          "Your key workflows, from first enquiry to payment and after-sales",
          "Rough data volumes, such as number of leads, customers and products",
          "Systems the CRM must connect with, such as accounting, website or WhatsApp",
          "Your target go-live date",
        ],
      },
      {
        h: "Plan automation and integrations from the start",
        body: [
          "Much of the value of a CRM comes from what happens automatically: an enquiry from your website or ads creating a lead instantly, a WhatsApp reply going out within seconds, a reminder reaching the salesperson before a follow-up is missed, or a confirmed order flowing into billing. Plan these integrations at the start so the data structure supports them, rather than adding them later as patches.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is a custom CRM better than a ready-made CRM?",
        a: "Not always. A ready-made CRM is often enough for a simple, standard sales process. A custom CRM is better when your workflow, approvals or integrations do not fit standard tools, or when you want full ownership and control of the system and data.",
      },
      {
        q: "How long does it take to build a custom CRM?",
        a: "It depends on the number of modules, users, integrations and the data to migrate. Softgress plans CRM work in phases, so the first useful version can go live earlier and further modules follow. A clear timeline is shared after the requirements stage.",
      },
      {
        q: "Can our existing data be moved into a new CRM?",
        a: "Yes. Data migration from spreadsheets or an existing tool is a standard part of a CRM project. The data is cleaned and mapped to the new structure before go-live.",
      },
      {
        q: "Can a custom CRM connect with WhatsApp and our website?",
        a: "Yes. Website forms, ad leads, WhatsApp Business API, accounting and other systems can be connected through integrations and APIs, so leads and updates flow into the CRM automatically.",
      },
      {
        q: "Does Softgress also customise existing CRM or ERP products?",
        a: "Yes. Along with building custom systems, Softgress can customise existing CRM and ERP products to fit your operations. The right approach is recommended after understanding your process.",
      },
    ],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

/** Guides that link to a service, newest first, for "related guides" on service pages. */
export const guidesForService = (serviceSlug: string) => articles.filter((a) => a.services.some((s) => s.slug === serviceSlug));

/** Newest guides first. */
export const latestArticles = (n: number) => [...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
