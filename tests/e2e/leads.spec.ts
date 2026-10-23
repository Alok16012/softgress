import type { Page } from "@playwright/test";
import { test, expect } from "./helpers";

/** The request form lives inline on /contact. */
const form = (page: Page) => page.locator("main");

async function fillContact(page: Page, opts: { email?: string; consent?: boolean } = {}) {
  const d = form(page);
  await d.getByLabel("Your name *").fill("E2E Visitor");
  await d.getByLabel("Email").fill(opts.email ?? `visitor+${Date.now()}@example.com`);
  if (opts.consent !== false) await d.getByLabel(/I agree that Softgress may contact me/).check();
  return d;
}

async function startRequest(page: Page, kind: RegExp) {
  // /contact opens on the quick enquiry tab; ?form=project opens the full request flow.
  await page.goto("/contact?form=project");
  const d = form(page);
  await d.getByRole("radio", { name: kind }).click();
  await d.getByRole("button", { name: "Continue" }).click();
  return d;
}

test.describe("lead capture", () => {
  test("quote request: edit brief, consent, submit, reference shown; duplicate submit replays", async ({ page }) => {
    await page.goto("/services/ecommerce-development");
    await page.locator("main").getByRole("link", { name: /Request a quote/ }).click();
    await expect(page).toHaveURL(/\/contact\?service=ecommerce-development/);
    const d = form(page);
    await d.getByRole("radio", { name: /Request a quote/ }).click();
    await d.getByRole("button", { name: "Continue" }).click();
    await expect(d.getByRole("button", { name: "E-commerce Development" })).toHaveAttribute("aria-pressed", "true");
    await d.getByLabel("Goals").fill("Sell handmade products online");
    await d.getByRole("button", { name: "Continue" }).click();
    await fillContact(page);
    await page.waitForTimeout(2600); // human-speed submission (time trap is 2.5s)
    const [resp] = await Promise.all([page.waitForResponse("**/api/leads"), d.getByRole("button", { name: "Submit quote request" }).click()]);
    expect(resp.status()).toBe(201);
    await expect(d.getByTestId("reference-code")).toHaveText(/^SG-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    await expect(d.getByText(/not a contract or payment/)).toBeVisible();
    // Replaying the same idempotency key returns the same reference, not a new lead.
    const body = resp.request().postDataJSON();
    const replay = await page.request.post("/api/leads", { data: body, headers: { origin: new URL(page.url()).origin } });
    expect(replay.status()).toBe(200);
    expect((await replay.json()).reference).toBe((await resp.json()).reference);
  });

  test("validation: missing consent and invalid email are blocked with clear messages", async ({ page }) => {
    const d = await startRequest(page, /Request a callback/);
    await d.getByRole("button", { name: "Continue" }).click();
    await fillContact(page, { email: "not-an-email", consent: false });
    await d.getByLabel("Preferred reply channel").selectOption("email");
    await d.getByRole("button", { name: /Submit callback request/ }).click();
    await expect(d.getByText("Please confirm we may contact you about this request")).toBeVisible();
    await d.getByLabel(/I agree that Softgress may contact me/).check();
    await page.waitForTimeout(2600);
    await d.getByRole("button", { name: /Submit callback request/ }).click();
    await expect(d.getByText("Enter a valid email address")).toBeVisible();
    await expect(d.getByTestId("reference-code")).toHaveCount(0);
  });

  test("consultation with the dev mock calendar books a real slot (badged as development)", async ({ page }) => {
    const d = await startRequest(page, /Book a consultation/);
    await d.getByRole("button", { name: "Continue" }).click();
    await expect(d.getByText("Mock calendar · development only")).toBeVisible();
    await d.getByRole("radiogroup", { name: "Available slots" }).getByRole("radio").first().click();
    await d.getByRole("button", { name: "Continue" }).click();
    await fillContact(page);
    await page.waitForTimeout(2600);
    await d.getByRole("button", { name: /Submit consultation request/ }).click();
    await expect(d.getByText(/Consultation/)).toContainText("confirmed");
    await expect(d.getByText(/no real calendar invite is sent/)).toBeVisible();
  });

  test("unconfigured calendar → preferred time saved as pending confirmation", async ({ page }) => {
    await page.route("**/api/consultations/slots", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, connected: false, slots: [] }) }));
    const d = await startRequest(page, /Book a consultation/);
    await d.getByRole("button", { name: "Continue" }).click();
    await expect(d.getByText(/Live booking isn't connected/)).toBeVisible();
    const day = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
    await d.getByLabel("Preferred date").fill(day);
    await d.getByRole("button", { name: "Continue" }).click();
    await fillContact(page);
    await page.waitForTimeout(2600);
    await d.getByRole("button", { name: /Submit consultation request/ }).click();
    await expect(d.getByText(/pending confirmation/)).toBeVisible();
    await expect(d.getByText(/isn't booked yet/)).toBeVisible();
  });

  test("database/save failure never shows a false success", async ({ page }) => {
    await page.route("**/api/leads", (r) => r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "save_failed", message: "We couldn't save your request. Nothing was submitted, so please try again." } }) }));
    const d = await startRequest(page, /Submit project brief/);
    await d.getByRole("button", { name: "Continue" }).click();
    await fillContact(page);
    await page.waitForTimeout(2600);
    await d.getByRole("button", { name: /Submit brief/ }).click();
    await expect(d.getByRole("alert")).toContainText("Nothing was submitted");
    await expect(d.getByTestId("reference-code")).toHaveCount(0);
  });

  test("WhatsApp is hidden when not configured", async ({ page }) => {
    const d = await startRequest(page, /Request a callback/);
    await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toHaveCount(0);
    await d.getByRole("button", { name: "Continue" }).click();
    await expect(d.getByLabel("Preferred reply channel").locator("option", { hasText: "WhatsApp" })).toHaveCount(0);
  });

  test("status lookup needs a one-time code (dev outbox) and reveals nothing without it", async ({ page, request }) => {
    const origin = "http://localhost:3100";
    const email = `status+${Date.now()}@example.com`;
    const sub = await request.post("/api/leads", {
      headers: { origin, "x-forwarded-for": "10.9.9.9" },
      data: {
        idempotencyKey: crypto.randomUUID(),
        kind: "brief",
        contact: { name: "Status Tester", email, phone: "", preferredChannel: "email" },
        consent: { contact: true },
        brief: { serviceSlugs: ["seo"] },
        elapsedMs: 5000,
      },
    });
    expect(sub.status()).toBe(201);
    const { reference } = await sub.json();

    // Wrong contact → identical generic response (no enumeration).
    const wrong = await request.post("/api/status/request-code", { headers: { origin }, data: { reference, contact: "someone@else.com" } });
    expect((await wrong.json()).message).toMatch(/If those details match/);

    await page.goto("/status");
    await page.getByLabel("Reference code").fill(reference);
    await page.getByLabel(/Email or phone/).fill(email);
    await page.getByRole("button", { name: "Send verification code" }).click();
    await expect(page.getByLabel("6-digit code")).toBeVisible();
    const verifyBad = await request.post("/api/status/verify", { headers: { origin }, data: { reference, code: "000000" } });
    expect(verifyBad.status()).toBe(401);

    await page.goto("/dev/outbox");
    const item = page.getByTestId("outbox-item").filter({ hasText: reference }).filter({ hasText: "status code" }).first();
    const code = (await item.innerText()).match(/code (\d{6})/)![1];
    const ok = await request.post("/api/status/verify", { headers: { origin }, data: { reference, code } });
    expect(ok.status()).toBe(200);
    expect((await ok.json()).status.reference).toBe(reference);
    // Codes are single-use.
    expect((await request.post("/api/status/verify", { headers: { origin }, data: { reference, code } })).status()).toBe(401);
  });

  test("quick enquiry: validates, submits and shows a reference code", async ({ page }) => {
    await page.goto("/contact");
    const d = form(page);
    await expect(d.getByRole("tab", { name: /Quick enquiry/ })).toHaveAttribute("aria-selected", "true");
    await d.getByRole("button", { name: /Send enquiry/ }).click();
    await expect(d.getByText("Please enter your name")).toBeVisible();
    await d.getByLabel("Full name *").fill("Enquiry Visitor");
    await d.getByLabel("Phone / WhatsApp number *").fill("+91 98765 43210");
    await d.getByLabel("I'm interested in").selectOption("seo");
    await d.getByLabel("Your enquiry *").fill("We need SEO for our clinic website in Pune.");
    await d.getByLabel(/I agree that Softgress may contact me about this enquiry/).check();
    await page.waitForTimeout(2600); // the server rejects forms filled faster than a person could
    await d.getByRole("button", { name: /Send enquiry/ }).click();
    await expect(d.getByTestId("enquiry-reference")).toHaveText(/^SG-/);
  });

  test("quick enquiry payload is accepted by the leads API", async ({ request }) => {
    const res = await request.post("/api/leads", {
      headers: { origin: "http://localhost:3100", "x-forwarded-for": "10.9.9.10" },
      data: {
        idempotencyKey: crypto.randomUUID(),
        kind: "brief",
        contact: { name: "API Enquiry", email: "", phone: "+91 98765 43210", preferredChannel: "phone" },
        consent: { contact: true, marketing: false },
        brief: { projectType: "Website enquiry", serviceSlugs: ["seo"], notes: "Need SEO for a clinic website." },
        primaryServiceSlug: "seo",
        website: "",
        elapsedMs: 5000,
      },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).reference).toBeTruthy();
  });

  test("contact page preselects kind and service from the URL", async ({ page }) => {
    await page.goto("/contact?kind=brief&service=ui-ux-design");
    await expect(page.getByRole("heading", { name: "Start a project" })).toBeVisible();
    await expect(page.getByRole("button", { name: "UI/UX Design" })).toHaveAttribute("aria-pressed", "true");
  });
});
