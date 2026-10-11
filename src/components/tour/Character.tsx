"use client";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { colorMat } from "./materials";
import { useStaffHover } from "./anchors";

type V3 = [number, number, number];

export interface Appearance {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  hairStyle: "short" | "long" | "bun" | "curly";
}

const SHOE = "#22201E";

function Capsule({ r, l, mat, p, rot }: { r: number; l: number; mat: THREE.Material; p?: V3; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot} material={mat} castShadow>
      <capsuleGeometry args={[r, l, 4, 10]} />
    </mesh>
  );
}

// SphereGeometry: phi = horizontal angle (back half = π..2π), theta = from the top down.
function Cap({ mat, scale = [1.05, 1, 1.07] as V3, theta = 0.4 }: { mat: THREE.Material; scale?: V3; theta?: number }) {
  return (
    <group>
      {/* Crown: stops above the eyebrows */}
      <mesh position={[0, 0.012, -0.006]} scale={scale} material={mat} castShadow>
        <sphereGeometry args={[0.118, 22, 14, 0, Math.PI * 2, 0, Math.PI * theta]} />
      </mesh>
      {/* Back of the head: reaches lower */}
      <mesh position={[0, 0.008, -0.008]} scale={scale} material={mat} castShadow>
        <sphereGeometry args={[0.119, 22, 14, Math.PI, Math.PI, 0, Math.PI * 0.66]} />
      </mesh>
    </group>
  );
}

function Hair({ style, mat }: { style: Appearance["hairStyle"]; mat: THREE.Material }) {
  switch (style) {
    case "long":
      return (
        <group>
          <Cap mat={mat} theta={0.42} />
          <RoundedBox args={[0.25, 0.32, 0.07]} radius={0.035} position={[0, -0.12, -0.075]} material={mat} castShadow />
          {[-0.1, 0.1].map((x) => (
            <RoundedBox key={x} args={[0.05, 0.22, 0.09]} radius={0.02} position={[x, -0.06, -0.02]} material={mat} castShadow />
          ))}
        </group>
      );
    case "bun":
      return (
        <group>
          <Cap mat={mat} theta={0.38} />
          <mesh position={[0, 0.085, -0.115]} material={mat} castShadow>
            <sphereGeometry args={[0.055, 14, 10]} />
          </mesh>
        </group>
      );
    case "curly":
      return (
        <group>
          <Cap mat={mat} theta={0.36} scale={[1.12, 1.08, 1.12]} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.09, 0.07 + (i % 2) * 0.02, Math.sin(a) * 0.08 - 0.02]} material={mat} castShadow>
                <icosahedronGeometry args={[0.045, 1]} />
              </mesh>
            );
          })}
        </group>
      );
    default:
      return <Cap mat={mat} theta={0.34} scale={[1.04, 0.98, 1.06]} />;
  }
}

/**
 * Procedural, rig-free person. Poses: standing, seated-typing, seated-relaxed.
 * Replaceable with a skinned GLB (same props) — see docs/ASSETS.md.
 */
