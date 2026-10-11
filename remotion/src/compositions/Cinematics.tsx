import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { CinematicScene, type CameraKey } from "../scene/CinematicScene";
import { PreviewBadge, Title } from "./Overlays";

// Camera keys mirror the live tour (src/lib/tour/scenes.ts): the intro ends exactly on
// the campus pose, so the real-time camera can take over without a jump.
export const CAMPUS_POSE = { position: [0, 8.5, 44] as [number, number, number], target: [0, 4.2, 0] as [number, number, number] };

const INTRO_KEYS: CameraKey[] = [
  { at: 0, position: [3.5, 3.4, 158], target: [0, 3.2, 60] },
  { at: 0.45, position: [2.5, 4.2, 100], target: [0, 3.5, 30] },
  { at: 0.75, position: [1.5, 6.5, 68], target: [0, 4, 8] },
  { at: 1, position: CAMPUS_POSE.position, target: CAMPUS_POSE.target },
];

export function Intro() {
  return (
    <AbsoluteFill style={{ background: "#07111F" }}>
      <CinematicScene keys={INTRO_KEYS} />
      <Title from={20} to={250} kicker="VIRTUAL HEADQUARTERS" title="SOFTGRESS" subtitle="Ideas engineered. Growth accelerated." />
      <PreviewBadge />
    </AbsoluteFill>
  );
}

export function IntroMobile() {
  return (
    <AbsoluteFill style={{ background: "#07111F" }}>
      <CinematicScene keys={INTRO_KEYS} fov={68} />
      <Title from={20} to={250} kicker="VIRTUAL HQ" title="SOFTGRESS" subtitle="Ideas engineered. Growth accelerated." align="center" />
    </AbsoluteFill>
  );
}

const ORBIT_KEYS: CameraKey[] = Array.from({ length: 7 }, (_, i) => {
  const a = -0.9 + (i / 6) * 1.8;
  return { at: i / 6, position: [Math.sin(a) * 70, 18 - i, Math.cos(a) * 70 - 15] as [number, number, number], target: [0, 4, -15] as [number, number, number] };
});

export function CampusReveal() {
  return (
    <AbsoluteFill style={{ background: "#07111F" }}>
      <CinematicScene keys={ORBIT_KEYS} />
      <PreviewBadge />
    </AbsoluteFill>
  );
}

const DOOR_KEYS: CameraKey[] = [
  { at: 0, position: [0, 3.2, 22], target: [0, 2.2, 0] },
  { at: 0.5, position: [0, 2.4, 6], target: [0, 1.8, -6] },
  { at: 1, position: [0, 2.3, -1.4], target: [0, 1.55, -10] },
];

export function DoorTransition() {
  return (
    <AbsoluteFill style={{ background: "#07111F" }}>
      <CinematicScene keys={DOOR_KEYS} interior />
    </AbsoluteFill>
  );
}

const ROOF_KEYS: CameraKey[] = [
  { at: 0, position: [0, 3, 30], target: [0, 6, 0] },
  { at: 0.5, position: [0, 16, 14], target: [0, 9, -10] },
  { at: 1, position: [0, 11.5, -2.4], target: [3, 7.4, 40] },
];

export function RooftopFinale() {
  return (
    <AbsoluteFill style={{ background: "#07111F" }}>
      <CinematicScene keys={ROOF_KEYS} sunset />
      <Title from={90} to={180} title="Your next chapter starts here." align="center" />
    </AbsoluteFill>
  );
}

/** Pure motion-graphics title card (no WebGL): fast to render, good for socials. */
export function LogoTitle() {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 30], [0.92, 1], { easing: Easing.out(Easing.cubic), extrapolateRight: "clamp" });
  const glow = interpolate(f, [0, 60, 120], [0, 1, 0.6], { extrapolateRight: "clamp" });
  const line = interpolate(f, [15, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #0F2E3D, #07111F 70%)", alignItems: "center", justifyContent: "center", fontFamily: '"Inter", Arial, sans-serif', color: "white" }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: "0.12em", textShadow: `0 0 ${40 * glow}px rgba(41,198,192,${0.6 * glow})` }}>SOFTGRESS</div>
        <div style={{ height: 6, width: `${line * 70}%`, margin: "18px auto", background: "#29C6C0", borderRadius: 3 }} />
        <div style={{ fontSize: 48, opacity: line, color: "#A8F0D3" }}>Ideas engineered. Growth accelerated.</div>
      </div>
    </AbsoluteFill>
  );
}

export function Montage() {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={120}>
        <LogoTitle />
      </Sequence>
      <Sequence from={120} durationInFrames={270}>
        <Intro />
      </Sequence>
      <Sequence from={390} durationInFrames={120}>
        <DoorTransition />
      </Sequence>
      <Sequence from={510} durationInFrames={180}>
        <RooftopFinale />
      </Sequence>
    </AbsoluteFill>
  );
}
