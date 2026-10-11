import { test, expect, openTour, openGuide, sendChat } from "./helpers";

test.describe("AI guide chat", () => {
  test("receptionist answers a Hinglish e-commerce request, suggests brief fields and routes to Software", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await openGuide(page, "Aanya");
    const chat = page.getByRole("dialog", { name: /Aanya/ });
    await expect(chat.getByText(/AI guide/).first()).toBeVisible();
    await expect(chat.getByText(/Demo mode: no AI model is connected/)).toBeVisible();
    await sendChat(page, "Mujhe apni dukaan ke liye ecommerce website banwani hai, budget 3 lakh");
    await expect(chat.getByText(/Software Development team/)).toBeVisible();
    await expect(chat.getByText("Suggested for your brief")).toBeVisible();
    await chat.getByRole("button", { name: "Apply to brief" }).click();
    await expect(chat.getByText(/Applied to your brief/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Project brief, \d+ details/ })).toBeVisible();
    // Explicit cross-department routing
    await chat.getByRole("button", { name: /Go to Software and talk to Kabir/ }).click();
    const kabir = page.getByRole("dialog", { name: /Kabir/ });
    await expect(kabir).toBeVisible();
    // Handoff consent before sharing the brief
    await expect(kabir.getByText(/Share your brief with Kabir/)).toBeVisible();
    await kabir.getByRole("button", { name: "Share brief" }).click();
    await expect(kabir.getByText(/You shared your brief with Kabir/)).toBeVisible();
  });

  test("conversation persists while navigating between departments", async ({ page }) => {
    await openTour(page, { scene: "software" });
    await openGuide(page, "Kabir");
    await sendChat(page, "Can you build a React Native app?");
    await expect(page.getByRole("dialog", { name: /Kabir/ }).getByText(/Mobile App Development/)).toBeVisible();
    await page.getByRole("button", { name: "Close chat (your conversation is kept)" }).click();
    await page.getByRole("navigation", { name: "Rooms" }).getByRole("button", { name: "AI & Automation Lab" }).click();
    await openGuide(page, "Ira");
    await page.getByRole("navigation", { name: "Rooms" }).getByRole("button", { name: "Software Development" }).click();
    await openGuide(page, "Kabir");
    await expect(page.getByRole("dialog", { name: /Kabir/ }).getByText("Can you build a React Native app?")).toBeVisible();
  });

  test("price and guarantee questions never get invented numbers", async ({ page }) => {
    await openTour(page, { scene: "marketing" });
    await openGuide(page, "Meera");
    await sendChat(page, "How much does SEO cost and can you guarantee first page ranking?");
    const chat = page.getByRole("dialog", { name: /Meera/ });
    await expect(chat.getByText(/guarantee/i).last()).toBeVisible();
    const text = await chat.locator("ol").innerText();
    expect(text).not.toMatch(/₹\s?\d|\bRs\.?\s?\d|\bINR\s?\d/);
  });

  test("network failure shows an honest error with retry", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await openGuide(page, "Aanya");
    await page.route("**/api/chat", (r) => r.abort("failed"));
    await sendChat(page, "hello");
    const chat = page.getByRole("dialog", { name: /Aanya/ });
    await expect(chat.getByRole("alert")).toContainText(/Connection problem/);
    await page.unroute("**/api/chat");
    await chat.getByRole("button", { name: "Retry" }).click();
    await expect(chat.getByRole("alert")).toHaveCount(0);
    await expect(chat.locator("ol li").last()).not.toContainText("Thinking", { timeout: 20000 });
  });

  test("server errors and rate limits are shown, not hidden", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await openGuide(page, "Aanya");
    await page.route("**/api/chat", (r) => r.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, error: { code: "rate_limited", message: "You're sending messages quickly. Please wait a moment." } }) }));
    await sendChat(page, "hi");
    await expect(page.getByRole("dialog", { name: /Aanya/ }).getByRole("alert")).toContainText("sending messages quickly");
  });

  test("visitor text is rendered as text, never HTML", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await openGuide(page, "Aanya");
    let fired = false;
    page.on("dialog", async (d) => {
      fired = true;
      await d.dismiss();
    });
    await sendChat(page, `<img src=x onerror="alert(1)"> hello`);
    await expect(page.getByRole("dialog", { name: /Aanya/ }).getByText(`<img src=x onerror="alert(1)"> hello`)).toBeVisible();
    expect(fired).toBe(false);
  });

  test("privacy reset clears chats and the draft brief", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await openGuide(page, "Aanya");
    await sendChat(page, "Privacy reset probe message");
    await expect(page.getByRole("dialog", { name: /Aanya/ }).getByText("Privacy reset probe message")).toBeVisible();
    await page.getByRole("button", { name: "Close chat (your conversation is kept)" }).click();
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: /Reset session/ }).click();
    await expect(page.getByText(/Local data and server session metadata were deleted/)).toBeVisible();
    await page.keyboard.press("Escape");
    await openGuide(page, "Aanya");
    await expect(page.getByRole("dialog", { name: /Aanya/ }).getByText("Privacy reset probe message")).toHaveCount(0);
  });
});
