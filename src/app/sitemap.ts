import type { MetadataRoute } from "next";
import { departments } from "@/content/departments";
import { services } from "@/content/services";

// Built from the seed catalogue so the sitemap never depends on the database at build time.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const pages = ["", "/services", "/work", "/contact", "/privacy"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));
  return [
    ...pages,
    ...departments.filter((d) => d.slug !== "reception").map((d) => ({ url: `${base}/departments/${d.slug}`, priority: 0.6 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.8 })),
  ];
}
