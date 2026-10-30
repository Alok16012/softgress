import type { MetadataRoute } from "next";
import { departments } from "@/content/departments";
import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { SITE_URL } from "@/lib/seo";

// Built from the seed catalogue so the sitemap never depends on the database at build time.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const url = (p: string) => `${SITE_URL}${p}`;
  const pages = ["", "/services", "/locations", "/about", "/contact", "/get-started", "/work", "/privacy"].map((p) => ({
    url: url(p),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : p === "/privacy" ? 0.3 : 0.7,
  }));
  return [
    ...pages,
    ...locations.map((l) => ({ url: url(`/locations/${l.slug}`), lastModified, changeFrequency: "monthly" as const, priority: l.slug === "pune" ? 0.9 : 0.8 })),
    ...departments.filter((d) => d.slug !== "reception").map((d) => ({ url: url(`/departments/${d.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...services.map((s) => ({ url: url(`/services/${s.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
