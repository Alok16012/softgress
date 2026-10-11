import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';

export function Title({ from, to, kicker, title, subtitle, align = "left" }: { from: number; to: number; kicker?: string; title: string; subtitle?: string; align?: "left" | "center" }) {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [from, from + 18, to - 18, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [from, from + 24], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: align === "center" ? "center" : "flex-start",
        padding: "6% 7%",
        background: "linear-gradient(to top, rgba(7,17,31,0.75), rgba(7,17,31,0) 55%)",
        opacity,
        fontFamily: FONT,
        color: "white",
        textAlign: align,
      }}
    >
      <div style={{ transform: `translateY(${y}px)` }}>
        {kicker && <div style={{ letterSpacing: "0.35em", fontSize: 28, color: "#A8F0D3", fontWeight: 600 }}>{kicker}</div>}
        <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "0.02em", lineHeight: 1.05, marginTop: 10 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 46, marginTop: 14, color: "#E6FFFA" }}>{subtitle}</div>}
      </div>
    </AbsoluteFill>
  );
}

/** Small persistent label: these clips are a stylised preview, not footage. */
export function PreviewBadge() {
  return (
    <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-start", padding: 32, fontFamily: FONT }}>
      <div style={{ background: "rgba(7,17,31,0.6)", color: "#A8F0D3", padding: "8px 14px", borderRadius: 999, fontSize: 20, fontWeight: 600 }}>Virtual HQ · stylised preview</div>
    </AbsoluteFill>
  );
}
