"use client";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { neighbours } from "@/lib/tour/scenes";
import type { SceneId } from "@/lib/types";
import { useTour, type Quality } from "@/stores/tour";
import { Building } from "./Building";
import { Campus } from "./Campus";
import { CameraRig } from "./CameraRig";
import { AnchorProjector } from "./Hotspots";
import { Lighting } from "./Lighting";
import { ZONES } from "./Zones";

const DPR: Record<Quality, [number, number]> = { low: [0.75, 1], medium: [1, 1.5], high: [1, 2] };

function Effects({ quality }: { quality: Quality }) {
  if (quality === "low") return null;
  return (
    <EffectComposer multisampling={quality === "high" ? 4 : 0}>
      {quality === "high" ? <N8AO aoRadius={1.1} intensity={2.4} distanceFalloff={0.5} halfRes quality="performance" /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1.15} luminanceSmoothing={0.2} intensity={0.32} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.42} />
    </EffectComposer>
  );
}

/** Zone streaming: idle → current room + nearby rooms; in motion → everything on the way. */
function useVisibleZones(): Set<SceneId> {
  const scene = useTour((s) => s.state.scene);
  const target = useTour((s) => s.state.target);
  const phase = useTour((s) => s.state.phase);
  return useMemo(() => {
    if (phase === "transit") return new Set(Object.keys(ZONES) as SceneId[]);
    const set = new Set<SceneId>([scene, ...neighbours(scene)]);
    if (target) set.add(target);
    return set;
  }, [scene, target, phase]);
}

function Zones() {
  const visible = useVisibleZones();
  return (
    <>
      {(Object.entries(ZONES) as [SceneId, () => React.ReactElement][]).map(([id, Zone]) =>
        visible.has(id) ? (
          <Suspense key={id} fallback={null}>
            <Zone />
          </Suspense>
        ) : null,
      )}
    </>
  );
}

export default function World({ onReady }: { onReady?: () => void }) {
  const quality = useTour((s) => s.prefs.quality);
  const autoQuality = useTour((s) => s.prefs.autoQuality);
  const setPrefs = useTour((s) => s.setPrefs);
  const scene = useTour((s) => s.state.scene);
  const target = useTour((s) => s.state.target);
  const sunset = (target ?? scene) === "rooftop";

  return (
    <Canvas
      shadows={quality !== "low" ? "percentage" : false}
      dpr={DPR[quality]}
      camera={{ fov: 52, near: 0.1, far: 900, position: [3.5, 3.4, 158] }}
      gl={{
        antialias: quality === "low",
        powerPreference: "high-performance",
        toneMapping: quality === "low" ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping,
        stencil: false,
      }}
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => {
          if (!autoQuality) return;
          const q = useTour.getState().prefs.quality;
          if (q === "high") setPrefs({ quality: "medium" });
          else if (q === "medium") setPrefs({ quality: "low" });
        }}
        flipflops={2}
      />
      <AdaptiveDpr pixelated={false} />
      <Lighting sunset={sunset} quality={quality} />
      <Campus detail={quality === "low" ? 0.4 : 1} />
      <Building />
      <Zones />
      <AnchorProjector />
      <CameraRig />
      <Effects quality={quality} />
    </Canvas>
  );
}
