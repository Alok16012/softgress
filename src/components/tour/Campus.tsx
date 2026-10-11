"use client";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { M, colorMat } from "./materials";
import { B, Slab } from "./primitives";
import { rng, signTexture } from "./textures";

type V3 = [number, number, number];

// ── Instanced trees (two canopy lobes + trunk) ─────────────────────────────
function Trees({ spots, scale = 1 }: { spots: V3[]; scale?: number }) {
  const m = M();
  const trunk = useRef<THREE.InstancedMesh>(null);
  const crownA = useRef<THREE.InstancedMesh>(null);
  const crownB = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const r = rng(77);
    const o = new THREE.Object3D();
    spots.forEach((p, i) => {
      const s = (0.7 + r() * 0.35) * scale;
      o.position.set(p[0], p[1] + 1.4 * s, p[2]);
      o.scale.set(s, s, s);
      o.rotation.set(0, r() * Math.PI, 0);
      o.updateMatrix();
      trunk.current!.setMatrixAt(i, o.matrix);
      o.position.set(p[0], p[1] + 3.6 * s, p[2]);
      o.scale.set(s * 1.25, s * 1.1, s * 1.25);
      o.updateMatrix();
      crownA.current!.setMatrixAt(i, o.matrix);
      o.position.set(p[0] + 0.5 * s, p[1] + 4.6 * s, p[2] - 0.3 * s);
      o.scale.set(s * 0.9, s * 0.85, s * 0.9);
      o.updateMatrix();
      crownB.current!.setMatrixAt(i, o.matrix);
    });
    const greens = ["#3B5E27", "#46702E", "#335522", "#527A35", "#3F6A2B", "#5A7B38"].map((c) => new THREE.Color(c));
    spots.forEach((_, i) => {
      crownA.current!.setColorAt(i, greens[i % greens.length]);
      crownB.current!.setColorAt(i, greens[(i + 2) % greens.length].clone().multiplyScalar(1.08));
    });
    for (const ref of [trunk, crownA, crownB]) {
      ref.current!.instanceMatrix.needsUpdate = true;
      if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
      ref.current!.computeBoundingSphere();
    }
  }, [spots, scale]);
  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, spots.length]} material={m.bark} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 2.8, 7]} />
      </instancedMesh>
      <instancedMesh ref={crownA} args={[undefined, undefined, spots.length]} material={m.foliageInst} castShadow receiveShadow>
        <icosahedronGeometry args={[1.6, 3]} />
      </instancedMesh>
      <instancedMesh ref={crownB} args={[undefined, undefined, spots.length]} material={m.foliageInst} castShadow>
        <icosahedronGeometry args={[1.15, 3]} />
      </instancedMesh>
    </group>
  );
}

function Lamp({ p, rot = 0 }: { p: V3; rot?: number }) {
  const m = M();
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <mesh position={[0, 2.6, 0]} material={m.metalDark} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 5.2, 8]} />
      </mesh>
      <B p={[0.35, 5.15, 0]} s={[0.8, 0.08, 0.2]} m={m.metalDark} />
      <B p={[0.6, 5.1, 0]} s={[0.36, 0.03, 0.14]} m={m.warmLight} cast={false} />
    </group>
  );
}

// ── Cars ───────────────────────────────────────────────────────────────────
const CAR_COLORS = ["#E7E9EC", "#1F2933", "#8A2E2E", "#2F4F6F", "#B9BEC4", "#29C6C0", "#3B3B3B", "#D9D4C7"];

function CarBody({ color }: { color: string }) {
  const m = M();
  const paint = colorMat(color, 0.25);
  return (
    <group>
      <B p={[0, 0.55, 0]} s={[1.8, 0.6, 4.3]} m={paint} />
      <B p={[0, 1.05, -0.2]} s={[1.6, 0.5, 2.3]} m={paint} />
      <B p={[0, 1.06, -0.2]} s={[1.62, 0.4, 2.0]} m={m.glassTint} cast={false} />
      {[-0.8, 0.8].map((x) =>
        [-1.35, 1.35].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.33, z]} rotation={[0, 0, Math.PI / 2]} material={m.rubber} castShadow>
            <cylinderGeometry args={[0.33, 0.33, 0.24, 14]} />
          </mesh>
        )),
      )}
      <B p={[-0.6, 0.62, 2.16]} s={[0.35, 0.12, 0.04]} m={m.warmLight} cast={false} />
      <B p={[0.6, 0.62, 2.16]} s={[0.35, 0.12, 0.04]} m={m.warmLight} cast={false} />
      <B p={[-0.6, 0.66, -2.16]} s={[0.35, 0.1, 0.04]} m={m.redAccent} cast={false} />
      <B p={[0.6, 0.66, -2.16]} s={[0.35, 0.1, 0.04]} m={m.redAccent} cast={false} />
    </group>
  );
}

