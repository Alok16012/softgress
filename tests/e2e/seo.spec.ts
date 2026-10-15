import { test, expect } from "./helpers";

test.describe("SEO & semantic parity", () => {
  test("service pages are server-rendered HTML (no JS needed)", async ({ request }) => {
    const html = await (await request.get("/services/meta-ads")).text();
    expect(html).toContain("Meta Ads (Facebook &amp; Instagram)");
    expect(html).toContain("Custom quote required");
    expect(html).toContain('"@type":"Service"');
  });

  test("home renders the full directory for crawlers", async ({ request }) => {
    const html = await (await request.get("/")).text();
    for (const t of ["Software Development", "Digital Marketing", "Creative Production Studio", "AI &amp; Automation Lab", "Search Engine Optimisation (SEO)"]) expect(html).toContain(t);
  });

  test("sitemap and robots", async ({ request }) => {
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/services/website-development");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
  });
});
