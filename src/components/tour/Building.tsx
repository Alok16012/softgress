"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactElement } from "react";
import * as THREE from "three";
import { M } from "./materials";
import { B, CeilingLights, Slab } from "./primitives";
import { signTexture } from "./textures";

type V3 = [number, number, number];
const T = 0.2; // wall thickness
const H1 = 4.5; // ground floor ceiling
const H2 = 9; // roof

type Door = { c: number; w: number; h: number };

/** Wall along Z at fixed x, from z0 to z1 (z0 > z1), with door openings. */
function WallX({ x, z0, z1, h, doors = [], m, y0 = 0 }: { x: number; z0: number; z1: number; h: number; doors?: Door[]; m: THREE.Material; y0?: number }) {
  const segs: ReactElement[] = [];
  let cur = z0;
  const sorted = [...doors].sort((a, b) => b.c - a.c);
  sorted.forEach((d, i) => {
    const a = d.c + d.w / 2;
    const b = d.c - d.w / 2;
    if (cur > a) segs.push(<Slab key={`s${i}`} min={[x - T / 2, y0, a]} max={[x + T / 2, y0 + h, cur]} m={m} />);
    segs.push(<Slab key={`l${i}`} min={[x - T / 2, y0 + d.h, b]} max={[x + T / 2, y0 + h, a]} m={m} />);
    // Door frame
    segs.push(<Slab key={`f1${i}`} min={[x - T / 2 - 0.03, y0, a - 0.06]} max={[x + T / 2 + 0.03, y0 + d.h, a]} m={M().metalDark} cast={false} />);
    segs.push(<Slab key={`f2${i}`} min={[x - T / 2 - 0.03, y0, b]} max={[x + T / 2 + 0.03, y0 + d.h, b + 0.06]} m={M().metalDark} cast={false} />);
    segs.push(<Slab key={`f3${i}`} min={[x - T / 2 - 0.03, y0 + d.h - 0.06, b]} max={[x + T / 2 + 0.03, y0 + d.h, a]} m={M().metalDark} cast={false} />);
    cur = b;
  });
  if (cur > z1) segs.push(<Slab key="end" min={[x - T / 2, y0, z1]} max={[x + T / 2, y0 + h, cur]} m={m} />);
  return <group>{segs}</group>;
}

/** Wall along X at fixed z, from x0 to x1 (x0 < x1), with door openings. */
function WallZ({ z, x0, x1, h, doors = [], m, y0 = 0 }: { z: number; x0: number; x1: number; h: number; doors?: Door[]; m: THREE.Material; y0?: number }) {
  const segs: ReactElement[] = [];
  let cur = x0;
  const sorted = [...doors].sort((a, b) => a.c - b.c);
  sorted.forEach((d, i) => {
    const a = d.c - d.w / 2;
    const b = d.c + d.w / 2;
    if (a > cur) segs.push(<Slab key={`s${i}`} min={[cur, y0, z - T / 2]} max={[a, y0 + h, z + T / 2]} m={m} />);
    segs.push(<Slab key={`l${i}`} min={[a, y0 + d.h, z - T / 2]} max={[b, y0 + h, z + T / 2]} m={m} />);
    cur = b;
  });
  if (x1 > cur) segs.push(<Slab key="end" min={[cur, y0, z - T / 2]} max={[x1, y0 + h, z + T / 2]} m={m} />);
  return <group>{segs}</group>;
}

/** Exterior wall with two horizontal window bands (one per storey). */
function BandedWall({ axis, at, from, to }: { axis: "x" | "z"; at: number; from: number; to: number }) {
  const m = M();
  const bands: [number, number, THREE.Material, boolean][] = [
    [0, 1.0, m.concrete, true],
    [1.0, 3.7, m.glassTint, false],
    [3.7, 5.6, m.concrete, true],
    [5.6, 8.3, m.glassTint, false],
    [8.3, 9.8, m.concrete, true],
  ];
  return (
    <group>
      {bands.map(([y0, y1, mat, solid], i) =>
        axis === "x" ? (
          <Slab key={i} min={[at - (solid ? 0.25 : 0.05), y0, to]} max={[at + (solid ? 0.25 : 0.05), y1, from]} m={mat} cast={solid} />
        ) : (
          <Slab key={i} min={[from, y0, at - (solid ? 0.25 : 0.05)]} max={[to, y1, at + (solid ? 0.25 : 0.05)]} m={mat} cast={solid} />
        ),
      )}
      {/* Vertical fins */}
      {Array.from({ length: Math.floor(Math.abs(to - from) / 3) + 1 }, (_, i) => {
        const v = Math.min(from, to) + i * 3;
        return axis === "x" ? (
          <B key={`fin${i}`} p={[at + (at > 0 ? 0.28 : -0.28), 4.9, v]} s={[0.12, 9.8, 0.2]} m={m.metalDark} />
        ) : (
          <B key={`fin${i}`} p={[v, 4.9, at - 0.28]} s={[0.2, 9.8, 0.12]} m={m.metalDark} />
        );
      })}
    </group>
  );
}