/** Cars looping along a straight lane. */
function Traffic({ lanes }: { lanes: { from: V3; to: V3; count: number; speed: number; offset: number }[] }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const cars = useMemo(
    () =>
      lanes.flatMap((lane, li) =>
        Array.from({ length: lane.count }, (_, i) => ({ lane, li, phase: (i + lane.offset) / lane.count, color: CAR_COLORS[(li * 3 + i) % CAR_COLORS.length] })),
      ),
    [lanes],
  );
  useFrame(({ clock }) => {
    cars.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      const { from, to, speed } = c.lane;
      const len = Math.hypot(to[0] - from[0], to[2] - from[2]);
      const t = (c.phase + (clock.elapsedTime * speed) / len) % 1;
      g.position.set(from[0] + (to[0] - from[0]) * t, from[1], from[2] + (to[2] - from[2]) * t);
      g.rotation.y = Math.atan2(to[0] - from[0], to[2] - from[2]);
    });
  });
  return (
    <group>
      {cars.map((c, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <CarBody color={c.color} />
        </group>
      ))}
    </group>
  );
}

// ── Walkers (low-poly passers-by with leg swing) ───────────────────────────
function Walker({ path, speed, phase, look }: { path: V3[]; speed: number; phase: number; look: { top: string; bottom: string; skin: string; hair: string } }) {
  const g = useRef<THREE.Group>(null);
  const lL = useRef<THREE.Group>(null);
  const lR = useRef<THREE.Group>(null);
  const aL = useRef<THREE.Group>(null);
  const aR = useRef<THREE.Group>(null);
  const segs = useMemo(() => {
    const out: { a: V3; b: V3; len: number }[] = [];
    for (let i = 0; i < path.length; i++) {
      const a = path[i];
      const b = path[(i + 1) % path.length];
      out.push({ a, b, len: Math.hypot(b[0] - a[0], b[2] - a[2]) });
    }
    return out;
  }, [path]);
  const total = segs.reduce((s, x) => s + x.len, 0);
  useFrame(({ clock }) => {
    let d = (phase * total + clock.elapsedTime * speed) % total;
    let seg = segs[0];
    for (const s of segs) {
      if (d <= s.len) {
        seg = s;
        break;
      }
      d -= s.len;
    }
    const t = d / seg.len;
    if (g.current) {
      g.current.position.set(seg.a[0] + (seg.b[0] - seg.a[0]) * t, 0, seg.a[2] + (seg.b[2] - seg.a[2]) * t);
      g.current.rotation.y = Math.atan2(seg.b[0] - seg.a[0], seg.b[2] - seg.a[2]);
    }
    const sw = Math.sin(clock.elapsedTime * speed * 4.2 + phase * 10) * 0.45;
    if (lL.current) lL.current.rotation.x = sw;
    if (lR.current) lR.current.rotation.x = -sw;
    if (aL.current) aL.current.rotation.x = -sw * 0.8;
    if (aR.current) aR.current.rotation.x = sw * 0.8;
  });
  const top = colorMat(look.top, 0.9);
  const bottom = colorMat(look.bottom, 0.9);
  const skin = colorMat(look.skin, 0.6);
  const hair = colorMat(look.hair, 0.8);
  return (
    <group ref={g}>
      {[
        [-0.1, lL],
        [0.1, lR],
      ].map(([x, ref]) => (
        <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.92, 0]}>
          <mesh position={[0, -0.45, 0]} material={bottom} castShadow>
            <capsuleGeometry args={[0.07, 0.75, 3, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.27, 0]} material={top} castShadow>
        <capsuleGeometry args={[0.18, 0.4, 3, 10]} />
      </mesh>
      {[
        [-0.25, aL],
        [0.25, aR],
      ].map(([x, ref]) => (
        <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.48, 0]}>
          <mesh position={[0, -0.3, 0]} material={top} castShadow>
            <capsuleGeometry args={[0.05, 0.5, 3, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.72, 0]} material={skin} castShadow>
        <sphereGeometry args={[0.11, 14, 10]} />
      </mesh>
      <mesh position={[0, 1.76, -0.01]} material={hair}>
        <sphereGeometry args={[0.115, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
    </group>
  );
}

function MonumentSign() {
  const tex = useMemo(() => signTexture("SOFTGRESS", { w: 1024, h: 300, sub: "IDEAS ENGINEERED · GROWTH ACCELERATED", bg: "#07111F", fg: "#FFFFFF" }), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.9, toneMapped: false }), [tex]);
  const m = M();
  return (
    <group position={[9.5, 0, 22]} rotation={[0, -0.35, 0]}>
      <Slab min={[-3.2, 0, -0.4]} max={[3.2, 0.5, 0.4]} m={m.concreteDark} />
      <Slab min={[-3, 0.5, -0.25]} max={[3, 2.4, 0.25]} m={m.concrete} />
      <mesh position={[0, 1.45, 0.26]} material={mat}>
        <planeGeometry args={[5.6, 1.64]} />
      </mesh>
      <mesh position={[0, 0.55, 0.42]} material={m.hedge}>
        <boxGeometry args={[6.6, 0.4, 0.4]} />
      </mesh>
    </group>
  );
}

function NeighbourBlock({ p, s, tone = "#C9CDD2" }: { p: V3; s: V3; tone?: string }) {
  const m = M();
  return (
    <group position={p}>
      <B p={[0, s[1] / 2, 0]} s={s} m={colorMat(tone, 0.85)} />
      {Array.from({ length: Math.floor(s[1] / 4) }, (_, i) => (
        <B key={i} p={[0, 2.2 + i * 4, s[2] / 2 + 0.02]} s={[s[0] * 0.92, 1.8, 0.05]} m={m.glassTint} cast={false} />
      ))}
    </group>
  );
}

export function Campus({ detail = 1 }: { detail?: number }) {
  const m = M();
  const avenue = useMemo(() => {
    const t: V3[] = [];
    for (let z = 16; z < 150; z += 9) {
      t.push([-7.5, 0, z]);
      t.push([7.5, 0, z + 4.5]);
    }
    return t;
  }, []);
  const groves = useMemo(() => {
    const r = rng(1234);
    const t: V3[] = [];
    const n = detail > 0.5 ? 70 : 30;
    while (t.length < n) {
      const x = (r() - 0.5) * 220;
      const z = -90 + r() * 170;
      // keep clear of the building, plaza, road, parking and side lawns
      if (x > -40 && x < 44 && z > -55 && z < 34) continue;
      if (Math.abs(x) < 12 && z > -10) continue;
      if (z > 60 && z < 72) continue;
      t.push([x, 0, z]);
    }
    return t;
  }, [detail]);

  const walkers = useMemo(
    () => [
      { path: [[-5.2, 0, 14], [-5.2, 0, 60], [-5.4, 0, 60.5], [-5.4, 0, 14]] as V3[], speed: 1.25, phase: 0.1, look: { top: "#2E5E8C", bottom: "#1F2933", skin: "#B98463", hair: "#1B1210" } },
      { path: [[5.2, 0, 70], [5.2, 0, 13], [5.4, 0, 12.5], [5.4, 0, 70]] as V3[], speed: 1.1, phase: 0.55, look: { top: "#E9E3D6", bottom: "#394150", skin: "#8D5A3B", hair: "#0E0C0B" } },
      { path: [[-12, 0, 8], [12, 0, 8], [12, 0, 9], [-12, 0, 9]] as V3[], speed: 1.0, phase: 0.3, look: { top: "#29C6C0", bottom: "#2B2F36", skin: "#C98E6B", hair: "#3B2416" } },
      { path: [[-30, 0, 63], [40, 0, 63]] as V3[], speed: 1.3, phase: 0.7, look: { top: "#8A2E2E", bottom: "#23262B", skin: "#A86F4C", hair: "#141010" } },
      { path: [[40, 0, 65.5], [-30, 0, 65.5]] as V3[], speed: 1.15, phase: 0.2, look: { top: "#556B2F", bottom: "#2E3440", skin: "#C4906E", hair: "#5B5B5B" } },
    ],
    [],
  );

  const parked = useMemo(() => {
    const out: { p: V3; color: string }[] = [];
    const r = rng(9);
    for (let i = 0; i < 9; i++) {
      if (r() < 0.25) continue;
      out.push({ p: [19 + i * 2.8, 0, 13.5], color: CAR_COLORS[i % CAR_COLORS.length] });
    }
    for (let i = 0; i < 9; i++) {
      if (r() < 0.35) continue;
      out.push({ p: [19 + i * 2.8, 0, 24.5], color: CAR_COLORS[(i + 3) % CAR_COLORS.length] });
    }
    return out;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} material={m.grass} receiveShadow>
        <planeGeometry args={[520, 520]} />
      </mesh>
      {/* Entrance plaza */}
      <Slab min={[-16, -0.04, 0.5]} max={[16, 0.02, 12]} m={m.sidewalk} cast={false} />
      {/* Access road + kerbs + sidewalks */}
      <Slab min={[-3.6, -0.04, 12]} max={[3.6, 0.0, 160]} m={m.asphalt} cast={false} />
      <Slab min={[-0.08, 0.0, 14]} max={[0.08, 0.01, 160]} m={colorMat("#E8E2C8", 0.6)} cast={false} />
      <Slab min={[-6.2, -0.04, 12]} max={[-3.6, 0.08, 160]} m={m.sidewalk} cast={false} />
      <Slab min={[3.6, -0.04, 12]} max={[6.2, 0.08, 160]} m={m.sidewalk} cast={false} />
      {/* Cross street */}
      <Slab min={[-200, -0.03, 60]} max={[200, 0.005, 68]} m={m.asphalt} cast={false} />
      <Slab min={[-200, -0.03, 58.5]} max={[200, 0.07, 60]} m={m.sidewalk} cast={false} />
      <Slab min={[-200, -0.03, 68]} max={[200, 0.07, 69.5]} m={m.sidewalk} cast={false} />
      {/* Drop-off loop in front of the canopy */}
      <Slab min={[-9, -0.035, 6]} max={[9, 0.004, 12]} m={m.asphalt} cast={false} />
      {/* Parking */}
      <Slab min={[16, -0.035, 10]} max={[44, 0.004, 28]} m={m.asphalt} cast={false} />
      {Array.from({ length: 11 }, (_, i) => (
        <group key={i}>
          <Slab min={[17.5 + i * 2.8, 0.004, 11]} max={[17.6 + i * 2.8, 0.01, 16]} m={m.white} cast={false} />
          <Slab min={[17.5 + i * 2.8, 0.004, 22]} max={[17.6 + i * 2.8, 0.01, 27]} m={m.white} cast={false} />
        </group>
      ))}
      {parked.map((c, i) => (
        <group key={i} position={c.p} rotation={[0, c.p[2] < 20 ? Math.PI : 0, 0]}>
          <CarBody color={c.color} />
        </group>
      ))}
      {/* Hedges and planters around the plaza */}
      {[-13, 13].map((x) => (
        <mesh key={x} position={[x, 0.45, 6]} material={m.hedge} castShadow receiveShadow>
          <boxGeometry args={[5, 0.9, 1.2]} />
        </mesh>
      ))}
      {[-15.5, 15.5].map((x) => (
        <Slab key={x} min={[x - 0.6, 0, 1]} max={[x + 0.6, 0.5, 11]} m={m.concrete} />
      ))}
      {/* Benches on the plaza */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 0, 3]}>
          <B p={[0, 0.45, 0]} s={[2.2, 0.08, 0.5]} m={m.wood} />
          <B p={[-0.9, 0.22, 0]} s={[0.1, 0.44, 0.45]} m={m.metalDark} />
          <B p={[0.9, 0.22, 0]} s={[0.1, 0.44, 0.45]} m={m.metalDark} />
        </group>
      ))}
      {/* Bike rack */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-11 + i * 0.7, 0.45, 10.5]} rotation={[0, Math.PI / 2, 0]} material={m.metal}>
          <torusGeometry args={[0.4, 0.03, 6, 16, Math.PI]} />
        </mesh>
      ))}

      <MonumentSign />
      <Trees spots={[...avenue, ...groves, [-22, 0, 4], [-26, 0, 9], [24, 0, 4], [-36, 0, -8], [36, 0, -20], [-36, 0, -30], [36, 0, -36]]} />
      {Array.from({ length: 14 }, (_, i) => (
        <Lamp key={i} p={[i % 2 ? 6.6 : -6.6, 0, 14 + i * 10]} rot={i % 2 ? Math.PI : 0} />
      ))}

      <Traffic
        lanes={[
          { from: [-180, 0, 62], to: [180, 0, 62], count: 4, speed: 9, offset: 0 },
          { from: [180, 0, 66], to: [-180, 0, 66], count: 4, speed: 8, offset: 0.4 },
          { from: [1.7, 0, 150], to: [1.7, 0, 14], count: 1, speed: 6, offset: 0.2 },
          { from: [-1.7, 0, 14], to: [-1.7, 0, 150], count: 1, speed: 6.5, offset: 0.7 },
        ]}
      />
      {walkers.map((w, i) => (
        <Walker key={i} {...w} />
      ))}

      {/* Distant context: neighbouring low-rise offices and hills */}
      <NeighbourBlock p={[-80, 0, -20]} s={[30, 16, 24]} />
      <NeighbourBlock p={[85, 0, -10]} s={[26, 12, 30]} tone="#D6D2CB" />
      <NeighbourBlock p={[-60, 0, 110]} s={[24, 20, 20]} tone="#BFC6CC" />
      <NeighbourBlock p={[70, 0, 120]} s={[34, 14, 22]} />
      {[
        [-180, -140, 120],
        [-40, -190, 160],
        [140, -170, 140],
        [210, 20, 110],
        [-220, 40, 120],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, -r * 0.82, z]} material={colorMat(i % 2 ? "#6E8B5B" : "#7C9466", 1)}>
          <sphereGeometry args={[r, 18, 12]} />
        </mesh>
      ))}
    </group>
  );
}
