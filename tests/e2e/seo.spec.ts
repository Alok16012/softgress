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

  test("about page renders the founder corner for crawlers", async ({ request }) => {
    const html = await (await request.get("/about")).text();
    expect(html).toContain('id="founder-corner"');
    expect(html).toContain("Meet the people behind Softgress.");
    expect(html).toContain("Bhagwan Shinde");
    expect(html).toContain("SB Suryawanshi");
    expect(html).toContain("Shubhashri Residency");
    expect(html).toContain('"@type":"AboutPage"');
  });

  test("contact page shows phone, WhatsApp, email and office address", async ({ request }) => {
    const html = await (await request.get("/contact")).text();
    expect(html).toContain("tel:+917447207700");
    expect(html).toContain("wa.me/917447207700");
    expect(html).toContain("mailto:info@softgress.com");
    expect(html).toContain("Shubhashri Residency");
    expect(html).toContain('"@type":"ContactPage"');
  });

  test("landing page renders hero, enquiry form and FAQ for crawlers", async ({ request }) => {
    const html = await (await request.get("/get-started")).text();
    expect(html).toContain("Grow your business online");
    expect(html).toContain('id="landing-form"');
    expect(html).toContain('"@type":"FAQPage"');
    const seo = await (await request.get("/get-started?service=seo")).text();
    expect(seo).toContain("Expert Search Engine Optimisation (SEO)");
  });

  test("sitemap and robots", async ({ request }) => {
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/services/website-development");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/about");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
  });
});
