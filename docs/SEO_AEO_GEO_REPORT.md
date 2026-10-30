# Softgress: SEO, AEO & GEO Audit and Action Plan

Audit date: 30 Oct 2026 · Scope: GitHub repo `Alok16012/softgress` (branch `main`) and the live site https://softgress.com (Netlify).

**Goal:** rank Softgress at the top for software development and digital marketing searches in
**Pune (home market), Mumbai, Bangalore, India-wide, and international** (US/UK/UAE/Canada/Australia),
and get Softgress named in AI answers (Google AI Overviews, ChatGPT, Perplexity, Gemini, Copilot).

- **SEO**: rank in Google and Bing results.
- **AEO** (Answer Engine Optimisation): win featured snippets, "People also ask", voice answers.
- **GEO** (Generative Engine Optimisation): be cited and recommended by AI assistants.

> **Honest note.** No one can guarantee a #1 position. Code fixes remove the blockers and give Google and
> AI systems everything they need. Getting to the top, especially in competitive cities like Mumbai and
> Bangalore, also depends on things outside the code: a Google Business Profile with reviews, backlinks,
> real case studies and steady content. Part C lists those tasks.

---

## A. What we found (live site + code)

### Critical: these are blocking rankings right now

| # | Issue | Evidence | Impact |
|---|---|---|---|
| 1 | **Every canonical URL points to `http://localhost:3000`** | `<link rel="canonical" href="http://localhost:3000/services/seo">` on the live site. `SITE_URL` is not set on Netlify and the code falls back to localhost. | Google is told the "real" page lives on localhost. Pages can be dropped or get no ranking credit. |
| 2 | **`sitemap.xml` and `robots.txt` list localhost URLs** | `Sitemap: http://localhost:3000/sitemap.xml`; every `<loc>` is localhost. | Google cannot discover pages from the sitemap. |
| 3 | **Social/OG images point to localhost** | `og:image = http://localhost:3000/opengraph-image…` | Shared links on WhatsApp, LinkedIn, Facebook and X show no preview image. |
| 4 | **Zero location signals** | "Pune": 0 mentions, "Mumbai": 0, "Bangalore": 0 on the home page. | The site cannot rank for "… in Pune / Mumbai / Bangalore" if it never says so. |
| 5 | **No location landing pages** | No `/pune`, `/mumbai`, `/bangalore`, `/india`, international page. | Nothing to rank for city searches. |

### High

| # | Issue | Impact |
|---|---|---|
| 6 | Page `<title>` and description are **streamed into `<body>`** (title found at byte 47,208, after `<body>`), because metadata reads the database at request time. | AI crawlers (GPTBot, ClaudeBot, PerplexityBot) and some bots read only the initial HTML, so they may miss titles and descriptions. |
| 7 | Service and department pages output a **second `<h1>Loading…</h1>`** from the Suspense fallback. | Duplicate, meaningless H1 on 35 pages. |
| 8 | Every page shares the **same OG title/description** ("Softgress"). | Poor click-through from social and some search surfaces. |
| 9 | **Thin schema**: Organization has no `logo`, `sameAs`, `areaServed`, `geo`, `openingHours`. No `LocalBusiness`, `WebSite`, `BreadcrumbList` or `FAQPage`. Service schema has no `areaServed`, `url` or provider details. | No rich results; weak entity signals for Google's Knowledge Graph and for AI systems. |
| 10 | **No FAQ content anywhere.** | AEO depends on clear question-and-answer content. Nothing qualifies for "People also ask" or AI answer extraction. |
| 11 | **No `llms.txt`**, and `robots.txt` does not explicitly welcome AI crawlers. | Missed GEO signal. AI assistants get no concise, trusted summary of the business. |
| 12 | Titles are not keyword-targeted: "Search Engine Optimisation (SEO) · Softgress". | Misses high-intent queries such as "SEO company in Pune". |
| 13 | `www.softgress.com` and `softgress.com` both return 200 with no redirect. | Duplicate site. (Fixed canonicals help; a 301 redirect is still recommended.) |

### Medium / Low

- No web app manifest (`/manifest.webmanifest` returns 404).
- Home H1 is only the slogan ("Ideas engineered. Growth accelerated."). It has no service or location keyword.
- `Cache-Control: no-store` on every page: everything is rendered per request (~800 ms TTFB). Acceptable, but static rendering would be faster.
- No blog or insights section, so there is no long-tail content engine.
- "Work" contains only sample concepts. Real case studies are the strongest trust signal for both Google (E-E-A-T) and AI recommendations.
- No Google Search Console or Bing Webmaster verification hooks.
- Privacy page says "template notice": finalise it, because thin legal pages are a trust signal.

