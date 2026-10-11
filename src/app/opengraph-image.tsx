import { ImageResponse } from "next/og";

export const alt = "Softgress Virtual HQ: Ideas engineered. Growth accelerated.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #07111F 0%, #0C2A3A 60%, #145E5B 100%)", color: "white" }}>
        <div style={{ fontSize: 28, letterSpacing: 10, color: "#A8F0D3" }}>VIRTUAL HEADQUARTERS</div>
        <div style={{ fontSize: 120, fontWeight: 800, marginTop: 16 }}>SOFTGRESS</div>
        <div style={{ fontSize: 44, marginTop: 8, color: "#E6FFFA" }}>Ideas engineered. Growth accelerated.</div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 26, color: "#29C6C0" }}>Software · Marketing · Creative · AI Automation · Strategy</div>
      </div>
    ),
    size,
  );
}
