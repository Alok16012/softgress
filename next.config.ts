import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Always put <title>, description and canonical in <head> (no streamed metadata), so
  // AI crawlers and other bots that read only the initial HTML see them.
  htmlLimitedBots: /.*/,
  // Lets an isolated E2E server run next to the dev server.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Embedded Postgres (WASM) and the Postgres driver must stay as runtime Node modules.
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  outputFileTracingIncludes: { "/**": ["./supabase/**/*.sql"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
