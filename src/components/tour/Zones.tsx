"use client";
import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { staffById } from "@/content/staff";
import { STAFF_PLACEMENT } from "@/lib/tour/placements";
import { useTour } from "@/stores/tour";
import { Character, type Appearance } from "./Character";
import { M, colorMat, screenMat } from "./materials";
import { B, Chair, Monitor, Plant, Screen, Slab, Sofa, Workstation } from "./primitives";
import {
  brandWallTexture,
  dashboardTexture,
  designTexture,
  directoryTexture,
  galleryTexture,
  signTexture,
  workflowTexture,
} from "./textures";

type V3 = [number, number, number];

const EXTRAS: Appearance[] = [
  { skin: "#B98463", hair: "#1B1210", top: "#3E5C76", bottom: "#23262B", hairStyle: "short" },
  { skin: "#8D5A3B", hair: "#0E0C0B", top: "#D9D4C7", bottom: "#2E3440", hairStyle: "long" },
  { skin: "#C98E6B", hair: "#3B2416", top: "#2F4F4F", bottom: "#394150", hairStyle: "bun" },
  { skin: "#A86F4C", hair: "#141010", top: "#7A4E3A", bottom: "#1F2933", hairStyle: "curly" },
  { skin: "#C4906E", hair: "#2A1810", top: "#EDEDED", bottom: "#30343B", hairStyle: "short" },
  { skin: "#9E6A48", hair: "#5B5B5B", top: "#556B2F", bottom: "#2B2F36", hairStyle: "short" },
  { skin: "#B47B58", hair: "#1A1110", top: "#8C3B5A", bottom: "#23262B", hairStyle: "long" },
];
const extra = (i: number) => EXTRAS[i % EXTRAS.length];

/** An AI guide placed in the world: hover highlight + click → TALK. */
function Guide({ id }: { id: string }) {
  const s = staffById.get(id)!;
  const place = STAFF_PLACEMENT[id];
  const active = useTour((st) => st.state.phase === "dialogue" && st.state.staffId === id);
  const dispatch = useTour((st) => st.dispatch);
  return (
    <Character
      p={place.position}
      rot={place.rot}
      look={s.appearance}
      seed={id.length}
      interactive={{
        id,
        label: `Talk to ${s.displayName}`,
        sub: `${s.roleTitle} · AI guide`,
        active,
        onSelect: () => dispatch({ type: "TALK", staffId: id }),
      }}
    />
  );
}

/** Seated worker at a workstation (desk at p, rot). */
function Seated({ p, rot = 0, i }: { p: V3; rot?: number; i: number }) {
  const s = Math.sin(rot);
  const c = Math.cos(rot);
  return <Character p={[p[0] + s * 0.66, 0, p[2] + c * 0.66]} rot={rot + Math.PI} look={extra(i)} pose="type" seed={i + 3} />;
}

function Rug({ p, s, color }: { p: V3; s: [number, number]; color: string }) {
  return (
    <mesh position={[p[0], 0.012, p[2]]} rotation={[-Math.PI / 2, 0, 0]} material={colorMat(color, 1)} receiveShadow>
      <planeGeometry args={s} />
    </mesh>
  );
}

function PendantRing({ p, r = 1.2 }: { p: V3; r?: number }) {
  const m = M();
  return (
    <group position={p}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.tealGlow}>
        <torusGeometry args={[r, 0.035, 8, 64]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * r, (9 - p[1]) / 2, Math.sin((i / 3) * Math.PI * 2) * r]} material={m.metalDark}>
          <cylinderGeometry args={[0.005, 0.005, 9 - p[1], 4]} />
        </mesh>
      ))}
    </group>
  );
}

