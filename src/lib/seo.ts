import type { Metadata } from "next";
import { office } from "@/content/company";
import { leaders } from "@/content/leadership";
import { services } from "@/content/services";

// One source for the public site origin, structured data and per-page metadata.
// Falls back to the production domain (never localhost) so canonicals, the sitemap
// and OG images stay correct even when SITE_URL is missing on the host.
export const SITE_URL = (process.env.SITE_URL || "https://softgress.com").replace(/\/+$/, "");
export const SITE_NAME = "Softgress";
export const LOCALE = "en_IN";

export const absUrl = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * Official profiles for the brand (Google Business Profile, LinkedIn, Instagram,
 * Facebook, YouTube, Clutch...). Add each real URL here: search engines and AI
 * assistants use `sameAs` to connect the website to the Softgress entity.
 */
export const SAME_AS: string[] = [
  "https://maps.google.com/?cid=3826205672514681734",
  "https://www.youtube.com/@Softgress",
  "https://www.instagram.com/softgress/",
];

/** Map pin of the Google Business Profile and its published opening hours. */
export const GEO = { latitude: 18.6483745, longitude: 73.7850242 };
export const OPENING_HOURS = { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:30", closes: "18:30" };

/** Places Softgress serves. The office is in Pimpri-Chinchwad, Pune; other cities are served remotely. */
export const AREA_SERVED = [
  { "@type": "City", name: "Pune" },
  { "@type": "City", name: "Pimpri-Chinchwad" },
  { "@type": "City", name: "Mumbai" },
  { "@type": "City", name: "Bengaluru" },
  { "@type": "Country", name: "India" },
  { "@type": "Place", name: "Worldwide" },
];

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Per-page metadata: canonical plus matching Open Graph and Twitter text. */
export function pageMeta({ title, description, path, absoluteTitle = false }: { title: string; description: string; path: string; absoluteTitle?: boolean }): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  // A page-level openGraph replaces the inherited one, so the shared image is named explicitly.
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: "Softgress: software development & digital marketing company in Pune, India" };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: LOCALE, url: path, title: fullTitle, description, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}

/** Organization + local business node, referenced by @id from every other node. */
export function organizationLd(contactEmail?: string) {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE_NAME,
    legalName: office.name,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absUrl("/brand/softgress-badge.png"), width: 512, height: 512 },
    image: absUrl("/opengraph-image"),
    slogan: "Ideas engineered. Growth accelerated.",
    description:
      "Softgress is a software development and digital marketing company in Pimpri-Chinchwad, Pune, India. Five teams under one roof build websites, apps, SaaS and CRM systems, run SEO and paid ads, produce brand and video content, and set up AI and WhatsApp automation for clients in Pune, Mumbai, Bangalore, across India and abroad.",
    telephone: office.phone.tel,
    ...(contactEmail ? { email: contactEmail } : {}),
    address: { "@type": "PostalAddress", ...office.postal },
    hasMap: SAME_AS[0] ?? office.mapsUrl,
    geo: { "@type": "GeoCoordinates", ...GEO },
    openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: OPENING_HOURS.days, opens: OPENING_HOURS.opens, closes: OPENING_HOURS.closes },
    foundingDate: "2026-09",
    areaServed: AREA_SERVED,
    knowsAbout: services.map((s) => s.title),
    founder: leaders.map((l) => ({ "@type": "Person", name: l.name, jobTitle: l.role })),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: office.phone.tel,
      areaServed: ["IN", "Worldwide"],
      availableLanguage: ["English", "Hindi"],
    },
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

export function websiteLd() {
  return { "@type": "WebSite", "@id": WEBSITE_ID, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": ORG_ID } };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

export interface Faq {
  q: string;
  a: string;
}

export function faqLd(faqs: Faq[]) {
  return { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

/** Wraps nodes in one schema.org graph. */
export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
