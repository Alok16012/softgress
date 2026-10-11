import { test, expect, openTour } from "./helpers";

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

test.describe("3D office (WebGL)", () => {
  test("canvas renders, intro is skippable, guided tour reaches reception", async ({ page }) => {
    test.slow();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openTour(page, { view: "3d" });
    await expect(page.locator("canvas")).toBeVisible({ timeout: 60000 });
    // The 9 s intro may already have finished on its own (it runs in wall-clock time).
    const skip = page.getByRole("button", { name: "Skip intro" });
    if (await skip.isVisible()) await skip.click().catch(() => {});
    await page.getByRole("button", { name: /Guided tour/ }).click({ timeout: 60000 });
    await expect(page.getByText(/Stop 2 of 8/)).toBeVisible();
    await page.getByRole("button", { name: "Skip animation" }).click({ timeout: 10000 }).catch(() => {});
    await expect(page.getByRole("region", { name: /In this room · Reception/ })).toBeVisible({ timeout: 30000 });
    await page.getByRole("button", { name: /Talk to Aanya, AI Receptionist/ }).click();
    await expect(page.getByRole("dialog", { name: /Aanya/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
