import { describe, expect, it } from "vitest";
import { articles } from "@/content/blog";
import { departments } from "@/content/departments";
import { locations } from "@/content/locations";
import { HOME_DESCRIPTION, departmentDescription, serviceDescription } from "@/content/seo";
import { services } from "@/content/services";
import { MAX_DESCRIPTION, fitDescription } from "@/lib/seo";

// Search snippets cut long descriptions mid-sentence, so every generated or written
// description must fit, and every guide must link to a service that exists.
describe("search copy", () => {
  it("fitDescription picks the longest candidate that fits", () => {
    expect(fitDescription("x".repeat(200), "short one", "shorter")).toBe("short one");
    expect(fitDescription("x".repeat(200), "y".repeat(170))).toBe("y".repeat(170));
  });

  it("keeps every meta description within the snippet limit", () => {
    const all: [string, string][] = [
      ["home", HOME_DESCRIPTION],
      ...services.map((s): [string, string] => [`service ${s.slug}`, serviceDescription(s)]),
      ...departments.map((d): [string, string] => [`department ${d.slug}`, departmentDescription(d.description)]),
      ...locations.map((l): [string, string] => [`location ${l.slug}`, l.description]),
    ];
    for (const [name, text] of all) expect(text.length, name).toBeLessThanOrEqual(MAX_DESCRIPTION);
  });

  it("gives each guide a unique slug and links only to real services", () => {
    const slugs = new Set(services.map((s) => s.slug));
    expect(new Set(articles.map((a) => a.slug)).size).toBe(articles.length);
    for (const a of articles) {
      for (const s of a.services) expect(slugs.has(s.slug), `${a.slug} → ${s.slug}`).toBe(true);
      expect(a.faqs.length, a.slug).toBeGreaterThanOrEqual(3);
    }
  });
});
