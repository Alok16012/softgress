"use client";
import { useCallback } from "react";
import type { Hotspot } from "@/lib/tour/scenes";
import { useTour } from "@/stores/tour";

/** Single source of truth for what a hotspot does — shared by 3D markers and the 2D navigator. */
export function useHotspotAction() {
  const dispatch = useTour((s) => s.dispatch);
  return useCallback(
    (a: Hotspot["action"]) => {
      switch (a.type) {
        case "talk":
          dispatch({ type: "TALK", staffId: a.staffId });
          break;
        case "go":
          dispatch({ type: "GO", scene: a.scene });
          break;
        case "service":
          dispatch({ type: "OPEN_PANEL", panel: { type: "service", slug: a.slug } });
          break;
        case "panel":
          dispatch({ type: "OPEN_PANEL", panel: { type: "info", panel: a.panel } });
          break;
        case "request":
          dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: a.kind } });
          break;
      }
    },
    [dispatch],
  );
}