function Whiteboard({ p, rot = 0, w = 2.4, notes = 14, seed = 1 }: { p: V3; rot?: number; w?: number; notes?: number; seed?: number }) {
  const m = M();
  const colors = ["#FFE066", "#A8F0D3", "#FFB3C1", "#9AD1FF"];
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <B p={[0, 0, 0]} s={[w, 1.25, 0.04]} m={m.white} />
      <B p={[0, -0.66, 0.04]} s={[w, 0.04, 0.08]} m={m.metal} />
      {Array.from({ length: notes }, (_, i) => (
        <B key={i} p={[-w / 2 + 0.25 + ((i * 0.37 + seed) % (w - 0.5)), 0.4 - Math.floor(i / 5) * 0.32, 0.025]} s={[0.16, 0.16, 0.005]} m={colorMat(colors[(i + seed) % 4], 0.8)} cast={false} />
      ))}
    </group>
  );
}

// ── Reception ──────────────────────────────────────────────────────────────
export function Reception() {
  const m = M();
  const dir = useMemo(() => screenMat("directory", directoryTexture(), 1), []);
  const kiosk = useMemo(() => screenMat("kiosk", signTexture("Book a", { w: 512, h: 512, sub: "CONSULTATION →", bg: "#0B2233", fg: "#FFFFFF" }), 1), []);
  return (
    <group>
      {/* Reception desk */}
      <group position={[0, 0, -9.3]}>
        <RoundedBox args={[5.2, 1.1, 0.75]} radius={0.06} position={[0, 0.55, 0]} material={m.wood} castShadow receiveShadow />
        <B p={[0, 1.13, 0.05]} s={[5.4, 0.06, 0.9]} m={m.white} />
        <B p={[0, 0.12, 0.39]} s={[5.0, 0.04, 0.02]} m={m.tealGlow} cast={false} />
        <B p={[0, 0.74, -0.75]} s={[5.0, 0.04, 0.7]} m={m.white} />
        <Monitor p={[-1.2, 0.76, -0.85]} rot={Math.PI} kind="off" />
        <Monitor p={[1.2, 0.76, -0.85]} rot={Math.PI} kind="off" />
        <mesh position={[2.2, 1.3, 0.1]} material={m.chrome}>
          <cylinderGeometry args={[0.07, 0.07, 0.25, 16]} />
        </mesh>
      </group>
      <Guide id="aanya-reception" />
      {/* Lounge */}
      <Rug p={[-6.2, 0, -4.5]} s={[5.2, 4]} color="#D8D2C6" />
      <Sofa p={[-6.2, 0, -6.1]} color="#4E6E73" />
      <Sofa p={[-6.2, 0, -2.9]} rot={Math.PI} color="#4E6E73" />
      <B p={[-6.2, 0.22, -4.5]} s={[1.4, 0.06, 0.8]} m={m.woodDark} />
      <B p={[-6.2, 0.1, -4.5]} s={[1.2, 0.2, 0.6]} m={m.metalDark} cast={false} />
      <Character p={[-6.7, 0, -6.0]} look={extra(4)} pose="sit" seed={11} />
      <Plant p={[-9.2, 0, -1.2]} s={1.4} />
      <Plant p={[-9.2, 0, -12.8]} s={1.6} />
      <Plant p={[9.2, 0, -1.2]} s={1.4} />
      {/* Directory totem */}
      <group position={[7.6, 0, -3.8]} rotation={[0, -0.75, 0]}>
        <B p={[0, 1.15, -0.06]} s={[1.05, 2.3, 0.12]} m={m.metalDark} />
        <mesh position={[0, 1.25, 0.005]} material={dir}>
          <planeGeometry args={[0.9, 1.5]} />
        </mesh>
      </group>
      {/* Booking kiosk */}
      <group position={[-3.2, 0, -8.6]} rotation={[0, 0.5, 0]}>
        <B p={[0, 0.5, 0]} s={[0.12, 1.0, 0.12]} m={m.metalDark} />
        <B p={[0, 0.02, 0]} s={[0.5, 0.04, 0.5]} m={m.metalDark} cast={false} />
        <mesh position={[0, 1.12, 0.03]} rotation={[-0.35, 0, 0]} material={kiosk}>
          <planeGeometry args={[0.5, 0.5]} />
        </mesh>
      </group>
      {/* Feature stair to the mezzanine */}
      {Array.from({ length: 16 }, (_, i) => (
        <B key={i} p={[8.6, 0.14 + i * 0.28, -6.6 - i * 0.34]} s={[1.6, 0.06, 0.36]} m={m.wood} />
      ))}
      <Slab min={[7.75, 0, -12.3]} max={[7.8, 5.4, -6.4]} m={m.glass} cast={false} />
      <Slab min={[6.6, 4.5, -14]} max={[10, 4.8, -11.8]} m={m.plaster} />
      <Slab min={[6.6, 4.8, -11.85]} max={[10, 5.8, -11.8]} m={m.glass} cast={false} />
      <PendantRing p={[0, 6.4, -7]} r={2.2} />
      <PendantRing p={[0, 7.1, -7]} r={1.4} />
      {/* Visitor walking to the desk */}
      <Character p={[2.6, 0, -7.4]} rot={Math.PI - 0.2} look={extra(2)} seed={7} />
    </group>
  );
}