function DoorLeaf({ side }: { side: 0 | 1 }) {
  const m = M();
  return (
    <>
      <mesh position={[0, 1.5, 0]} material={m.glass}>
        <boxGeometry args={[1.96, 2.96, 0.03]} />
      </mesh>
      <B p={[0, 0.03, 0]} s={[1.98, 0.06, 0.06]} m={m.metalDark} cast={false} />
      <B p={[0, 2.98, 0]} s={[1.98, 0.06, 0.06]} m={m.metalDark} cast={false} />
      <B p={[side ? -0.95 : 0.95, 1.5, 0]} s={[0.05, 2.96, 0.06]} m={m.metalDark} cast={false} />
      <B p={[side ? -0.85 : 0.85, 1.1, 0.05]} s={[0.03, 0.8, 0.03]} m={m.chrome} cast={false} />
    </>
  );
}

function SlidingDoors() {
  const m = M();
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const open = useRef(0);
  useFrame(({ camera }, dt) => {
    const p = camera.position;
    const near = p.z < 16 && p.z > -6 && Math.abs(p.x) < 6 && p.y < 5;
    open.current = THREE.MathUtils.damp(open.current, near ? 1 : 0, 3.2, dt);
    const o = open.current * 1.95;
    if (left.current) left.current.position.x = -1 - o;
    if (right.current) right.current.position.x = 1 + o;
  });
  return (
    <group position={[0, 0, 0.1]}>
      <group ref={left} position={[-1, 0, 0]}>
        <DoorLeaf side={0} />
      </group>
      <group ref={right} position={[1, 0, 0]}>
        <DoorLeaf side={1} />
      </group>
      {/* Door header with sensor */}
      <B p={[0, 3.15, 0]} s={[4.2, 0.3, 0.3]} m={m.metalDark} />
      <B p={[0, 3.0, 0.16]} s={[0.3, 0.05, 0.05]} m={m.tealGlow} cast={false} />
    </group>
  );
}

function CurtainWall() {
  const m = M();
  const mullions = useMemo(() => {
    const xs: number[] = [];
    for (let x = -30; x <= 30; x += 2) if (Math.abs(x) > 2.1 || Math.abs(x) === 2) xs.push(x);
    return xs;
  }, []);
  return (
    <group>
      {/* Glass panes (split around the entrance) */}
      <Slab min={[-30, 0.02, -0.03]} max={[-2, 9, 0.03]} m={m.glass} cast={false} />
      <Slab min={[2, 0.02, -0.03]} max={[30, 9, 0.03]} m={m.glass} cast={false} />
      <Slab min={[-2, 3.3, -0.03]} max={[2, 9, 0.03]} m={m.glass} cast={false} />
      {mullions.map((x) => (
        <B key={x} p={[x, 4.5, 0.05]} s={[0.07, 9, 0.16]} m={m.metalDark} cast={false} />
      ))}
      {/* Slab edge + parapet */}
      <Slab min={[-30.3, H1, -0.35]} max={[30.3, H1 + 0.45, 0.2]} m={m.concrete} />
      <Slab min={[-30.3, H2, -0.35]} max={[30.3, H2 + 0.8, 0.25]} m={m.concrete} />
      <Slab min={[-30.3, 2.1, 0.02]} max={[-2.1, 2.16, 0.12]} m={m.metalDark} cast={false} />
      <Slab min={[2.1, 2.1, 0.02]} max={[30.3, 2.16, 0.12]} m={m.metalDark} cast={false} />
      <Slab min={[-30.3, 6.8, 0.02]} max={[30.3, 6.86, 0.12]} m={m.metalDark} cast={false} />
    </group>
  );
}

function Canopy() {
  const m = M();
  return (
    <group>
      <Slab min={[-6, 3.6, -0.2]} max={[6, 3.85, 5]} m={m.white} />
      <Slab min={[-6, 3.85, 4.9]} max={[6, 4.05, 5]} m={m.metalDark} />
      {[-5.6, 5.6].map((x) => (
        <mesh key={x} position={[x, 1.8, 4.6]} material={m.metalDark} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 3.6, 16]} />
        </mesh>
      ))}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={x} position={[x, 3.59, 2.5]} rotation={[Math.PI / 2, 0, 0]} material={m.warmLight}>
          <circleGeometry args={[0.12, 16]} />
        </mesh>
      ))}
    </group>
  );
}

