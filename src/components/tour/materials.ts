"use client";
import * as THREE from "three";
import {
  asphaltTexture,
  carpetTexture,
  concreteTexture,
  floorTileTexture,
  grassTexture,
  woodTexture,
} from "./textures";

// Shared physically-based materials. Created lazily on the client, reused everywhere
// (fewer programs + fewer state changes = cheaper draw calls).

type MatKey =
  | "concrete" | "concreteDark" | "plaster" | "wood" | "woodDark" | "oakFloor" | "stoneFloor" | "carpet" | "carpetTeal"
  | "glass" | "glassTint" | "metal" | "metalDark" | "chrome" | "black" | "white" | "teal" | "tealGlow" | "mint"
  | "fabric" | "fabricLight" | "leather" | "asphalt" | "sidewalk" | "grass" | "hedge" | "foliage" | "foliageInst" | "bark" | "soil"
  | "screenOff" | "lightPanel" | "warmLight" | "rubber" | "terracotta" | "paint" | "redAccent";

let mats: Record<MatKey, THREE.Material> | null = null;

function std(p: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(p);
}
function tex(t: THREE.Texture, repeat: [number, number]) {
  const c = t.clone();
  c.repeat.set(...repeat);
  c.needsUpdate = true;
  return c;
}

export function M(): Record<MatKey, THREE.Material> {
  if (mats) return mats;
  mats = {
    concrete: std({ map: tex(concreteTexture(226), [4, 2]), roughness: 0.92, metalness: 0 }),
    concreteDark: std({ map: tex(concreteTexture(150), [4, 2]), color: "#9C9790", roughness: 0.6 }),
    plaster: std({ color: "#E4DFD7", roughness: 0.95 }),
    wood: std({ map: tex(woodTexture("#B9844F"), [1, 1]), roughness: 0.55 }),
    woodDark: std({ map: tex(woodTexture("#6E4A2E"), [1, 1]), roughness: 0.5 }),
    oakFloor: std({ map: tex(woodTexture("#C29361"), [6, 6]), roughness: 0.45, metalness: 0.02 }),
    stoneFloor: std({ map: tex(floorTileTexture("#E8E3DB"), [8, 6]), color: "#D9D3C9", roughness: 0.3, metalness: 0.05 }),
    carpet: std({ map: tex(carpetTexture("#3A434D"), [10, 10]), roughness: 1 }),
    carpetTeal: std({ map: tex(carpetTexture("#20504F"), [6, 6]), roughness: 1 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#CFE9EA",
      roughness: 0.04,
      metalness: 0.1,
      transparent: true,
      opacity: 0.18,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
      reflectivity: 0.6,
    }),
    glassTint: new THREE.MeshPhysicalMaterial({
      color: "#7FA9B3",
      roughness: 0.06,
      metalness: 0.3,
      transparent: true,
      opacity: 0.42,
      envMapIntensity: 2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    metal: std({ color: "#9AA3AD", roughness: 0.35, metalness: 0.85 }),
    metalDark: std({ color: "#2B3036", roughness: 0.45, metalness: 0.7 }),
    chrome: std({ color: "#DDE3E8", roughness: 0.12, metalness: 1 }),
    black: std({ color: "#15181C", roughness: 0.6 }),
    white: std({ color: "#ECEBE7", roughness: 0.5 }),
    teal: std({ color: "#29C6C0", roughness: 0.45 }),
    tealGlow: std({ color: "#29C6C0", emissive: "#29C6C0", emissiveIntensity: 2.2, roughness: 0.4, toneMapped: false }),
    mint: std({ color: "#A8F0D3", roughness: 0.6 }),
    fabric: std({ color: "#4B5563", roughness: 0.95 }),
    fabricLight: std({ color: "#C9C3B8", roughness: 0.95 }),
    leather: std({ color: "#2E2A27", roughness: 0.55 }),
    asphalt: std({ map: tex(asphaltTexture(), [3, 40]), roughness: 0.95 }),
    sidewalk: std({ map: tex(floorTileTexture("#BDB8B0", "rgba(0,0,0,0.18)"), [2, 30]), color: "#C9C4BC", roughness: 0.9 }),
    grass: std({ map: tex(grassTexture(), [60, 60]), color: "#B9C9A8", roughness: 1 }),
    hedge: std({ color: "#3E6B2E", roughness: 1 }),
    foliage: std({ color: "#4F7F35", roughness: 0.9 }),
    foliageInst: std({ color: "#ffffff", roughness: 0.9 }),
    bark: std({ color: "#5B4636", roughness: 1 }),
    soil: std({ color: "#4A3B2E", roughness: 1 }),
    screenOff: std({ color: "#0A0D11", roughness: 0.2, metalness: 0.4 }),
    lightPanel: std({ color: "#ffffff", emissive: "#FFF3E2", emissiveIntensity: 1.05, toneMapped: false }),
    warmLight: std({ color: "#FFE2B0", emissive: "#FFCF80", emissiveIntensity: 2.5, toneMapped: false }),
    rubber: std({ color: "#1B1D20", roughness: 0.9 }),
    terracotta: std({ color: "#B7653F", roughness: 0.85 }),
    paint: std({ color: "#D8D3CA", roughness: 0.9 }),
    redAccent: std({ color: "#D9534F", roughness: 0.5 }),
  };
  return mats;
}

/** Screen material from a texture: emissive so it reads as a lit display. */
const screenCache = new Map<string, THREE.MeshStandardMaterial>();
export function screenMat(key: string, map: THREE.Texture, intensity = 1.15) {
  let m = screenCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: intensity, roughness: 0.3, toneMapped: false });
    screenCache.set(key, m);
  }
  return m;
}

const colorCache = new Map<string, THREE.MeshStandardMaterial>();
export function colorMat(color: string, roughness = 0.7) {
  const k = `${color}:${roughness}`;
  let m = colorCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness });
    colorCache.set(k, m);
  }
  return m;
}
