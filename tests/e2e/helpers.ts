import { expect, test as base } from "@playwright/test";

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
