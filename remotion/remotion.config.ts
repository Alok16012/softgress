import { Config } from "@remotion/cli/config";
import path from "node:path";

// Reuse the live tour's 3D components (src/components/tour) so cinematic clips and the
// real-time camera share one art direction and their first/last frames line up.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), "@": path.resolve(process.cwd(), "../src") },
  },
}));
Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("swangle"); // software GL: works headless on any machine
Config.setConcurrency(1);

// Optional: point Remotion at a known-good Chromium (e.g. Playwright's headless shell)
// when the auto-downloaded one can't start on this machine.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
