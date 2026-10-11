import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": r("./src"),
      "server-only": r("./tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
    env: { NODE_ENV: "test", SESSION_SECRET: "test-secret-test-secret-test-secret-0123", ADMIN_EMAIL: "owner@example.com", ADMIN_PASSWORD: "test-only-password", ADMIN_ROLE: "owner" },
  },
});