function FacadeSign() {
  const tex = useMemo(() => signTexture("SOFTGRESS", { w: 2048, h: 320, fg: "#FFFFFF" }), []);
  const m = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, transparent: true, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 1.4, toneMapped: false, depthWrite: false }),
    [tex],
  );
  return (
    <group position={[0, 6.1, 0.3]}>
      <Slab min={[-8.2, -1.1, -0.15]} max={[8.2, 1.1, 0]} m={M().metalDark} />
      <mesh position={[0, 0, 0.02]} material={m}>
        <planeGeometry args={[15, 2.35]} />
      </mesh>
      <Slab min={[-7.5, -1.02, 0.01]} max={[7.5, -0.97, 0.05]} m={M().tealGlow} cast={false} />
    </group>
  );
}

function LobbyFeatureWall() {
  const m = M();
  const tex = useMemo(() => signTexture("SOFTGRESS", { w: 1600, h: 400, sub: "IDEAS ENGINEERED · GROWTH ACCELERATED", fg: "#F4F1EC" }), []);
  const sign = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, transparent: true, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 1.1, toneMapped: false, depthWrite: false }),
    [tex],
  );
  // Vertical oak slats on the reception back wall (z = -14), either side of the opening.
  const slats = useMemo(() => {
    const out: number[] = [];
    for (let x = -9.7; x <= 9.7; x += 0.32) if (Math.abs(x) > 2.75) out.push(x);
    return out;
  }, []);
  return (
    <group>
      {slats.map((x) => (
        <B key={x} p={[x, 4.5, -13.82]} s={[0.12, 9, 0.12]} m={m.wood} cast={false} />
      ))}
      <Slab min={[-2.75, 3.4, -13.85]} max={[2.75, 9, -13.78]} m={m.woodDark} cast={false} />
      <mesh position={[0, 5.6, -13.74]} material={sign}>
        <planeGeometry args={[5.2, 1.3]} />
      </mesh>
    </group>
  );
}

function Skylight() {
  const m = M();
  return (
    <group>
      {/* Frame around the opening x -4..4, z -12..-4 */}
      <Slab min={[-4.2, H2, -12.2]} max={[4.2, H2 + 0.5, -12]} m={m.metalDark} />
      <Slab min={[-4.2, H2, -4]} max={[4.2, H2 + 0.5, -3.8]} m={m.metalDark} />
      <Slab min={[-4.2, H2, -12]} max={[-4, H2 + 0.5, -4]} m={m.metalDark} />
      <Slab min={[4, H2, -12]} max={[4.2, H2 + 0.5, -4]} m={m.metalDark} />
      {/* Opened louvres */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} position={[x, H2 + 0.75, -8]} rotation={[0, 0, 0.9]} material={m.glassTint}>
          <boxGeometry args={[1.2, 0.03, 7.6]} />
        </mesh>
      ))}
      {/* Glass guard rail around the void on the roof */}
      {[
        [[-4.4, H2 + 0.3, -12.4], [4.4, H2 + 1.4, -12.35]],
        [[-4.4, H2 + 0.3, -3.65], [4.4, H2 + 1.4, -3.6]],
        [[-4.45, H2 + 0.3, -12.4], [-4.4, H2 + 1.4, -3.6]],
        [[4.4, H2 + 0.3, -12.4], [4.45, H2 + 1.4, -3.6]],
      ].map(([a, b], i) => (
        <Slab key={i} min={a as V3} max={b as V3} m={m.glass} cast={false} />
      ))}
    </group>
  );
}