export function Character({
  p,
  rot = 0,
  look,
  pose = "stand",
  seed = 1,
  interactive,
}: {
  p: V3;
  rot?: number;
  look: Appearance;
  pose?: "stand" | "type" | "sit";
  seed?: number;
  interactive?: {
    id: string;
    label: string;
    sub: string;
    active: boolean;
    onSelect: () => void;
  };
}) {
  const skin = colorMat(look.skin, 0.62);
  const hair = colorMat(look.hair, 0.8);
  const top = colorMat(look.top, 0.85);
  const bottom = colorMat(look.bottom, 0.85);
  const shoe = colorMat(SHOE, 0.6);
  const eye = colorMat("#1A1412", 0.3);
  const lip = colorMat("#8E4F45", 0.6);

  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const phase = useMemo(() => (seed * 1.618) % (Math.PI * 2), [seed]);

  const seated = pose !== "stand";
  const hipY = seated ? 0.5 : 0.93;

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + phase;
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 1.7) * 0.012;
    if (head.current) {
      const talking = interactive?.active;
      head.current.rotation.y = Math.sin(t * 0.37) * (talking ? 0.12 : 0.22);
      head.current.rotation.x = talking ? Math.sin(t * 3.2) * 0.06 - 0.03 : Math.sin(t * 0.5) * 0.04 + (pose === "type" ? 0.18 : 0);
    }
    if (pose === "type" && foreL.current && foreR.current) {
      foreL.current.rotation.x = -1.35 + Math.sin(t * 13) * 0.05;
      foreR.current.rotation.x = -1.35 + Math.sin(t * 11 + 1) * 0.05;
    }
    if (pose === "stand" && armR.current && armL.current) {
      const talking = interactive?.active;
      armR.current.rotation.x = talking ? -0.35 + Math.sin(t * 2.4) * 0.25 : Math.sin(t * 0.8) * 0.03;
      armR.current.rotation.z = talking ? -0.15 : -0.06;
      if (foreR.current) foreR.current.rotation.x = talking ? -0.9 + Math.sin(t * 2.4 + 0.6) * 0.3 : -0.12;
      armL.current.rotation.z = 0.06;
    }
    if (ring.current) {
      const target = hover || interactive?.active ? 1 : 0;
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, target * 0.9 + 0.25, 8, dt);
      ring.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.04);
    }
  });

  const handlers = interactive
    ? {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHover(true);
          useStaffHover.getState().set(interactive.id);
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          setHover(false);
          if (useStaffHover.getState().id === interactive.id) useStaffHover.getState().set(null);
          document.body.style.cursor = "";
        },
        onClick: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          interactive.onSelect();
        },
      }
    : {};

  return (
    <group position={p} rotation={[0, rot, 0]} {...handlers}>
      {/* Legs */}
      {seated ? (
        <>
          {[-0.1, 0.1].map((x) => (
            <group key={x}>
              <Capsule r={0.075} l={0.36} mat={bottom} p={[x, hipY, 0.2]} rot={[Math.PI / 2, 0, 0]} />
              <Capsule r={0.065} l={0.34} mat={bottom} p={[x, 0.27, 0.42]} />
              <RoundedBox args={[0.11, 0.08, 0.24]} radius={0.03} position={[x, 0.04, 0.48]} material={shoe} castShadow />
            </group>
          ))}
        </>
      ) : (
        <>
          {[-0.1, 0.1].map((x) => (
            <group key={x}>
              <Capsule r={0.075} l={0.72} mat={bottom} p={[x, 0.5, 0]} />
              <RoundedBox args={[0.11, 0.08, 0.26]} radius={0.03} position={[x, 0.04, 0.04]} material={shoe} castShadow />
            </group>
          ))}
        </>
      )}
      <RoundedBox args={[0.34, 0.16, 0.2]} radius={0.06} position={[0, hipY + 0.04, 0]} material={bottom} castShadow />

      {/* Upper body */}
      <group ref={torso} position={[0, hipY + 0.1, 0]}>
        <RoundedBox args={[0.38, 0.52, 0.22]} radius={0.09} position={[0, 0.26, 0]} material={top} castShadow />
        <mesh position={[0, 0.56, 0]} material={skin}>
          <cylinderGeometry args={[0.045, 0.05, 0.08, 10]} />
        </mesh>
        <group ref={head} position={[0, 0.7, 0]}>
          <mesh scale={[0.93, 1.1, 1]} material={skin} castShadow>
            <sphereGeometry args={[0.11, 22, 16]} />
          </mesh>
          {[-0.038, 0.038].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.008, 0.096]} material={eye}>
                <sphereGeometry args={[0.0125, 10, 8]} />
              </mesh>
              <mesh position={[x, 0.038, 0.095]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]} material={hair}>
                <boxGeometry args={[0.034, 0.007, 0.01]} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.018, 0.106]} rotation={[0.2, 0, 0]} material={skin}>
            <coneGeometry args={[0.014, 0.034, 8]} />
          </mesh>
          <mesh position={[0, -0.058, 0.094]} material={lip}>
            <boxGeometry args={[0.034, 0.006, 0.008]} />
          </mesh>
          <Hair style={look.hairStyle} mat={hair} />
        </group>
        {/* Arms */}
        {(
          [
            [-1, armL, foreL],
            [1, armR, foreR],
          ] as const
        ).map(([side, armRef, foreRef]) => (
          <group key={side} ref={armRef} position={[side * 0.23, 0.46, 0]} rotation={[pose === "type" ? -0.5 : 0, 0, side * -0.06]}>
            <Capsule r={0.055} l={0.24} mat={top} p={[0, -0.15, 0]} />
            <group ref={foreRef} position={[0, -0.3, 0]} rotation={[pose === "type" ? -1.35 : pose === "sit" ? -0.9 : -0.12, 0, 0]}>
              <Capsule r={0.045} l={0.22} mat={skin} p={[0, -0.13, 0]} />
              <mesh position={[0, -0.28, 0.01]} material={skin} castShadow>
                <sphereGeometry args={[0.048, 10, 8]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {interactive && (
        <>
          {/* Generous invisible hit target for easy pointing */}
          <mesh position={[0, 0.95, 0]} visible={false}>
            <cylinderGeometry args={[0.45, 0.45, 1.9, 8]} />
          </mesh>
          <mesh ref={ring} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.42, 0.5, 48]} />
            <meshStandardMaterial color="#29C6C0" emissive="#29C6C0" emissiveIntensity={1.6} transparent opacity={0.25} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}
