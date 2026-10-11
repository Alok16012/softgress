"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProjectBrief } from "@/lib/types";
import { emptyBrief } from "@/lib/leads/schema";
import type { BriefSuggestion } from "@/lib/ai/tools";

interface BriefStore {
  brief: ProjectBrief;
  updatedAt: number | null;
  set: (patch: Partial<ProjectBrief>) => void;
  apply: (s: BriefSuggestion) => string[];
  reset: () => void;
}

const merge = (a: string[], b: string[] = []) => [...new Set([...a, ...b])];

/** Temporary draft brief: lives in sessionStorage only until the visitor submits it. */
export const useBrief = create<BriefStore>()(
  persist(
    (set, get) => ({
      brief: emptyBrief(),
      updatedAt: null,
      set: (patch) => set({ brief: { ...get().brief, ...patch }, updatedAt: Date.now() }),
      apply: (s) => {
        const b = get().brief;
        const next: ProjectBrief = {
          ...b,
          projectType: s.projectType ?? b.projectType,
          serviceSlugs: merge(b.serviceSlugs, s.serviceSlugs),
          goals: s.goals ?? b.goals,
          features: merge(b.features, s.features),
          platforms: merge(b.platforms, s.platforms),
          budget: s.budget ?? b.budget,
          targetDate: s.targetDate ?? b.targetDate,
          industry: s.industry ?? b.industry,
        };
        set({ brief: next, updatedAt: Date.now() });
        return Object.keys(s);
      },
      reset: () => set({ brief: emptyBrief(), updatedAt: null }),
    }),
    { name: "sg:brief", storage: createJSONStorage(() => sessionStorage), version: 1 },
  ),
);

export function briefIsEmpty(b: ProjectBrief) {
  return !b.projectType && !b.serviceSlugs.length && !b.goals && !b.scope && !b.features.length && !b.platforms.length && !b.budget && !b.targetDate && !b.industry && !b.notes;
}
