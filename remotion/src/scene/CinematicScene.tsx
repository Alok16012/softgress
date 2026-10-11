import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";
import { Building } from "@/components/tour/Building";
import { Campus } from "@/components/tour/Campus";
import { Lighting } from "@/components/tour/Lighting";
import { Reception, Rooftop } from "@/components/tour/Zones";

export type Vec3 = [number, number, number];
export interface CameraKey {
  /** 0..1 progress through the clip */
  at: number;
  position: Vec3;
  target: Vec3;
}

/** Frame-driven camera: deterministic per Remotion frame (no realtime controls). */
function FrameCamera({ keys, fov }: { keys: CameraKey[]; fov: number }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const get = useThree((s) => s.get);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.position)), false, "centripetal"), [keys]);
  useLayoutEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera;
    const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" });
    const pos = curve.getPointAt(p);
    // Target: piecewise interpolation between keyframes.
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].at) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const t = THREE.MathUtils.clamp((p - a.at) / Math.max(1e-6, b.at - a.at), 0, 1);
    const tgt = new THREE.Vector3(...a.target).lerp(new THREE.Vector3(...b.target), t * t * (3 - 2 * t));
    camera.fov = fov;
    camera.position.copy(pos);
    camera.lookAt(tgt);
    camera.updateProjectionMatrix();
  }, [frame, durationInFrames, curve, keys, get, fov]);
  return null;
}

export function CinematicScene({ keys, sunset = false, interior = false, fov = 50 }: { keys: CameraKey[]; sunset?: boolean; interior?: boolean; fov?: number }) {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} camera={{ fov, near: 0.1, far: 900 }}>
      <Lighting sunset={sunset} quality="high" />
      <Campus />
      <Building />
      {interior && <Reception />}
      {sunset && <Rooftop />}
      <FrameCamera keys={keys} fov={fov} />
    </ThreeCanvas>
  );
}