// ── Software floor ─────────────────────────────────────────────────────────
export function SoftwareFloor() {
  const m = M();
  const review = useMemo(() => screenMat("review", designTexture(2), 1), []);
  const pods: [number, number][] = [];
  for (const x of [17.6, 21.6, 25.6]) for (const z of [-5.0, -11.8]) pods.push([x, z]);
  let k = 0;
  return (
    <group>
      {pods.map(([x, z], pi) => (
        <group key={pi}>
          {[-0.82, 0.82].map((dx, j) => {
            const i = k++;
            return (
              <group key={j}>
                <Workstation p={[x + dx, 0, z]} kind="code" seed={i} dual={j === 0} />
                {i % 4 !== 3 && <Seated p={[x + dx, 0, z]} i={i} />}
                <Workstation p={[x + dx, 0, z - 1.6]} rot={Math.PI} kind={i % 2 ? "design" : "code"} seed={i + 7} />
                {i % 3 !== 1 && <Seated p={[x + dx, 0, z - 1.6]} rot={Math.PI} i={i + 2} />}
              </group>
            );
          })}
          <B p={[x, 1.02, z - 0.8]} s={[3.3, 0.5, 0.04]} m={m.fabricLight} />
        </group>
      ))}
      <Guide id="kabir-software" />
      {/* Design review corner */}
      <Screen p={[26.5, 2.0, -19.82]} w={3.2} h={1.8} mat={review} />
      <mesh position={[26.5, 0.37, -17.6]} material={m.white} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} />
      </mesh>
      <mesh position={[26.5, 0.18, -17.6]} material={m.metalDark}>
        <cylinderGeometry args={[0.05, 0.25, 0.36, 12]} />
      </mesh>
      <Character p={[25.2, 0, -17.2]} rot={2.4} look={extra(5)} seed={21} />
      <Character p={[27.6, 0, -16.9]} rot={-2.5} look={extra(1)} seed={22} />
      {/* Whiteboard + kanban on the east wall */}
      <Whiteboard p={[29.85, 1.7, -9]} rot={-Math.PI / 2} w={3.6} notes={18} seed={2} />
      <Whiteboard p={[29.85, 1.7, -4]} rot={-Math.PI / 2} w={2.6} notes={10} seed={5} />
      {/* Coffee point */}
      <B p={[12, 0.45, -18.9]} s={[2.6, 0.9, 0.7]} m={m.woodDark} />
      <B p={[11.6, 1.1, -18.9]} s={[0.4, 0.4, 0.35]} m={m.metalDark} />
      <Plant p={[13.6, 0, -19.2]} />
      <Plant p={[29.2, 0, -1]} s={1.3} />
      <Plant p={[10.8, 0, -1]} s={1.2} kind="bush" />
    </group>
  );
}

