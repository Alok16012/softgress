"use client";
import { Bot, Building2, Code2, Megaphone, Palette, Presentation, Sunset, Trees } from "lucide-react";
import { useEffect } from "react";
import { staffById } from "@/content/staff";
import { GUIDED_ORDER, SCENES } from "@/lib/tour/scenes";
import type { SceneId } from "@/lib/types";
import { useTour } from "@/stores/tour";
import { useHotspotAction } from "./useHotspotAction";

const ICONS: Record<SceneId, typeof Code2> = {
  campus: Trees,
  reception: Building2,
  software: Code2,
  marketing: Megaphone,
  creative: Palette,
  automation: Bot,
  strategy: Presentation,
  rooftop: Sunset,
};
const TINT: Record<SceneId, string> = {
  campus: "from-[#2E5E3E] to-[#0B2233]",
  reception: "from-[#3A4A5A] to-[#07111F]",
  software: "from-[#1E3A5F] to-[#07111F]",
  marketing: "from-[#3B2F5E] to-[#07111F]",
  creative: "from-[#5E3B2F] to-[#07111F]",
  automation: "from-[#1E5F5C] to-[#07111F]",
  strategy: "from-[#4A4030] to-[#07111F]",
  rooftop: "from-[#C2643A] to-[#2B1B33]",
};

/**
 * Lightweight 2D scene navigator for weak devices, no-WebGL browsers or by choice.
 * Uses the same state machine and hotspot actions as the 3D office.
 */
export function Navigator2D({ introVideo = false }: { introVideo?: boolean }) {
  const st = useTour((s) => s.state);
  const dispatch = useTour((s) => s.dispatch);
  const run = useHotspotAction();

  // No camera here: transitions complete immediately; no intro animation.
  useEffect(() => {
    if (st.phase === "transit") dispatch({ type: "ARRIVED", transitId: st.transitId });
    // With a pre-rendered intro available, the video handles the intro phase.
    if (st.phase === "intro" && !introVideo) dispatch({ type: "SKIP_INTRO" });
  }, [st.phase, st.transitId, dispatch, introVideo]);

  const scene = SCENES[st.scene];
  const Icon = ICONS[st.scene];
  return (
    <div className="absolute inset-0 overflow-y-auto bg-midnight pt-20 pb-28 px-3 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Rooms" className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
          {GUIDED_ORDER.map((id) => {
            const I = ICONS[id];
            return (
              <button key={id} type="button" className="chip shrink-0" aria-current={st.scene === id ? "location" : undefined} aria-pressed={st.scene === id} onClick={() => dispatch({ type: "GO", scene: id })}>
                <I size={14} aria-hidden /> {SCENES[id].label}
              </button>
            );
          })}
        </nav>
        <section aria-labelledby="room-2d" className={`mt-4 rounded-3xl bg-gradient-to-br ${TINT[st.scene]} border border-white/10 p-6 sm:p-10 text-white`}>
          <Icon size={36} className="text-mint" aria-hidden />
          <h2 id="room-2d" className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
            {scene.label}
          </h2>
          <p className="mt-3 max-w-2xl text-white/85 text-lg">{scene.caption.en}</p>
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scene.hotspots.map((h) => {
              const staff = h.action.type === "talk" ? staffById.get(h.action.staffId) : null;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => run(h.action)}
                    className={`w-full h-full text-left rounded-2xl border p-4 transition hover:-translate-y-0.5 ${staff ? "border-teal bg-teal/15" : "border-white/15 bg-white/5 hover:border-white/35"}`}
                  >
                    <span className="text-xs uppercase tracking-wider text-white/55">
                      {h.kind === "staff" ? "AI guide" : h.kind === "door" ? "Go to" : h.kind === "service" ? "Service" : h.kind === "cta" ? "Next step" : "Interactive"}
                    </span>
                    <span className="mt-1 block font-semibold">{h.label}</span>
                    {staff && <span className="mt-1 block text-sm text-white/70">{staff.scope.split(".")[0]}.</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
