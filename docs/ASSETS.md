# Asset manifest & production pipeline

## Current status

**Everything in the 3D world is a procedural placeholder** generated in code
(`src/components/tour`). Nothing is a licensed or scanned model. The manifest is seeded into
`public.asset_manifest` (source of truth: `src/content/assets.ts`).

| Zone | Asset | Status | Budget (tris) |
|---|---|---|---|
| campus | terrain, lawns, plaza, road, kerbs | procedural placeholder | 20k + 8k |
| campus | trees (instanced, 3 meshes) | procedural placeholder | 1.5k each |
| campus | cars (8), walkers (5) | procedural placeholder | 2.5k / 1.5k each |
| campus | HQ shell, curtain wall, signage, canopy | procedural placeholder | 60k |
| reception | sliding doors, desk, lounge, stair, directory | procedural placeholder | 25k |
| software | 24 workstations, review corner | procedural placeholder | 4k per desk |
| marketing | video wall, analyst desks | procedural placeholder | 20k |
| creative | cyclorama, softboxes, camera, bays, brand wall | procedural placeholder | 30k |
| automation | benches, workflow wall, server rack | procedural placeholder | 25k |
| strategy | boardroom table, chairs, gallery screen | procedural placeholder | 30k |
| rooftop | deck, planters, pergola, solar array | procedural placeholder | 30k |
| all | AI guide characters (6) + extras | procedural placeholder (rig-free) | 8k each |
| campus | Remotion intro clip | original render | n/a |

Screens (code editors, dashboards, workflow board, gallery) are canvas textures drawn at
runtime. Dashboards and workflows are stamped **ILLUSTRATIVE DATA**.

## Replacing placeholders with production assets

1. **Source:** only original work or assets with a licence that allows web redistribution.
   Record `source` and `license` in `asset_manifest` for every file.
2. **Blender conventions**
   - Units: metres, scale 1.0. +Y up in three.js (Blender's +Z up is converted by the glTF
     exporter; enable *+Y Up*).
   - Origin at the object's floor contact point; furniture faces **+Z** (toward the camera
     rails), matching `rot = 0` in `Zones.tsx`.
   - World placement must match the floor plan in `docs/ARCHITECTURE.md`
     (building x −30…30, z −40…0, entrance at z = 0).
   - Names: `zone_object_variant` (e.g. `reception_desk_a`). Collision/hit proxies suffixed
     `_col` (low-poly boxes, not rendered).
   - Characters: Mixamo-compatible skeleton, clips `idle`, `talk`, `type`, `walk`, `sit`.
     `Character.tsx` keeps the same props, so a skinned GLB can drop in.
3. **Optimisation**
   - `gltf-transform optimize in.glb out.glb --texture-compress ktx2 --compress meshopt`
   - Textures ≤ 2K (1K for props), KTX2 (ETC1S for albedo, UASTC for normals).
   - Bake AO/lightmaps for static architecture (second UV set); keep dynamic shadows for
     people and the sun only.
   - LOD0/LOD1 for anything over 5k tris seen from the campus; instancing for desks,
     chairs, trees, cars.
   - **Budgets per zone:** ≤ 150 draw calls, ≤ 300k tris, ≤ 12 MB transfer; campus ≤ 20 MB.
4. **Loading:** load each zone's GLB lazily with `useGLTF` inside the zone component that
   `World.tsx` already mounts only when the visitor is nearby (`neighbours()` in
   `src/lib/tour/scenes.ts`). Preload the next guided stop.

## Cinematics

`remotion/` compositions reuse the live scene components, so a clip's last frame matches the
real-time camera pose (`INTRO_KEYS` end on `SCENES.campus.pose`). Render with
`pnpm media:render`; the browser loads only the pre-rendered MP4/WebM, never Remotion.
If the auto-downloaded headless Chrome fails on your machine, set
`REMOTION_BROWSER=/path/to/chrome-headless-shell` (Playwright's works).
