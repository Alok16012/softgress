import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Softgress: Ideas engineered. Growth accelerated.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const mark = await readFile(join(process.cwd(), "public/brand/softgress-mark.png"), "base64");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #04060F 0%, #0A1226 55%, #172440 100%)", color: "white" }}>
        <div style={{ fontSize: 24, letterSpacing: 6, color: "#B7DFFF" }}>DIGITAL MARKETING & SOFTWARE DEVELOPMENT</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 16 }}>
          <img src={`data:image/png;base64,${mark}`} width={120} height={120} alt="" />
          <div style={{ fontSize: 120, fontWeight: 800 }}>Softgress</div>
        </div>
        <div style={{ fontSize: 44, marginTop: 8, color: "#FFFFFF" }}>Ideas engineered. Growth accelerated.</div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 26, color: "#B7DFFF" }}>Software · Marketing · Creative · AI Automation · Strategy</div>
      </div>
    ),
    size,
  );
}
