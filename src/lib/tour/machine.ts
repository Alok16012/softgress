// Deterministic tour state machine (pure reducer). Every input surface — 3D hotspots,
// 2D navigator, keyboard, URL back/forward — dispatches these events, so camera
// animations can never conflict.
import type { SceneId } from "@/lib/types";
import { GUIDED_ORDER } from "./scenes";
import { staffById } from "@/content/staff";

export type TourMode = "guided" | "free" | "direct";
export type Phase = "intro" | "entry" | "idle" | "transit" | "dialogue" | "panel";

export type PanelRef =
  | { type: "service"; slug: string }
  | { type: "request"; kind: "quote" | "consultation" | "callback" | "brief" }
  | { type: "brief" }
  | { type: "search" }
  | { type: "info"; panel: "gallery" | "workflow" | "showcase" | "directory" | "dashboard" };

export interface TourState {
  phase: Phase;
  mode: TourMode | null;
  scene: SceneId;
  /** Destination while in transit. */
  target: SceneId | null;
  /** Latest navigation request received during transit (replaces older ones). */
  queued: SceneId | null;
  /** Staff to open a dialogue with once we arrive. */
  pendingTalk: string | null;
  staffId: string | null;
  panel: PanelRef | null;
  /** Phase to return to when a panel closes. */
  panelReturn: "idle" | "dialogue";
  /** Monotonic counter: increments every time a new transit starts. */
  transitId: number;
}

export type TourEvent =
  | { type: "INTRO_DONE" }
  | { type: "SKIP_INTRO" }
  | { type: "CHOOSE_MODE"; mode: TourMode }
  | { type: "GO"; scene: SceneId }
  | { type: "JUMP"; scene: SceneId }
  | { type: "ARRIVED"; transitId: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "TALK"; staffId: string }
  | { type: "END_TALK" }
  | { type: "OPEN_PANEL"; panel: PanelRef }
  | { type: "CLOSE_PANEL" }
  | { type: "RESET" };

export const initialTourState = (overrides: Partial<TourState> = {}): TourState => ({
  phase: "intro",
  mode: null,
  scene: "campus",
  target: null,
  queued: null,
  pendingTalk: null,
  staffId: null,
  panel: null,
  panelReturn: "idle",
  transitId: 0,
  ...overrides,
});

function startTransit(s: TourState, scene: SceneId, pendingTalk: string | null = null): TourState {
  if (scene === s.scene) {
    const base = { ...s, phase: "idle" as Phase, target: null, queued: null, staffId: null, panel: null, pendingTalk: null };
    return pendingTalk ? { ...base, phase: "dialogue", staffId: pendingTalk } : base;
  }
  return {
    ...s,
    phase: "transit",
    target: scene,
    queued: null,
    pendingTalk,
    staffId: null,
    panel: null,
    transitId: s.transitId + 1,
  };
}

export function stepIndex(scene: SceneId) {
  return GUIDED_ORDER.indexOf(scene);
}

export function tourReducer(s: TourState, e: TourEvent): TourState {
  switch (e.type) {
    case "INTRO_DONE":
    case "SKIP_INTRO":
      return s.phase === "intro" ? { ...s, phase: "entry", scene: "campus" } : s;

    case "CHOOSE_MODE": {
      if (s.phase !== "entry" && s.phase !== "idle") return s;
      const next = { ...s, mode: e.mode, phase: "idle" as Phase };
      if (e.mode === "guided") return startTransit(next, s.scene === "campus" ? "reception" : s.scene);
      if (e.mode === "direct") return { ...next, phase: "panel", panel: { type: "search" }, panelReturn: "idle" };
      return next;
    }

    case "GO": {
      if (s.phase === "intro" || s.phase === "entry") {
        return startTransit({ ...s, mode: s.mode ?? "free", phase: "idle" }, e.scene);
      }
      if (s.phase === "transit") {
        if (e.scene === s.target) return { ...s, queued: null };
        return { ...s, queued: e.scene, pendingTalk: null };
      }
      return startTransit(s, e.scene);
    }

    case "JUMP":
      // Instant relocation (deep links, reduced-motion recovery). Cancels any transit.
      return {
        ...s,
        phase: "idle",
        mode: s.mode ?? "free",
        scene: e.scene,
        target: null,
        queued: null,
        pendingTalk: null,
        staffId: null,
        panel: null,
        transitId: s.transitId + 1,
      };

    case "ARRIVED": {
      if (s.phase !== "transit" || e.transitId !== s.transitId || !s.target) return s;
      const arrived: TourState = { ...s, scene: s.target, target: null };
      if (s.queued && s.queued !== arrived.scene) {
        return startTransit({ ...arrived, phase: "idle" }, s.queued);
      }
      if (s.pendingTalk) {
        return { ...arrived, phase: "dialogue", staffId: s.pendingTalk, pendingTalk: null, queued: null };
      }
      return { ...arrived, phase: "idle", queued: null };
    }

    case "NEXT":
    case "PREV": {
      if (s.phase === "intro" || s.phase === "entry") return s;
      const from = s.phase === "transit" && s.target ? s.target : s.scene;
      const i = stepIndex(from);
      const j = Math.min(GUIDED_ORDER.length - 1, Math.max(0, i + (e.type === "NEXT" ? 1 : -1)));
      if (j === i) return s;
      return tourReducer(s, { type: "GO", scene: GUIDED_ORDER[j] });
    }

    case "TALK": {
      const staff = staffById.get(e.staffId);
      if (!staff || s.phase === "intro") return s;
      if (s.phase === "transit") {
        return staff.sceneId === s.target ? { ...s, pendingTalk: e.staffId, queued: null } : { ...s, queued: staff.sceneId, pendingTalk: null };
      }
      if (staff.sceneId !== s.scene) {
        return startTransit({ ...s, mode: s.mode ?? "free" }, staff.sceneId, e.staffId);
      }
      return { ...s, mode: s.mode ?? "free", phase: "dialogue", staffId: e.staffId, panel: null };
    }

    case "END_TALK":
      if (s.phase === "dialogue") return { ...s, phase: "idle", staffId: null };
      if (s.phase === "panel" && s.panelReturn === "dialogue") return { ...s, panelReturn: "idle", staffId: null };
      return s;

    case "OPEN_PANEL": {
      if (s.phase === "intro" || s.phase === "transit") return s;
      const ret = s.phase === "dialogue" ? "dialogue" : s.phase === "panel" ? s.panelReturn : "idle";
      return { ...s, mode: s.mode ?? "free", phase: "panel", panel: e.panel, panelReturn: ret };
    }

    case "CLOSE_PANEL":
      if (s.phase !== "panel") return s;
      return { ...s, phase: s.panelReturn === "dialogue" && s.staffId ? "dialogue" : "idle", panel: null, panelReturn: "idle" };

    case "RESET":
      return initialTourState({ phase: "entry" });
  }
}
