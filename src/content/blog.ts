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
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);