// ── Marketing command room ─────────────────────────────────────────────────
export function MarketingRoom() {
  const m = M();
  const wall = useMemo(() => screenMat("mkwall", dashboardTexture("wall", 1), 1.05), []);
  const cal = useMemo(() => screenMat("mkcal", dashboardTexture("social", 2), 1), []);
  const desks: [number, number][] = [];
  for (const x of [-17, -21, -25]) for (const z of [-5, -13]) desks.push([x, z]);
  const kinds = ["seo", "ads", "ads", "funnel", "social", "funnel"] as const;
  return (
    <group>
      {/* Video wall */}
      <group position={[-29.82, 2.7, -9]} rotation={[0, Math.PI / 2, 0]}>
        <B p={[0, 0, -0.06]} s={[10.4, 3.4, 0.08]} m={m.black} />
        <mesh material={wall}>
          <planeGeometry args={[10, 3.0]} />
        </mesh>
        {[-10 / 6, 10 / 6].map((x) => (
          <B key={x} p={[x, 0, 0.005]} s={[0.02, 3.0, 0.01]} m={m.black} cast={false} />
        ))}
      </group>
      {desks.map(([x, z], i) => (
        <group key={i}>
          {[-0.85, 0.85].map((dz, j) => (
            <group key={j}>
              <Workstation p={[x, 0, z + dz]} rot={Math.PI / 2} kind={kinds[(i + j) % kinds.length]} seed={i + j} dual={j === 1} />
              {(i + j) % 3 !== 2 && <Seated p={[x, 0, z + dz]} rot={Math.PI / 2} i={i * 2 + j + 1} />}
            </group>
          ))}
        </group>
      ))}
      <Guide id="meera-marketing" />
      {/* Manager at the wall */}
      <Character p={[-27.4, 0, -6.4]} rot={-1.9} look={extra(6)} seed={31} />
      {/* Content calendar board */}
      <Screen p={[-26.5, 1.75, -19.82]} w={2.4} h={1.5} mat={cal} />
      <Whiteboard p={[-21.5, 1.7, -19.84]} w={3} notes={16} seed={3} />
      <Plant p={[-11, 0, -19]} s={1.3} />
      <Plant p={[-29, 0, -1.2]} s={1.4} />
      <Sofa p={[-13, 0, -17.5]} rot={Math.PI / 2} color="#7A6A58" w={1.8} />
    </group>
  );
}

// ── Creative studio ────────────────────────────────────────────────────────
function Softbox({ p, rot }: { p: V3; rot: number }) {
  const m = M();
  return (
    <group position={p} rotation={[0, rot, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * 0.4, 0.04, Math.sin((i / 3) * Math.PI * 2) * 0.4]} rotation={[0, 0, 0]} material={m.metalDark}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, 1.0, 0]} material={m.metalDark}>
        <cylinderGeometry args={[0.02, 0.03, 2, 6]} />
      </mesh>
      <group position={[0, 2.05, 0]} rotation={[0.25, 0, 0]}>
        <B p={[0, 0, -0.2]} s={[0.9, 0.9, 0.4]} m={m.black} />
        <mesh position={[0, 0, 0.005]} material={m.lightPanel}>
          <planeGeometry args={[0.82, 0.82]} />
        </mesh>
      </group>
    </group>
  );
}

