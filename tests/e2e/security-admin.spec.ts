import { test, expect } from "./helpers";

const origin = "http://localhost:3100";

test.describe("API security", () => {
  test("rejects cross-origin writes", async ({ request }) => {
    const r = await request.post("/api/leads", { headers: { origin: "https://evil.example" }, data: {} });
    expect(r.status()).toBe(403);
    const c = await request.post("/api/chat", { headers: { origin: "https://evil.example" }, data: {} });
    expect(c.status()).toBe(403);
  });

  test("rate limits lead submissions per client", async ({ request }) => {
    const headers = { origin, "x-forwarded-for": `10.200.${Math.floor(Math.random() * 200)}.7` };
    const statuses: number[] = [];
    for (let i = 0; i < 8; i++) statuses.push((await request.post("/api/leads", { headers, data: { bad: true } })).status());
    expect(statuses.slice(0, 6).every((s) => s === 422)).toBe(true);
    expect(statuses.slice(6)).toEqual([429, 429]);
  });

  test("validates chat payloads", async ({ request }) => {
    const r = await request.post("/api/chat", { headers: { origin }, data: { sessionId: "nope", staffId: "x", messages: [] } });
    expect(r.status()).toBe(422);
  });

  test("health endpoint exposes configuration but no secrets", async ({ request }) => {
    const r = await request.get("/api/health");
    const text = await r.text();
    expect(r.status()).toBe(200);
    expect(text).not.toMatch(/e2e-only-password|sk-ant|SESSION_SECRET/);
    expect(JSON.parse(text).ai.mode).toBe("demo");
  });

  test("admin data is not reachable without a session", async ({ request, page }) => {
    expect((await request.get("/api/admin/export")).status()).toBe(401);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("admin CRM", () => {
  test("owner signs in, finds the lead, changes stage, adds a note, exports CSV", async ({ page, request }) => {
    const email = `crm+${Date.now()}@example.com`;
    const sub = await request.post("/api/leads", {
      headers: { origin, "x-forwarded-for": "10.77.1.1" },
      data: {
        idempotencyKey: crypto.randomUUID(),
        kind: "quote",
        contact: { name: "CRM Lead", email, phone: "", preferredChannel: "email" },
        consent: { contact: true },
        brief: { serviceSlugs: ["ecommerce-development"], projectType: "Online store" },
        elapsedMs: 5000,
      },
    });
    const { reference } = await sub.json();

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("owner@e2e.test");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
    await page.getByLabel("Password").fill("e2e-only-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Lead inbox" })).toBeVisible();

    await page.getByPlaceholder("Name, email or reference").fill(reference);
    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("link", { name: "CRM Lead" }).click();
    await expect(page.getByRole("heading", { name: "CRM Lead" })).toBeVisible();
    await expect(page.getByRole("heading", { name: new RegExp(reference) })).toBeVisible();

    await page.getByLabel("Stage").first().selectOption("qualified");
    await page.getByLabel("Add note").fill("Called, wants Shopify.");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByText("Called, wants Shopify.").last()).toBeVisible();
    await page.getByRole("button", { name: "Generate AI summary" }).click();
    await expect(page.getByText(/Template summary \(no AI model connected\)/)).toBeVisible();

    await page.goto("/admin/audit");
    await expect(page.getByText("lead.stage").first()).toBeVisible();
    const csv = await page.request.get("/api/admin/export");
    expect(csv.status()).toBe(200);
    expect(await csv.text()).toContain(reference);
  });

  test("published price flows from the catalogue to the site; custom never shows an amount", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("owner@e2e.test");
    await page.getByLabel("Password").fill("e2e-only-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Lead inbox" })).toBeVisible();
    await page.goto("/admin/services");
    const row = page.locator("li").filter({ hasText: "/services/graphic-design" });
    await row.getByLabel("Pricing").selectOption("starting_at");
    await row.getByLabel("Amount").fill("15000");
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByText("Service saved.")).toBeVisible();
    await page.goto("/services/graphic-design");
    await expect(page.getByText(/From ₹15,000 \(published starting price\)/)).toBeVisible();
    // Revert so other runs see the default.
    await page.goto("/admin/services");
    await row.getByLabel("Pricing").selectOption("custom");
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByText("Service saved.")).toBeVisible();
    await page.goto("/services/graphic-design");
    await expect(page.getByText("Custom quote required")).toBeVisible();
  });
});
