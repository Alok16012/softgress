"use client";
import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import * as THREE from "three";
import { M, colorMat, screenMat } from "./materials";
import { codeScreenTexture, dashboardTexture, designTexture } from "./textures";

type V3 = [number, number, number];

/** Box positioned by its centre. Shadows on by default for solid architecture. */
export function B({
  p,
  s,
  m,
  r,
  cast = true,
  receive = true,
  children,
}: {
  p: V3;
  s: V3;
  m: THREE.Material;
  r?: V3;
  cast?: boolean;
  receive?: boolean;
  children?: ReactNode;
}) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={s} />
      {children}
    </mesh>
  );
}

/** Box from min/max corners (handy for walls). */
export function Slab({ min, max, m, cast = true }: { min: V3; max: V3; m: THREE.Material; cast?: boolean }) {
  const s: V3 = [Math.abs(max[0] - min[0]), Math.abs(max[1] - min[1]), Math.abs(max[2] - min[2])];
  const p: V3 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  return <B p={p} s={s} m={m} cast={cast} />;
}

export function Chair({ p, rot = 0, color = "#2B3036" }: { p: V3; rot?: number; color?: string }) {
  const m = M();
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.03} position={[0, 0.48, 0]} material={colorMat(color, 0.9)} castShadow />
      <RoundedBox args={[0.48, 0.55, 0.06]} radius={0.03} position={[0, 0.8, -0.23]} rotation={[-0.08, 0, 0]} material={colorMat(color, 0.9)} castShadow />
      <B p={[0, 0.26, 0]} s={[0.05, 0.42, 0.05]} m={m.chrome} />
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} p={[Math.cos((i / 5) * Math.PI * 2) * 0.2, 0.04, Math.sin((i / 5) * Math.PI * 2) * 0.2]} s={[0.06, 0.04, 0.06]} m={m.black} cast={false} />
      ))}
    </group>
  );
}

export function Monitor({
  p,
  rot = 0,
  kind = "code",
  seed = 1,
  w = 0.62,
}: {
  p: V3;
  rot?: number;
  kind?: "code" | "seo" | "ads" | "social" | "funnel" | "design" | "off";
  seed?: number;
  w?: number;
}) {
  const m = M();
  const h = w * 0.6;
  const mat =
    kind === "off"
      ? m.screenOff
      : kind === "code"
        ? screenMat(`code${seed % 6}`, codeScreenTexture(seed % 6))
        : kind === "design"
          ? screenMat(`design${seed % 4}`, designTexture(seed % 4))
          : screenMat(`${kind}${seed % 3}`, dashboardTexture(kind, seed % 3));
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <B p={[0, 0.02, 0]} s={[0.22, 0.02, 0.16]} m={m.metalDark} />
      <B p={[0, 0.16, -0.02]} s={[0.04, 0.28, 0.03]} m={m.metalDark} />
      <B p={[0, 0.3 + h / 2, 0]} s={[w + 0.03, h + 0.03, 0.03]} m={m.black} />
      <mesh position={[0, 0.3 + h / 2, 0.017]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

export function Desk({ p, rot = 0, w = 1.6, d = 0.8, wood = true }: { p: V3; rot?: number; w?: number; d?: number; wood?: boolean }) {
  const m = M();
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <B p={[0, 0.735, 0]} s={[w, 0.04, d]} m={wood ? m.wood : m.white} />
      <B p={[-w / 2 + 0.05, 0.36, 0]} s={[0.05, 0.72, d - 0.1]} m={m.metal} />
      <B p={[w / 2 - 0.05, 0.36, 0]} s={[0.05, 0.72, d - 0.1]} m={m.metal} />
      <B p={[0, 0.5, -d / 2 + 0.03]} s={[w - 0.1, 0.3, 0.02]} m={m.metalDark} cast={false} />
    </group>
  );
}

/** A full workstation: desk, chair, 1–2 monitors, keyboard. */
export function Workstation({
  p,
  rot = 0,
  kind = "code",
  seed = 1,
  dual = false,
}: {
  p: V3;
  rot?: number;
  kind?: "code" | "seo" | "ads" | "social" | "funnel" | "design" | "off";
  seed?: number;
  dual?: boolean;
}) {
  const m = M();
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <Desk p={[0, 0, 0]} />
      {dual ? (
        <>
          <Monitor p={[-0.34, 0.755, -0.18]} rot={0.18} kind={kind} seed={seed} w={0.58} />
          <Monitor p={[0.34, 0.755, -0.18]} rot={-0.18} kind={kind === "code" ? "design" : kind} seed={seed + 1} w={0.58} />
        </>
      ) : (
        <Monitor p={[0, 0.755, -0.2]} kind={kind} seed={seed} />
      )}
      <B p={[0, 0.765, 0.12]} s={[0.44, 0.015, 0.14]} m={m.metalDark} cast={false} />
      <B p={[0.34, 0.765, 0.14]} s={[0.07, 0.02, 0.11]} m={m.black} cast={false} />
      <Chair p={[0, 0, 0.62]} rot={Math.PI} />
    </group>
  );
}

