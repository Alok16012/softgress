"use client";
// Screen-space anchoring for DOM labels: a projector inside the Canvas writes CSS
// transforms directly onto registered elements each frame (no React re-renders,
// no per-label React roots).
import { create } from "zustand";

type Vec3 = [number, number, number];

interface Anchor {
  el: HTMLElement;
  pos: Vec3;
}

const anchors = new Map<string, Anchor>();

export function registerAnchor(id: string, pos: Vec3, el: HTMLElement | null) {
  if (el) anchors.set(id, { el, pos });
  else anchors.delete(id);
}

export function allAnchors() {
  return anchors;
}

/** Which AI guide the pointer is over (drives the "Talk to …" tag). */
export const useStaffHover = create<{ id: string | null; set: (id: string | null) => void }>((set) => ({
  id: null,
  set: (id) => set({ id }),
}));
