import { expect, type Page, test as base } from "@playwright/test";

/** Each test gets its own client IP so rate limits don't bleed between tests. */
export const test = base.extend<{ ip: string }>({
  ip: async ({ page }, provide) => {
    const ip = `10.${rand()}.${rand()}.${rand()}`;
    await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
    await provide(ip);
  },
});
export { expect };

function rand() {
  return Math.floor(Math.random() * 250) + 1;
}

/** Open the tour. 2D view by default (fast, deterministic); pass view "3d" for WebGL. */
export async function openTour(page: Page, opts: { scene?: string; view?: "2d" | "3d"; dismissNotice?: boolean } = {}) {
  const params = new URLSearchParams();
  if (opts.scene) params.set("scene", opts.scene);
  // CI browsers have no GPU (software WebGL): the app defaults to 2D there, so 3D is forced explicitly.
  params.set("view", opts.view ?? "2d");
  if (opts.view === "3d") params.set("quality", "low"); // keep headless WebGL responsive under load
  if (opts.dismissNotice !== false) {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("sg:notice", "1");
      } catch {}
    });
  }
  await page.goto(`/?${params.toString()}`);
  await expect(page.getByRole("region", { name: "Softgress virtual headquarters tour" })).toBeVisible({ timeout: 60_000 }); // dev server may cold-compile
  // 2D view plays the pre-rendered intro (when present) on a first visit; skip it.
  if (!opts.scene && (opts.view ?? "2d") === "2d") {
    const skip = page.getByRole("button", { name: "Skip intro" });
    const shown = await skip.waitFor({ state: "visible", timeout: 4000 }).then(() => true, () => false);
    if (shown) await skip.click({ timeout: 3000 }).catch(() => {}); // the clip may end on its own first
  }
}

export async function chooseMode(page: Page, mode: "Guided tour" | "Explore freely" | "I know what I need") {
  await page.getByRole("button", { name: new RegExp(mode, "i") }).click();
}

export async function openGuide(page: Page, name: string) {
  await page.getByRole("button", { name: new RegExp(`Talk to ${name}`, "i") }).first().click();
  await expect(page.getByRole("dialog", { name: new RegExp(name) })).toBeVisible();
}

export async function sendChat(page: Page, text: string) {
  const input = page.getByLabel(/^Message /);
  await input.fill(text);
  await input.press("Enter");
}