export function Plant({ p, s = 1, kind = "tall" }: { p: V3; s?: number; kind?: "tall" | "bush" }) {
  const m = M();
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.25, 0]} material={m.terracotta} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.17, 0.5, 18]} />
      </mesh>
      <B p={[0, 0.49, 0]} s={[0.36, 0.02, 0.36]} m={m.soil} cast={false} />
      {kind === "tall" ? (
        <>
          <mesh position={[0, 0.9, 0]} material={m.bark}>
            <cylinderGeometry args={[0.02, 0.03, 0.8, 6]} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.sin(i * 1.3) * 0.18, 1.0 + i * 0.16, Math.cos(i * 1.3) * 0.18]} material={m.foliage} castShadow>
              <icosahedronGeometry args={[0.24 - i * 0.02, 1]} />
            </mesh>
          ))}
        </>
      ) : (
        <mesh position={[0, 0.78, 0]} material={m.foliage} castShadow>
          <icosahedronGeometry args={[0.36, 1]} />
        </mesh>
      )}
    </group>
  );
}

export function Sofa({ p, rot = 0, color = "#5B6B73", w = 2.0 }: { p: V3; rot?: number; color?: string; w?: number }) {
  const mat = colorMat(color, 0.95);
  const m = M();
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <RoundedBox args={[w, 0.4, 0.9]} radius={0.08} position={[0, 0.3, 0]} material={mat} castShadow receiveShadow />
      <RoundedBox args={[w, 0.5, 0.22]} radius={0.08} position={[0, 0.65, -0.34]} material={mat} castShadow />
      <RoundedBox args={[0.22, 0.32, 0.9]} radius={0.08} position={[-w / 2 + 0.11, 0.6, 0]} material={mat} castShadow />
      <RoundedBox args={[0.22, 0.32, 0.9]} radius={0.08} position={[w / 2 - 0.11, 0.6, 0]} material={mat} castShadow />
      {[-w / 2 + 0.15, w / 2 - 0.15].map((x) => (
        <B key={x} p={[x, 0.05, 0.3]} s={[0.05, 0.1, 0.05]} m={m.metalDark} cast={false} />
      ))}
    </group>
  );
}

/** Wall-mounted or free-standing display with any material. */
export function Screen({ p, rot = [0, 0, 0], w, h, mat, frame = 0.04 }: { p: V3; rot?: V3; w: number; h: number; mat: THREE.Material; frame?: number }) {
  const m = M();
  return (
    <group position={p} rotation={rot}>
      <B p={[0, 0, -0.03]} s={[w + frame * 2, h + frame * 2, 0.05]} m={m.black} />
      <mesh position={[0, 0, 0.0]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

/** Recessed ceiling light panels on a grid (emissive; cheap). */
export function CeilingLights({ x0, x1, z0, z1, y, step = 3.2 }: { x0: number; x1: number; z0: number; z1: number; y: number; step?: number }) {
  const m = M();
  const items: V3[] = [];
  for (let x = x0 + step / 2; x < x1; x += step) for (let z = z0 + step / 2; z < z1; z += step) items.push([x, y - 0.02, z]);
  return (
    <group>
      {items.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} material={m.lightPanel}>
          <planeGeometry args={[1.2, 0.6]} />
        </mesh>
      ))}
    </group>
  );
}
