# Google Business Profile: audit and optimisation plan

Profile: **Softgress Pvt Ltd** · Software company · Akurdi Chowk, Shubhashri Residency, Ganga Nagar, Akurdi,
Pimpri-Chinchwad, Maharashtra 411035 · managed by info@softgress.com · audited 30 Oct 2026.

## Audit: current state

| Field | Now | Problem |
|---|---|---|
| Phone | **Pending: 083559 29242** (edit stuck: "taking longer than expected") | Doesn't match the website (+91 74472 07700). Name, address and phone must be identical everywhere, or local rankings suffer. |
| Chat / SMS | Pending: +91 83559 29242 | Same mismatch. |
| Categories | Software company only | No secondary categories, so the profile misses "digital marketing agency", "website designer" and similar searches. |
| Description | Generic, has no local or service keywords | Doesn't mention Pimpri-Chinchwad, PCMC, SEO, ads, apps, WhatsApp automation and so on. |
| Website | https://www.softgress.com/ | The site's canonical URL is https://softgress.com/. Use the canonical URL. |
| Service area | Empty | No signal for the surrounding areas served. |
| Opening date | Empty | Public MCA records show incorporation on 18 Sep 2026. |
| Hours | Mon–Sat 09:30–18:30, Sun closed | OK. |
| Services / products | Not filled | A big relevance signal, and it feeds AI Overviews. |
| Photos | None (Street View only) | Profiles with photos get far more clicks. You need a logo, cover, office and team photos. |
| Reviews | 0 | The #1 factor for the map pack and for "best agency in Pune" answers. |
| Posts | None | Freshness signal. |
| Social links | None | Facebook, YouTube (@Softgress) and Instagram exist. Link them. |

## Proposed changes (applied after approval)

**1. Phone:** set one number, the same one used on the website, and remove the stuck pending edit.

**2. Secondary categories** (choose from Google's list): Website designer · Internet marketing service ·
Marketing agency · Advertising agency · Graphic designer · Video production service · Software company stays primary.

**3. Description** (under 750 characters, no URLs or phone numbers, per Google policy):

> Softgress Pvt Ltd is a software development and digital marketing company in Akurdi, Pimpri-Chinchwad, Pune.
> Five teams under one roof build business websites, e-commerce stores, mobile apps, SaaS platforms and CRM/ERP
> systems, and grow them with SEO, Google Ads, Meta Ads, social media marketing, branding, video production and
> AI automation, including AI chatbots and WhatsApp automation. We work with businesses across Pune and PCMC,
> Mumbai, Bangalore, the rest of India and internationally. Every project starts with a written brief and a clear
> quote, and you get one point of contact from discovery to launch and ongoing support. Request a free
> consultation today.

**4. Website:** https://softgress.com/

**5. Opening date:** September 2026.

**6. Service area** (Google wants areas within a reasonable drive): Pune, Pimpri-Chinchwad, Hinjewadi, Wakad,
Baner, Aundh, Kharadi, Viman Nagar, Hadapsar, Kothrud, Chakan, Bhosari, Talegaon Dabhade, Mumbai, Thane, Navi Mumbai.
(Bangalore, India-wide and international are covered by the website's location pages.)

**7. Services:** add all 30 services from the site catalogue under their categories, each with its one-line
summary. Examples: Website Development, E-commerce Development, Mobile App Development, SaaS Platforms,
CRM & ERP Systems, SEO, Google Ads, Meta Ads, Social Media Marketing, Lead Generation, Brand Identity,
UI/UX Design, Video Production, AI Chatbots, WhatsApp Automation.

**8. First post** (button "Learn more" pointing to https://softgress.com/locations/pune):

> Our new website is live! Softgress builds websites and apps, runs SEO and Google and Meta ads, creates brands
> and video, and sets up AI and WhatsApp automation. One team in Akurdi, Pimpri-Chinchwad, for businesses across
> Pune, Mumbai, Bangalore and beyond. Book a free consultation.

**9. Social profiles:** add the Facebook, Instagram and YouTube URLs (please confirm the exact URLs).

## Website side (GEO/entity linking, needs a push)

- Add the Google Business Profile Maps URL plus the social URLs to `SAME_AS` in `src/lib/seo.ts`.
- Add `geo` (18.6483745, 73.7850242, from the profile's own map pin) and `openingHoursSpecification`
  (Mon–Sat 09:30–18:30) to the LocalBusiness schema.
- Embed the map on `/contact` and `/locations/pune`.

## You need to do (can't be done for you)

- **Photos:** logo (square, 720×720+), cover (1080×608), 5+ office photos (exterior with signage, interior),
  team photos and work screenshots. The browser pane can't pick files from your computer.
- **Reviews:** share the review link (Business Profile → "Ask for reviews") with every client and contact.
  Aim for 5 in the first month and 30+ over time, and reply to every review. Never buy reviews or offer
  incentives for them; Google removes those.
- **Weekly post:** one update a week (a project, a tip, an offer).