### What's already good

Server-rendered HTML, a semantic heading structure, descriptive image alt text, a skip link, fast WebP images,
security headers, `lang="en"`, per-page canonicals (once the domain is fixed), a sitemap and robots file (once
the domain is fixed), and honest content with no fabricated claims. That last point helps E-E-A-T and AI trust.

---

## B. What I changed in the code (this pass)

1. **Domain fix (critical #1–3):** one `SITE_URL` helper (`src/lib/seo.ts`). It falls back to
   `https://softgress.com` instead of localhost, so canonicals, sitemap, robots and OG images are correct even
   when the Netlify env var is missing.
2. **Keyword-targeted metadata** for every page: titles and descriptions aimed at Pune, India and
   international queries. Each page has its own Open Graph and Twitter title and description, plus an
   `en_IN` locale.
3. **Static metadata** for service and department pages, built from bundled content, so `<title>` lands
   in `<head>` instead of being streamed. Also removed the duplicate "Loading…" H1.
4. **Location landing pages** at `/locations/pune`, `/locations/mumbai`, `/locations/bangalore`,
   `/locations/india` and `/locations/international`. Each page has its own copy, a services grid, an FAQ,
   and `LocalBusiness`/`Service` + `FAQPage` + `BreadcrumbList` schema. Plus a `/locations` hub. The copy
   is written so that each page is genuinely different (no doorway pages) and every claim is true: the
   office is in Pimpri-Chinchwad, Pune, and other cities are served remotely with on-site visits by
   arrangement.
5. **FAQ sections and `FAQPage` schema** on the home page, every service page (service-specific
   answers) and every location page. Answers are written answer-first, 40–60 words, so engines can
   lift them directly (AEO).
6. **Rich structured data graph**: `Organization` + `ProfessionalService` (LocalBusiness) with logo,
   geo, opening hours, `areaServed`, `knowsAbout` and founders; `WebSite`; `BreadcrumbList` on inner
   pages; `Service` with `areaServed`, `url` and a full provider.
7. **GEO**: `/llms.txt` (an AI-readable company summary and page index), and `robots.txt` that explicitly
   allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended and similar AI crawlers.
8. **Sitemap** now includes the location pages, with `lastModified`.
9. **Home page** gets a keyword-bearing intro heading ("Software development & digital marketing
   company in Pune, India"), location links and an FAQ.
10. Web app manifest, plus Google and Bing verification tags driven by env vars.
11. Footer has a "Locations" column, and each service page links to every location page.

**Files:** `src/lib/seo.ts`, `src/content/seo.ts`, `src/content/locations.ts`,
`src/components/site/{JsonLd,FaqSection}.tsx`, `src/app/locations/**`, `src/app/llms.txt/route.ts`,
`src/app/manifest.ts`, plus updates to `layout.tsx`, `page.tsx`, `robots.ts`, `sitemap.ts`, the
service, department, about, contact, services, work, privacy and get-started pages, `SiteChrome.tsx`,
`HomeHero.tsx`, `next.config.ts` (`htmlLimitedBots: /.*/`), `.env.example`, `docs/DEPLOYMENT.md` and
`tests/e2e/seo.spec.ts`.

**Verified locally (dev server):** on all pages checked, `<title>` is in `<head>`; canonical and `og:url` use
`https://softgress.com`; every page has its own `og:image`; there is exactly one H1; all JSON-LD parses;
FAQs render. The sitemap has 47 URLs and no localhost. `robots.txt`, `llms.txt` and the manifest return 200.
`pnpm typecheck` and `pnpm lint` pass. `pnpm build` on this Windows machine stops with a
`next/font/google` Turbopack error in the unchanged font setup in `layout.tsx`. Netlify builds the same
font code on Linux, but run one deploy preview before merging.

**Please review before publishing:**
- Location page copy in `src/content/locations.ts`: neighbourhoods, industries, and working-style statements
  such as fortnightly demos, Slack/Jira, IP terms and GST-ready flows. Keep only what is true for Softgress.
- Service FAQs are generated from each service's catalogue entry (`serviceFaqs` in `src/content/seo.ts`).
  If an admin edits a service in the CRM, update the seed so the hero, metadata and FAQ match.
- Next.js 16.4.0 reports a known security advisory. Upgrade Next.js (separate task).

---

## C. What YOU need to do (off-site, cannot be done in code)

These matter as much as the code. In rough priority order:

### This week
1. **Netlify env vars:** set `SITE_URL=https://softgress.com`. Optional: `GOOGLE_SITE_VERIFICATION` and
   `BING_SITE_VERIFICATION`. Then redeploy.
2. **Pick one domain.** In Netlify → Domain management, set `softgress.com` as primary so `www` 301-redirects to it.
3. **Google Search Console + Bing Webmaster Tools:** verify, submit `https://softgress.com/sitemap.xml`,
   and request indexing for the home page and the 5 location pages. (Bing also feeds ChatGPT search and Copilot.)
4. **Google Business Profile** (the biggest factor for "near me" and Pune searches and the map pack):
   - Primary category "Software company". Secondary: "Internet marketing service", "Website designer",
     "Marketing agency", "Advertising agency".
   - Name, address and phone must exactly match the site: Softgress Pvt Ltd, Akurdi Chowk, Shubhashri
     Residency, Ganga Nagar, Akurdi, Pimpri-Chinchwad, Maharashtra 411035, +91 74472 07700.
   - Add all services, 20+ real photos (office, team), opening hours, website link to `/locations/pune`
     or the home page, and weekly posts.
   - **Reviews:** ask every happy client. Aim for 30+ genuine Google reviews and reply to all of them.
     Never buy reviews.
5. Add the Google Business Profile URL and social profiles (LinkedIn company page, Instagram, Facebook,
   YouTube, X, Clutch) to `sameAs` in `src/lib/seo.ts`. This links the brand entity for Google and AI.

### This month
6. **Citations / directories** (same name, address and phone everywhere): JustDial, Sulekha, IndiaMART,
   Clutch.co, GoodFirms, DesignRush, The Manifest, TechBehemoths, Crunchbase, LinkedIn, Bing Places and
   Apple Business Connect. Clutch and GoodFirms reviews are heavily used by AI assistants for "best agency
   in X" answers.
7. **Real case studies:** replace the sample concepts with 3–6 real projects (client industry, problem,
   what was built, measurable result, client quote). This is the #1 trust signal for both Google and AI.
8. **Facts for the About page:** founding year, team size, technologies and certifications (Google
   Partner, Meta Business Partner, AWS and so on, only if real). AI engines quote concrete facts.
9. **Backlinks:** guest posts on Indian startup and marketing blogs, Pune business associations (MCCIA),
   local news (Pune Mirror, Punekar News), college placement and tech communities, partner and
   client "built by" footer links.

### Ongoing (content engine)
10. **Blog / Insights:** publish 2–4 articles a month that answer real questions, for example
    "Website development cost in Pune (2026)", "Shopify vs WooCommerce for Indian brands",
    "How to choose a digital marketing agency in Pune", "WhatsApp Business API automation guide".
    Each article should link to the relevant service and location page.
11. **Get mentioned in "best agencies in Pune/Mumbai/Bangalore" listicles.** AI assistants build their
    recommendations largely from these third-party lists, plus Clutch, GoodFirms and Reddit/Quora discussions.
12. **Track progress:** monthly Search Console report (impressions and clicks for "pune", "mumbai",
    "bangalore" queries), Google Business Profile insights, and a manual check of what ChatGPT, Perplexity
    and Gemini say for "best software company in Pune".

---

## D. Target keyword map

| Page | Primary keywords |
|---|---|
| Home | software development company in Pune, digital marketing agency in Pune, IT company Pimpri-Chinchwad |
| /locations/pune | best digital marketing agency in Pune, website development company Pune, SEO company Pune, app development Pune |
| /locations/mumbai | software development company Mumbai, digital marketing agency Mumbai, web development Mumbai |
| /locations/bangalore | app development company Bangalore, SaaS development Bangalore, digital marketing Bangalore |
| /locations/india | software development company India, digital marketing agency India, hire Indian developers |
| /locations/international | offshore software development India, outsource web development to India, white-label digital marketing |
| /services/seo | SEO services Pune, SEO company India, local SEO |
| /services/website-development | website development Pune, web design company India |
| /services/mobile-app-development | mobile app development company Pune, Flutter app development India |
| /services/ai-chatbots, /services/whatsapp-automation | AI chatbot development India, WhatsApp automation company |

## E. Expected timeline (realistic)

- **2–4 weeks:** pages re-indexed with correct canonicals. Branded searches ("Softgress") show proper results.
- **1–3 months:** Pune and Pimpri-Chinchwad long-tail rankings, and map-pack visibility once the Google
  Business Profile has reviews.
- **3–6 months:** competitive Pune head terms. Mumbai, Bangalore and India terms need backlinks and content.
- **6–12 months:** international terms, and regular AI-assistant mentions (depends on reviews, listicles
  and case studies).