export function CreativeStudio() {
  const m = M();
  const brand = useMemo(() => screenMat("brand", brandWallTexture(), 0.85), []);
  const mood = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => screenMat(`mood${i}`, designTexture(i + 10), 0.9)), []);
  return (
    <group>
      {/* Cyclorama */}
      <group position={[-25.5, 0, -35]}>
        <Slab min={[-3, 0.01, -3.6]} max={[3.4, 0.03, 2]} m={m.white} cast={false} />
        <Slab min={[-3, 0, -3.8]} max={[3.4, 4.2, -3.6]} m={m.white} />
        <mesh position={[0.2, 0.6, -3.0]} rotation={[0, 0, Math.PI / 2]} material={m.white}>
          <cylinderGeometry args={[0.6, 0.6, 6.4, 24, 1, true, Math.PI, Math.PI / 2]} />
        </mesh>
        <B p={[0.2, 0.45, -1.2]} s={[0.7, 0.9, 0.7]} m={m.white} />
        <mesh position={[0.2, 1.05, -1.2]} material={m.teal} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.3, 24]} />
        </mesh>
      </group>
      <Softbox p={[-22.6, 0, -33.2]} rot={-2.3} />
      <Softbox p={[-28.4, 0, -32.6]} rot={2.4} />
      {/* Camera on tripod */}
      <group position={[-23.5, 0, -30]} rotation={[0, -2.6, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * 0.22, 0.7, Math.sin((i / 3) * Math.PI * 2) * 0.22]} rotation={[Math.sin((i / 3) * Math.PI * 2) * 0.3, 0, -Math.cos((i / 3) * Math.PI * 2) * 0.3]} material={m.metalDark}>
            <cylinderGeometry args={[0.015, 0.015, 1.45, 6]} />
          </mesh>
        ))}
        <B p={[0, 1.48, 0]} s={[0.2, 0.14, 0.12]} m={m.black} />
        <mesh position={[0, 1.48, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={m.black}>
          <cylinderGeometry args={[0.05, 0.05, 0.14, 16]} />
        </mesh>
      </group>
      <Character p={[-23.0, 0, -29.3]} rot={-2.6} look={extra(3)} seed={41} />
      {/* Brand wall on the north wall */}
      <Screen p={[-20, 2.1, -20.17]} rot={[0, Math.PI, 0]} w={7.5} h={2.8} mat={brand} frame={0.02} />
      <group position={[-20, 0, -20.17]} rotation={[0, Math.PI, 0]}>
        <Screen p={[-5.6, 2.1, 0]} w={2.4} h={1.6} mat={screenMat("brandid", signTexture("Aa", { w: 512, h: 340, sub: "IDENTITY STUDY · SAMPLE", bg: "#07111F" }), 0.9)} />
      </group>
      {/* Editing bays */}
      {[-14.5, -18.5].map((x, i) => (
        <group key={x}>
          <Workstation p={[x, 0, -36.2]} kind="design" seed={i + 2} dual />
          <Seated p={[x, 0, -36.2]} i={i + 5} />
        </group>
      ))}
      <B p={[-16.5, 1.4, -39.85]} s={[6, 2.8, 0.05]} m={colorMat("#1C2026", 0.95)} cast={false} />
      {/* Ad creative moodboard on west wall */}
      <group position={[-29.83, 1.9, -26]} rotation={[0, Math.PI / 2, 0]}>
        <B p={[0, 0, -0.02]} s={[3.4, 1.9, 0.03]} m={m.fabricLight} />
        {mood.map((mt, i) => (
          <mesh key={i} position={[-1.1 + (i % 3) * 1.1, 0.45 - Math.floor(i / 3) * 0.9, 0.005]} material={mt}>
            <planeGeometry args={[0.95, 0.6]} />
          </mesh>
        ))}
      </group>
      <Guide id="rohan-creative" />
      <Sofa p={[-12.4, 0, -31]} rot={-Math.PI / 2} color="#B0563A" w={2.2} />
      <Plant p={[-11, 0, -39]} s={1.4} />
    </group>
  );
}

