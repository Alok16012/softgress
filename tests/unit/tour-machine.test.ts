import { describe, it, expect } from "vitest";
import { initialTourState, tourReducer, type TourEvent, type TourState } from "@/lib/tour/machine";
import { SCENES, nodePath, railPoints, neighbours, GUIDED_ORDER } from "@/lib/tour/scenes";
import { staff } from "@/content/staff";

const run = (s: TourState, ...events: TourEvent[]) => events.reduce(tourReducer, s);
const arrive = (s: TourState) => tourReducer(s, { type: "ARRIVED", transitId: s.transitId });

describe("tour state machine", () => {
  it("intro → entry → guided starts at reception", () => {
    let s = run(initialTourState(), { type: "SKIP_INTRO" });
    expect(s.phase).toBe("entry");
    s = tourReducer(s, { type: "CHOOSE_MODE", mode: "guided" });
    expect(s).toMatchObject({ phase: "transit", target: "reception", mode: "guided" });
    s = arrive(s);
    expect(s).toMatchObject({ phase: "idle", scene: "reception", target: null });
  });

  it("intro is skippable and never gates navigation", () => {
    const s = tourReducer(initialTourState(), { type: "GO", scene: "software" });
    expect(s).toMatchObject({ phase: "transit", target: "software", mode: "free" });
  });

  it("navigation during transit queues only the latest target", () => {
    let s = run(initialTourState({ phase: "idle", scene: "reception", mode: "free" }), { type: "GO", scene: "software" });
    const id = s.transitId;
    s = run(s, { type: "GO", scene: "marketing" }, { type: "GO", scene: "creative" });
    expect(s).toMatchObject({ phase: "transit", target: "software", queued: "creative", transitId: id });
    s = arrive(s);
    expect(s).toMatchObject({ phase: "transit", scene: "software", target: "creative" });
    expect(s.transitId).toBe(id + 1);
    s = arrive(s);
    expect(s).toMatchObject({ phase: "idle", scene: "creative" });
  });

  it("ignores stale ARRIVED events from cancelled transits", () => {
    let s = run(initialTourState({ phase: "idle", scene: "reception", mode: "free" }), { type: "GO", scene: "software" });
    const stale = s.transitId;
    s = tourReducer(s, { type: "JUMP", scene: "marketing" });
    s = tourReducer(s, { type: "ARRIVED", transitId: stale });
    expect(s).toMatchObject({ phase: "idle", scene: "marketing" });
  });

  it("talking to staff in another scene travels first, then opens dialogue", () => {
    let s = tourReducer(initialTourState({ phase: "idle", scene: "reception", mode: "free" }), { type: "TALK", staffId: "kabir-software" });
    expect(s).toMatchObject({ phase: "transit", target: "software", pendingTalk: "kabir-software" });
    s = arrive(s);
    expect(s).toMatchObject({ phase: "dialogue", staffId: "kabir-software", scene: "software" });
  });

  it("navigating while chat is open closes the dialogue (conversation persists in the chat store)", () => {
    let s = tourReducer(initialTourState({ phase: "idle", scene: "software", mode: "free" }), { type: "TALK", staffId: "kabir-software" });
    expect(s.phase).toBe("dialogue");
    s = tourReducer(s, { type: "GO", scene: "automation" });
    expect(s).toMatchObject({ phase: "transit", staffId: null, target: "automation" });
  });

  it("panels return to the dialogue they were opened from", () => {
    let s = run(initialTourState({ phase: "idle", scene: "software", mode: "free" }), { type: "TALK", staffId: "kabir-software" }, {
      type: "OPEN_PANEL",
      panel: { type: "service", slug: "website-development" },
    });
    expect(s).toMatchObject({ phase: "panel", panelReturn: "dialogue", staffId: "kabir-software" });
    s = tourReducer(s, { type: "CLOSE_PANEL" });
    expect(s).toMatchObject({ phase: "dialogue", staffId: "kabir-software", panel: null });
  });

  it("panels cannot open mid-transit (no conflicting camera states)", () => {
    const s = run(initialTourState({ phase: "idle", scene: "reception", mode: "free" }), { type: "GO", scene: "software" }, {
      type: "OPEN_PANEL",
      panel: { type: "brief" },
    });
    expect(s.phase).toBe("transit");
  });

  it("NEXT/PREV follow the guided order and clamp at the ends", () => {
    let s = initialTourState({ phase: "idle", scene: "campus", mode: "guided" });
    s = tourReducer(s, { type: "PREV" });
    expect(s.phase).toBe("idle");
    for (let i = 1; i < GUIDED_ORDER.length; i++) {
      s = arrive(tourReducer(s, { type: "NEXT" }));
      expect(s.scene).toBe(GUIDED_ORDER[i]);
    }
    expect(tourReducer(s, { type: "NEXT" })).toBe(s);
  });

  it("direct mode opens service search", () => {
    const s = run(initialTourState(), { type: "SKIP_INTRO" }, { type: "CHOOSE_MODE", mode: "direct" });
    expect(s).toMatchObject({ phase: "panel", panel: { type: "search" } });
  });
});

describe("scene graph", () => {
  it("connects every scene", () => {
    for (const a of GUIDED_ORDER) for (const b of GUIDED_ORDER) {
      const p = nodePath(a, b);
      expect(p[0]).toBe(a);
      expect(p[p.length - 1]).toBe(b);
    }
  });

  it("routes between wings through doorways, not walls", () => {
    expect(nodePath("software", "marketing")).toEqual(["software", "eDoor", "lobby", "wDoor", "marketing"]);
    const pts = railPoints("software", "marketing");
    expect(pts.length).toBe(5);
  });

  it("binds every staff member to a scene hotspot", () => {
    for (const s of staff) {
      const hs = SCENES[s.sceneId].hotspots.find((h) => h.action.type === "talk" && h.action.staffId === s.id);
      expect(hs, s.id).toBeDefined();
    }
  });

  it("computes neighbours for zone streaming", () => {
    expect(neighbours("reception").sort()).toEqual(["campus", "marketing", "rooftop", "software"]);
    expect(neighbours("strategy").sort()).toEqual(["automation", "creative"]);
    expect(neighbours("rooftop")).toEqual(["reception"]);
  });
});
