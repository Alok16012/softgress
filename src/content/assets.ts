// Asset manifest. Everything in the current build is a procedural placeholder
// generated in code (src/components/tour). Replace entries with licensed/original GLB
// assets following docs/ASSETS.md; update status/source/license when you do.
export interface AssetEntry {
  id: string;
  zone: string;
  name: string;
  kind: "environment" | "architecture" | "furniture" | "character" | "prop" | "screen" | "vehicle" | "video";
  status: "procedural_placeholder" | "licensed" | "original" | "pending";
  source: string;
  license: string;
  url: string | null;
  triangleBudget: number | null;
  notes: string;
}

const P = (
  id: string,
  zone: string,
  name: string,
  kind: AssetEntry["kind"],
  triangleBudget: number,
  notes = "",
): AssetEntry => ({
  id,
  zone,
  name,
  kind,
  status: "procedural_placeholder",
  source: "Procedural geometry in src/components/tour",
  license: "Original code (project licence)",
  url: null,
  triangleBudget,
  notes,
});

export const assetManifest: AssetEntry[] = [
  P("campus-terrain", "campus", "Terrain, lawns and plaza", "environment", 20000, "Replace with sculpted terrain + baked AO"),
  P("campus-road", "campus", "Access road, kerbs, markings", "environment", 8000),
  P("campus-trees", "campus", "Trees (instanced, 2 LODs)", "environment", 1500, "Per-instance budget"),
  P("campus-vehicles", "campus", "Cars (instanced, low-poly)", "vehicle", 2500, "Per-vehicle budget"),
  P("campus-walkers", "campus", "Passers-by (low-poly)", "character", 1500, "Per-character budget"),
  P("hq-shell", "campus", "HQ building shell, curtain wall, signage", "architecture", 60000),
  P("hq-doors", "reception", "Automatic sliding glass doors", "architecture", 2000),
  P("reception-desk", "reception", "Reception desk, seating, directory", "furniture", 25000),
  P("office-desks", "software", "Desk clusters, chairs, monitors", "furniture", 4000, "Per workstation, instanced"),
  P("marketing-wall", "marketing", "Command video wall + analyst desks", "screen", 20000),
  P("studio-rig", "creative", "Photo/video set, light stands, softboxes, camera", "prop", 30000),
  P("lab-benches", "automation", "Lab benches, workflow wall", "furniture", 25000),
  P("boardroom", "strategy", "Boardroom table, chairs, gallery screen", "furniture", 30000),
  P("rooftop", "rooftop", "Rooftop terrace, planters, railings", "architecture", 30000),
  P("ai-guides", "all", "AI guide characters (6)", "character", 8000, "Per character; rig with Mixamo-compatible skeleton when replaced"),
  {
    id: "intro-video",
    zone: "campus",
    name: "Cinematic intro (Remotion)",
    kind: "video",
    status: "original",
    source: "remotion/src/compositions/Intro.tsx",
    license: "Original (project licence)",
    url: "/media/intro.mp4",
    triangleBudget: null,
    notes: "Rendered ahead of time with `pnpm --filter remotion render:intro`. Optional fallback.",
  },
];