// ── AI & automation lab ────────────────────────────────────────────────────
export function AutomationLab() {
  const m = M();
  const flow = useMemo(() => screenMat("workflow", workflowTexture(), 1.05), []);
  return (
    <group>
      <group position={[29.82, 2.55, -30]} rotation={[0, -Math.PI / 2, 0]}>
        <B p={[0, 0, -0.05]} s={[8.4, 3.4, 0.06]} m={m.black} />
        <mesh material={flow}>
          <planeGeometry args={[8, 3.0]} />
        </mesh>
      </group>
      {[18, 22, 26].map((x, i) =>
        [-27, -34].map((z, j) => (
          <group key={`${x}${z}`}>
            <Workstation p={[x, 0, z]} kind={j ? "code" : (["funnel", "code", "seo"] as const)[i]} seed={i * 2 + j + 3} dual={(i + j) % 2 === 0} />
            {(i + j) % 3 !== 2 && <Seated p={[x, 0, z]} i={i + j * 3 + 2} />}
          </group>
        )),
      )}
      <Guide id="ira-automation" />
      <Character p={[28.2, 0, -28.4]} rot={-1.3} look={extra(0)} seed={51} />
      {/* Server cabinet */}
      <group position={[28.6, 0, -38.6]}>
        <B p={[0, 1.0, 0]} s={[1.0, 2.0, 0.9]} m={m.metalDark} />
        {Array.from({ length: 12 }, (_, i) => (
          <B key={i} p={[-0.3 + (i % 4) * 0.2, 0.4 + Math.floor(i / 4) * 0.5, 0.46]} s={[0.05, 0.02, 0.01]} m={m.tealGlow} cast={false} />
        ))}
      </group>
      <Whiteboard p={[20, 1.7, -39.84]} w={4} notes={12} seed={7} />
      <Plant p={[11, 0, -39]} s={1.4} />
      <Plant p={[29, 0, -21]} s={1.2} kind="bush" />
    </group>
  );
}

// ── Strategy boardroom ─────────────────────────────────────────────────────
export function StrategyRoom() {
  const m = M();
  const gal = useMemo(() => screenMat("gallery", galleryTexture(), 1), []);
  const tablet = useMemo(() => screenMat("proposal", signTexture("Request", { w: 512, h: 380, sub: "A PROPOSAL →", bg: "#0B2233" }), 1), []);
  return (
    <group>
      <Screen p={[0, 2.2, -39.82]} w={8} h={4} mat={gal} />
      {/* Table */}
      <RoundedBox args={[6.4, 0.08, 1.8]} radius={0.04} position={[0, 0.76, -33]} material={m.woodDark} castShadow receiveShadow />
      {[-2.6, 2.6].map((x) => (
        <B key={x} p={[x, 0.37, -33]} s={[0.12, 0.74, 1.2]} m={m.metalDark} />
      ))}
      {[-2.4, -1.2, 0, 1.2, 2.4].flatMap((x) => [
        <Chair key={`a${x}`} p={[x, 0, -31.8]} rot={Math.PI} color="#1F2933" />,
        <Chair key={`b${x}`} p={[x, 0, -34.2]} color="#1F2933" />,
      ])}
      <mesh position={[-3, 0.86, -33]} rotation={[-0.5, 0.4, 0]} material={tablet}>
        <planeGeometry args={[0.42, 0.31]} />
      </mesh>
      <B p={[0, 3.5, -33]} s={[5, 0.05, 0.25]} m={m.lightPanel} cast={false} />
      <Character p={[-1.2, 0, -31.75]} rot={Math.PI} look={extra(1)} pose="sit" seed={61} />
      <Character p={[1.2, 0, -34.25]} look={extra(4)} pose="sit" seed={62} />
      <Guide id="dev-strategy" />
      {/* Credenza */}
      <B p={[-9.4, 0.4, -33]} s={[0.6, 0.8, 5]} m={m.wood} />
      <Plant p={[-9.3, 0.8, -31]} s={0.9} kind="bush" />
      <Plant p={[9.2, 0, -39]} s={1.5} />
      <Plant p={[-9.2, 0, -39]} s={1.5} />
    </group>
  );
}

