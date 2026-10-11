import { test, expect, openTour, chooseMode } from "./helpers";

test.describe("tour navigation", () => {
  test("first visit: entry choice offers all three modes and never gates content", async ({ page }) => {
    await openTour(page);
    await expect(page.getByRole("heading", { name: "How would you like to visit?" })).toBeVisible();
    for (const m of ["Guided tour", "Explore freely", "I know what I need"]) {
      await expect(page.getByRole("button", { name: new RegExp(m) })).toBeVisible();
    }
    // Semantic content is present below the tour regardless.
    await expect(page.locator("#directory").getByRole("heading", { name: "Software Development", exact: true })).toBeAttached();
  });

  test("guided tour steps forward/back and shows captions", async ({ page }) => {
    await openTour(page);
    await chooseMode(page, "Guided tour");
    await expect(page.getByText(/Stop 2 of 8/)).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "This is reception" })).toBeVisible();
    await page.getByRole("button", { name: "Next stop" }).click();
    await expect(page.getByText(/Stop 3 of 8/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Software Development", level: 2 }).first()).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(/Stop 4 of 8/)).toBeVisible();
    await page.getByRole("button", { name: "Previous stop" }).click();
    await expect(page.getByText(/Stop 3 of 8/)).toBeVisible();
  });

  test("I know what I need: search finds services in Hinglish and walks to the department", async ({ page }) => {
    await openTour(page);
    await chooseMode(page, "I know what I need");
    const dialog = page.getByRole("dialog", { name: "What do you need?" });
    await dialog.getByLabel("Search services").fill("dukaan");
    await expect(dialog.getByRole("heading", { name: "E-commerce Development" })).toBeVisible();
    await dialog.getByRole("button", { name: "Visit department" }).first().click();
    await expect(page).toHaveURL(/scene=software/);
  });

  test("back/forward walks the tour history and deep links reload into the room", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await page.getByRole("navigation", { name: "Rooms" }).getByRole("button", { name: "Software Development" }).click();
    await expect(page).toHaveURL(/scene=software/);
    await page.getByRole("navigation", { name: "Rooms" }).getByRole("button", { name: "Digital Marketing" }).click();
    await expect(page).toHaveURL(/scene=marketing/);
    await page.goBack();
    await expect(page).toHaveURL(/scene=software/);
    await expect(page.getByRole("heading", { name: "Software Development", level: 2 }).first()).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/scene=marketing/);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Digital Marketing", level: 2 }).first()).toBeVisible();
  });

  test("scene map and keyboard shortcuts work without a mouse", async ({ page }) => {
    await openTour(page, { scene: "reception" });
    await page.keyboard.press("m");
    const map = page.getByRole("region", { name: "Scene map" });
    await expect(map).toBeVisible();
    await map.getByRole("button", { name: /Go to AI & Automation Lab/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/scene=automation/);
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog", { name: "What do you need?" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "What do you need?" })).toBeHidden();
  });

  test("skip link reaches the regular page", async ({ page }) => {
    // Inside a room focus rests on the tour region; the skip link sits just before it.
    await openTour(page, { scene: "reception" });
    await expect(page.getByRole("region", { name: "Softgress virtual headquarters tour" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("link", { name: "Skip the 3D tour" })).toBeFocused();
  });

  test("interactive panels: workflow demo runs with synthetic data", async ({ page }) => {
    await openTour(page, { scene: "automation" });
    await page.getByRole("button", { name: /Workflow board/ }).click();
    const d = page.getByRole("dialog", { name: /Lead-routing workflow/ });
    await expect(d.getByText(/All data is synthetic/)).toBeVisible();
    await d.getByRole("button", { name: "Run demo" }).click();
    await expect(d.getByText(/Added to tomorrow's summary/)).toBeVisible({ timeout: 15000 });
  });

  test("gallery labels sample work as samples", async ({ page }) => {
    await openTour(page, { scene: "strategy" });
    await page.getByRole("button", { name: /Project gallery/ }).click();
    const d = page.getByRole("dialog", { name: "Project gallery" });
    await expect(d.getByText("SAMPLE CONCEPT").first()).toBeVisible();
  });

  test("@mobile 2D navigator works on a phone", async ({ page }) => {
    await openTour(page, { scene: "marketing" });
    await expect(page.getByRole("heading", { name: "Digital Marketing", level: 2 }).first()).toBeVisible();
    await page.getByRole("button", { name: /Talk to Meera/ }).first().click();
    await expect(page.getByRole("dialog", { name: /Meera/ })).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("skips the cinematic intro", async ({ page }) => {
    await openTour(page, { view: "3d" });
    await expect(page.getByRole("heading", { name: "How would you like to visit?" })).toBeVisible({ timeout: 60000 });
    await expect(page.getByRole("button", { name: "Skip intro" })).toHaveCount(0);
  });
});
