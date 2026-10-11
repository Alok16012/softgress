"use client";
import { create } from "zustand";
import { initialTourState, tourReducer, type TourEvent, type TourState } from "@/lib/tour/machine";

export type Quality = "low" | "medium" | "high";

interface Prefs {
  quality: Quality;
  autoQuality: boolean;
  captions: boolean;
  sound: boolean;
  reducedMotion: boolean;
  view: "3d" | "2d";
}

interface TourStore {
  state: TourState;
  dispatch: (e: TourEvent) => void;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
}

const PREFS_KEY = "sg:prefs";

function loadPrefs(): Partial<Prefs> {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export const useTour = create<TourStore>((set, get) => ({
  state: initialTourState(),
  dispatch: (e) => {
    const prev = get().state;
    const next = tourReducer(prev, e);
    if (next !== prev) set({ state: next });
  },
  prefs: { quality: "high", autoQuality: true, captions: true, sound: false, reducedMotion: false, view: "3d" },
  setPrefs: (p) => {
    const prefs = { ...get().prefs, ...p };
    set({ prefs });
    try {
      // UI conveniences only (no tracking): stored locally on this device.
      const { quality, autoQuality, captions, sound, view } = prefs;
      localStorage.setItem(PREFS_KEY, JSON.stringify({ quality, autoQuality, captions, sound, view }));
    } catch {
      /* storage unavailable */
    }
  },
}));

export function hydratePrefs(systemReducedMotion: boolean, suggested: Quality, webgl: boolean, softwareGl = false) {
  const stored = loadPrefs();
  useTour.getState().setPrefs({
    ...stored,
    reducedMotion: systemReducedMotion,
    quality: softwareGl ? "low" : stored.autoQuality === false && stored.quality ? stored.quality : suggested,
    // Without GPU acceleration default to 2D; an explicit earlier choice of 3D is respected.
    view: !webgl ? "2d" : softwareGl ? (stored.view === "3d" ? "3d" : "2d") : (stored.view ?? "3d"),
  });
}
