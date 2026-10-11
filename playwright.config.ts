import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1366, height: 860 },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: `${baseURL}/api/health`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      PGLITE_DATA_DIR: ".data/pglite-e2e",
      SITE_URL: baseURL,
      AI_PROVIDER: "demo",
      CALENDAR_PROVIDER: "mock",
      NOTIFY_PROVIDER: "console",
      ADMIN_EMAIL: "owner@e2e.test",
      ADMIN_PASSWORD: "e2e-only-password",
      ADMIN_ROLE: "owner",
      EXTRA_ADMINS: "",
    },
  },
});
