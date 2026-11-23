import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
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
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // Work-page live demos are static exports in public/demos/<project>/. Files are served as they are;
      // a folder address (e.g. /demos/pushpak/admin/) falls back to that folder's index.html.
      fallback: [{ source: "/demos/:project/:path*", destination: "/demos/:project/:path*/index.html" }],
    };
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Everything except the demos must never be framed.
      { source: "/((?!demos/).*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
      // Demos are sample-data copies: keep them out of search results and let only our own /work pages frame them.
      { source: "/demos/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "X-Frame-Options", value: "SAMEORIGIN" }] },
    ];
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
