"use client";
import { Environment, Lightformer, Sky } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Quality } from "@/stores/tour";

const DAY_SUN = new THREE.Vector3(70, 95, 60);
const DUSK_SUN = new THREE.Vector3(-90, 9, 150);
const DAY_COLOR = new THREE.Color("#FFF4E2");
const DUSK_COLOR = new THREE.Color("#FF9A4D");
const DAY_FOG = new THREE.Color("#BFD3E2");
const DUSK_FOG = new THREE.Color("#E8B48E");

/** Sun, sky, image-based lighting and fog. `sunset` blends smoothly to golden hour. */
export function Lighting({ sunset, quality }: { sunset: boolean; quality: Quality }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sky = useRef<THREE.Mesh>(null);
  const t = useRef(sunset ? 1 : 0);
  const get = useThree((s) => s.get);
  const fog = useRef<THREE.Fog>(null);
  const tmp = useRef(new THREE.Vector3());

  useEffect(() => {
    get().scene.environmentIntensity = 0.5;
  }, [get]);

  useFrame((_, dt) => {
    t.current = THREE.MathUtils.damp(t.current, sunset ? 1 : 0, 1.2, dt);
    const k = t.current;
    const pos = tmp.current.copy(DAY_SUN).lerp(DUSK_SUN, k);
    if (sun.current) {
      sun.current.position.copy(pos);
      sun.current.color.copy(DAY_COLOR).lerp(DUSK_COLOR, k);
      sun.current.intensity = THREE.MathUtils.lerp(2.7, 2.2, k);
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(0.4, 0.3, k);
    const mat = sky.current?.material as THREE.ShaderMaterial | undefined;
    if (mat?.uniforms?.sunPosition) {
      mat.uniforms.sunPosition.value.copy(pos);
      mat.uniforms.turbidity.value = THREE.MathUtils.lerp(2.6, 8, k);
      mat.uniforms.rayleigh.value = THREE.MathUtils.lerp(0.9, 2.4, k);
    }
    fog.current?.color.copy(DAY_FOG).lerp(DUSK_FOG, k);
  });

  const shadowSize = quality === "high" ? 2048 : 1024;
  return (
    <>
      <fog ref={fog} attach="fog" args={[DAY_FOG.getHex(), 170, 700]} />
      <Sky ref={sky as never} distance={4500} sunPosition={DAY_SUN.toArray()} turbidity={2.6} rayleigh={0.9} mieCoefficient={0.003} mieDirectionalG={0.85} />
      <hemisphereLight ref={hemi} args={["#CFE3F2", "#5A4D3E", 0.55]} />
      <directionalLight
        ref={sun}
        position={DAY_SUN.toArray()}
        intensity={3.2}
        castShadow={quality !== "low"}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-near={10}
        shadow-camera-far={320}
      >
        <object3D attach="target" position={[0, 0, -15]} />
      </directionalLight>
      {/* Interior fill: soft area-like lights per zone (no shadows) */}
      {(
        [
          [0, 7.5, -7, 90],
          [20, 3.9, -10, 70],
          [-20, 3.9, -10, 70],
          [-20, 3.9, -30, 70],
          [20, 3.9, -30, 70],
          [0, 3.9, -33, 55],
          [0, 3.9, -20, 30],
        ] as const
      ).map(([x, y, z, i], n) => (
        <pointLight key={n} position={[x, y, z]} intensity={i} distance={22} decay={1.6} color="#FFF1DE" />
      ))}
      {/* Image-based lighting rendered once from lightformers: no HDR download. */}
      <Environment resolution={quality === "low" ? 64 : 256} frames={1}>
        <color attach="background" args={["#B9CCD8"]} />
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#DCEBFF" position={[0, 4, 30]} scale={[60, 8, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#FFE8C8" position={[-30, 4, 0]} rotation-y={Math.PI / 2} scale={[60, 6, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#E8F4F3" position={[30, 4, 0]} rotation-y={-Math.PI / 2} scale={[60, 6, 1]} />
        <Lightformer form="ring" intensity={3} color="#29C6C0" position={[0, 6, -30]} scale={6} />
      </Environment>
    </>
  );
}