export function Building() {
  const m = M();
  return (
    <group>
      {/* Ground slab + floor finishes */}
      <Slab min={[-30.5, -0.3, -40.5]} max={[30.5, 0, 0.5]} m={m.concrete} />
      <Slab min={[-10, 0, -14]} max={[10, 0.01, 0]} m={m.stoneFloor} cast={false} />
      <Slab min={[-10, 0, -26]} max={[10, 0.01, -14]} m={m.stoneFloor} cast={false} />
      <Slab min={[10, 0, -20]} max={[30, 0.01, 0]} m={m.oakFloor} cast={false} />
      <Slab min={[-30, 0, -20]} max={[-10, 0.01, 0]} m={m.carpet} cast={false} />
      <Slab min={[-30, 0, -40]} max={[-10, 0.01, -20]} m={m.concreteDark} cast={false} />
      <Slab min={[10, 0, -40]} max={[30, 0.01, -20]} m={m.carpetTeal} cast={false} />
      <Slab min={[-10, 0, -40]} max={[10, 0.01, -26]} m={m.oakFloor} cast={false} />

      {/* First-floor slab (everything except the double-height lobby) */}
      <Slab min={[-30, H1, -40]} max={[-10, H1 + 0.3, 0]} m={m.plaster} />
      <Slab min={[10, H1, -40]} max={[30, H1 + 0.3, 0]} m={m.plaster} />
      <Slab min={[-10, H1, -40]} max={[10, H1 + 0.3, -14]} m={m.plaster} />
      {/* Upper floor finishes (seen through the facade) */}
      <Slab min={[-30, H1 + 0.3, -40]} max={[-10, H1 + 0.31, 0]} m={m.carpet} cast={false} />
      <Slab min={[10, H1 + 0.3, -40]} max={[30, H1 + 0.31, 0]} m={m.carpet} cast={false} />

      {/* Roof with skylight opening (x -4..4, z -12..-4) */}
      <Slab min={[-30, H2, -40]} max={[30, H2 + 0.3, -12]} m={m.plaster} />
      <Slab min={[-30, H2, -4]} max={[30, H2 + 0.3, 0]} m={m.plaster} />
      <Slab min={[-30, H2, -12]} max={[-4, H2 + 0.3, -4]} m={m.plaster} />
      <Slab min={[4, H2, -12]} max={[30, H2 + 0.3, -4]} m={m.plaster} />
      <Skylight />

      {/* Envelope */}
      <CurtainWall />
      <SlidingDoors />
      <Canopy />
      <FacadeSign />
      <BandedWall axis="x" at={30.2} from={0} to={-40.4} />
      <BandedWall axis="x" at={-30.2} from={0} to={-40.4} />
      <BandedWall axis="z" at={-40.2} from={-30.4} to={30.4} />

      {/* Interior walls */}
      <WallX x={-10} z0={0} z1={-14} h={H2} doors={[{ c: -7, w: 2.4, h: 2.9 }]} m={m.paint} />
      <WallX x={10} z0={0} z1={-14} h={H2} doors={[{ c: -7, w: 2.4, h: 2.9 }]} m={m.paint} />
      <WallX x={-10} z0={-14} z1={-40} h={H1} doors={[{ c: -23, w: 2.4, h: 2.9 }]} m={m.paint} />
      <WallX x={10} z0={-14} z1={-40} h={H1} doors={[{ c: -23, w: 2.4, h: 2.9 }]} m={m.paint} />
      <WallZ z={-20} x0={-30} x1={-10} h={H1} m={m.paint} />
      <WallZ z={-20} x0={10} x1={30} h={H1} m={m.paint} />
      <WallZ z={-14} x0={-10} x1={10} h={H2} doors={[{ c: 0, w: 5.5, h: 3.4 }]} m={m.paint} />
      <LobbyFeatureWall />
      {/* Boardroom glass partition (z = -26) */}
      <WallZ z={-26} x0={-10} x1={10} h={0.12} m={m.metalDark} />
      <Slab min={[-10, H1 - 0.15, -26.1]} max={[10, H1, -25.9]} m={m.metalDark} />
      <Slab min={[-10, 0.1, -26.02]} max={[-1.2, H1 - 0.15, -25.98]} m={m.glass} cast={false} />
      <Slab min={[1.2, 0.1, -26.02]} max={[10, H1 - 0.15, -25.98]} m={m.glass} cast={false} />
      <Slab min={[-1.2, 2.9, -26.02]} max={[1.2, H1 - 0.15, -25.98]} m={m.glass} cast={false} />
      {[-7, -4, -1.25, 1.25, 4, 7].map((x) => (
        <B key={x} p={[x, H1 / 2, -26]} s={[0.06, H1, 0.1]} m={m.metalDark} cast={false} />
      ))}

      {/* Ceiling lights */}
      <CeilingLights x0={10.5} x1={29.5} z0={-19.5} z1={-0.5} y={H1} />
      <CeilingLights x0={-29.5} x1={-10.5} z0={-19.5} z1={-0.5} y={H1} />
      <CeilingLights x0={-29.5} x1={-10.5} z0={-39.5} z1={-20.5} y={H1} />
      <CeilingLights x0={10.5} x1={29.5} z0={-39.5} z1={-20.5} y={H1} />
      <CeilingLights x0={-9.5} x1={9.5} z0={-39.5} z1={-14.5} y={H1} step={3.8} />
      <CeilingLights x0={-29.5} x1={-10.5} z0={-39.5} z1={-0.5} y={H2} step={4} />
      <CeilingLights x0={10.5} x1={29.5} z0={-39.5} z1={-0.5} y={H2} step={4} />
    </group>
  );
}