// ── Rooftop terrace ────────────────────────────────────────────────────────
export function Rooftop() {
  const m = M();
  const deckY = 9.3;
  const lights = useMemo(() => {
    const pts: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push([-14 + t * 28, deckY + 3.1 - Math.sin(t * Math.PI * 4) * 0.25, -16]);
    }
    return pts;
  }, []);
  return (
    <group>
      {/* Decking around the skylight */}
      <Slab min={[-16, deckY, -30]} max={[16, deckY + 0.08, -12.5]} m={m.oakFloor} cast={false} />
      <Slab min={[-16, deckY, -12.5]} max={[-4.6, deckY + 0.08, -1]} m={m.oakFloor} cast={false} />
      <Slab min={[4.6, deckY, -12.5]} max={[16, deckY + 0.08, -1]} m={m.oakFloor} cast={false} />
      <Slab min={[-4.6, deckY, -3.4]} max={[4.6, deckY + 0.08, -1]} m={m.oakFloor} cast={false} />
      {/* Glass balustrade on the front edge */}
      <Slab min={[-30, deckY + 0.5, -0.1]} max={[30, deckY + 1.6, -0.05]} m={m.glass} cast={false} />
      <Slab min={[-30, deckY + 1.6, -0.14]} max={[30, deckY + 1.66, 0]} m={m.chrome} cast={false} />
      {/* Planters with trees */}
      {[-14, -9, 9, 14].map((x) => (
        <group key={x} position={[x, deckY, -2.4]}>
          <B p={[0, 0.45, 0]} s={[2.4, 0.9, 1.0]} m={m.concreteDark} />
          <mesh position={[0, 1.6, 0]} material={m.foliage} castShadow>
            <icosahedronGeometry args={[0.85, 1]} />
          </mesh>
          <mesh position={[0, 1.0, 0]} material={m.bark}>
            <cylinderGeometry args={[0.05, 0.07, 0.6, 6]} />
          </mesh>
        </group>
      ))}
      {/* Lounge */}
      <group position={[-8, deckY, -8]}>
        <Sofa p={[0, 0, 0]} rot={Math.PI} color="#D9D2C3" w={2.6} />
        <Sofa p={[2.2, 0, -1.6]} rot={-Math.PI / 2} color="#D9D2C3" w={1.8} />
        <B p={[0, 0.25, -1.6]} s={[1.6, 0.06, 0.9]} m={m.wood} />
      </group>
      <group position={[8, deckY, -8]}>
        <Sofa p={[0, 0, 0]} rot={Math.PI} color="#D9D2C3" w={2.6} />
        <B p={[0, 0.25, -1.6]} s={[1.6, 0.06, 0.9]} m={m.wood} />
      </group>
      {/* Pergola + string lights */}
      {[-14, 14].map((x) => (
        <B key={x} p={[x, deckY + 1.6, -16]} s={[0.15, 3.2, 0.15]} m={m.woodDark} />
      ))}
      <B p={[0, deckY + 3.25, -16]} s={[28.3, 0.12, 0.15]} m={m.woodDark} />
      {lights.map((p, i) => (
        <mesh key={i} position={p} material={m.warmLight}>
          <sphereGeometry args={[0.06, 8, 6]} />
        </mesh>
      ))}
      {/* Solar array */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[-21 + i * 6, deckY + 0.6, -35]} rotation={[-0.45, 0, 0]}>
          <B p={[0, 0, 0]} s={[5.4, 0.05, 3.2]} m={colorMat("#1B2A3A", 0.25)} />
        </group>
      ))}
      <Character p={[-8.4, deckY, -8.1]} rot={Math.PI} look={extra(2)} pose="sit" seed={71} />
      <Character p={[10.5, deckY, -5.2]} rot={2.6} look={extra(5)} seed={72} />
    </group>
  );
}

export const ZONES = {
  reception: Reception,
  software: SoftwareFloor,
  marketing: MarketingRoom,
  creative: CreativeStudio,
  automation: AutomationLab,
  strategy: StrategyRoom,
  rooftop: Rooftop,
} as const;
