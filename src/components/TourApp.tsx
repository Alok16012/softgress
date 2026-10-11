"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { SCENES } from "@/lib/tour/scenes";
import { SCENE_IDS, type SceneId } from "@/lib/types";
import { hydratePrefs, useTour, type Quality } from "@/stores/tour";
import { CatalogProvider, type ClientCatalog } from "./ui/CatalogContext";
import { ChatDrawer } from "./ui/ChatDrawer";
import { ConsentNotice, EntryChoice, HelpDialog, IntroOverlay, MiniMap, RoomPanel, RooftopFinale, SettingsDialog, TopBar, TourControls } from "./ui/Hud";
import { Navigator2D } from "./ui/Navigator2D";
import { PanelHost } from "./ui/Panels";
import { HotspotLayer } from "./ui/HotspotLayer";
import { useAmbientSound } from "./ui/useAmbientSound";
import { IntroVideo } from "./ui/IntroVideo";

const World = dynamic(() => import("./tour/World"), { ssr: false });

/** WebGL support, and whether it's a software rasteriser (no GPU), which can't run the 3D office smoothly. */
function detectWebGL(): { ok: boolean; software: boolean } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, software: false };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software: /swiftshader|llvmpipe|software|basic render/i.test(renderer) };
  } catch {
    return { ok: false, software: false };
  }
}

function suggestQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
  if (nav.connection?.saveData) return "low";
  if ((nav.deviceMemory && nav.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)) return "low";
  if (mobile) return "medium";
  return "high";
}

class WorldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const isScene = (s: string | null): s is SceneId => !!s && (SCENE_IDS as readonly string[]).includes(s);

function useUrlSync(ready: boolean) {
  const scene = useTour((s) => s.state.scene);
  const phase = useTour((s) => s.state.phase);
  const dispatch = useTour((s) => s.dispatch);
  const first = useRef(true);

  // Deep link on load: ?scene=software → skip intro and jump there.
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(location.search);
    const s = params.get("scene");
    if (isScene(s)) {
      dispatch({ type: "SKIP_INTRO" });
      dispatch({ type: "JUMP", scene: s });
    }
    const onPop = (e: PopStateEvent) => {
      const target = (e.state?.scene as string | undefined) ?? new URLSearchParams(location.search).get("scene");
      if (isScene(target)) dispatch({ type: "GO", scene: target });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [ready, dispatch]);

  // Push a history entry on arrival so browser back/forward walks the tour.
  useEffect(() => {
    if (!ready || phase === "intro" || phase === "entry" || phase === "transit") return;
    if (first.current) {
      first.current = false;
      history.replaceState({ scene }, "", `?scene=${scene}`);
      return;
    }
    if (history.state?.scene !== scene) history.pushState({ scene }, "", `?scene=${scene}`);
  }, [scene, phase, ready]);
}

function useShortcuts(setMap: (f: (v: boolean) => boolean) => void, setHelp: (v: boolean) => void) {
  const dispatch = useTour((s) => s.dispatch);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (document.querySelector("dialog[open]")) return;
      const { state, prefs, setPrefs } = useTour.getState();
      const busy = state.phase === "intro" || state.phase === "entry";
      switch (e.key) {
        case "/":
          if (busy) return;
          e.preventDefault();
          dispatch({ type: "OPEN_PANEL", panel: { type: "search" } });
          break;
        case "m":
        case "M":
          setMap((v) => !v);
          break;
        case "b":
        case "B":
          if (!busy) dispatch({ type: "OPEN_PANEL", panel: { type: "brief" } });
          break;
        case "c":
        case "C":
          setPrefs({ captions: !prefs.captions });
          break;
        case "v":
        case "V":
          setPrefs({ sound: !prefs.sound });
          break;
        case "?":
          setHelp(true);
          break;
        case "ArrowRight":
        case "n":
        case "N":
          if (state.mode === "guided" && state.phase !== "dialogue") dispatch({ type: "NEXT" });
          break;
        case "ArrowLeft":
        case "p":
        case "P":
          if (state.mode === "guided" && state.phase !== "dialogue") dispatch({ type: "PREV" });
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, setMap, setHelp]);
}

/** Guided tour: wheel/trackpad steps between stops; at the last stop the page scrolls on. */
function useWheelStepping(el: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let acc = 0;
    let cooldown = 0;
    const onWheel = (e: WheelEvent) => {
      const { state, dispatch } = useTour.getState();
      if (state.mode !== "guided" || (state.phase !== "idle" && state.phase !== "transit")) return;
      if ((e.target as HTMLElement).tagName !== "CANVAS") return; // only over the 3D view, never over panels
      const order = ["campus", "reception", "software", "marketing", "creative", "automation", "strategy", "rooftop"];
      const i = order.indexOf(state.target ?? state.scene);
      if ((e.deltaY > 0 && i >= order.length - 1) || (e.deltaY < 0 && i <= 0)) return; // let the page scroll
      e.preventDefault();
      if (Date.now() < cooldown) return;
      acc += e.deltaY;
      if (Math.abs(acc) > 60) {
        dispatch({ type: acc > 0 ? "NEXT" : "PREV" });
        acc = 0;
        cooldown = Date.now() + 1400;
      }
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [el]);
}

function Fade() {
  const phase = useTour((s) => s.state.phase);
  const reduced = useTour((s) => s.prefs.reducedMotion);
  const view = useTour((s) => s.prefs.view);
  if (!reduced || view !== "3d") return null;
  return <div aria-hidden className={`pointer-events-none absolute inset-0 z-10 bg-midnight transition-opacity duration-150 ${phase === "transit" ? "opacity-60" : "opacity-0"}`} />;
}

export default function TourApp({ catalog }: { catalog: ClientCatalog }) {
  // Client-only component (ssr: false), so browser capabilities can be read during init.
  const [caps] = useState(() => {
    const gl = detectWebGL();
    return { webgl: gl.ok, software: gl.software, reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches };
  });
  const webgl = caps.webgl;
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [settings, setSettings] = useState(false);
  const [notice, setNotice] = useState<string | null>(() =>
    // No notice when the visitor (or a test) picked a view explicitly via ?view=.
    new URLSearchParams(location.search).has("view")
      ? null
      : !caps.webgl
      ? "Your browser can't display the 3D office, so you're seeing the simple navigator. Everything works the same."
      : caps.software
        ? "This device has no graphics acceleration, so you're seeing the simple navigator. You can try the 3D office in Settings."
        : null,
  );
  const root = useRef<HTMLElement>(null);
  const view = useTour((s) => s.prefs.view);
  const sound = useTour((s) => s.prefs.sound);
  const scene = useTour((s) => s.state.scene);
  const setPrefs = useTour((s) => s.setPrefs);

  useEffect(() => {
    hydratePrefs(caps.reduced, caps.software ? "low" : suggestQuality(), caps.webgl, caps.software);
    const forced = new URLSearchParams(location.search).get("view");
    if (forced === "2d") setPrefs({ view: "2d" });
    if (forced === "3d" && caps.webgl) setPrefs({ view: "3d" });
    // Support/debug override: ?quality=low|medium|high (also pins it, disabling auto-adjust).
    const q = new URLSearchParams(location.search).get("quality");
    if (q === "low" || q === "medium" || q === "high") setPrefs({ quality: q, autoQuality: false });
    // Prefs live in an external store; flip `ready` after they are applied so the
    // first canvas is created with the right quality.
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [setPrefs, caps]);

  useUrlSync(ready);
  // When the intro/entry overlays close, give keyboard users a predictable focus point.
  const phase = useTour((s) => s.state.phase);
  const prevPhase = useRef(phase);
  useEffect(() => {
    const was = prevPhase.current;
    prevPhase.current = phase;
    if ((was === "intro" || was === "entry") && phase !== "intro" && phase !== "entry" && phase !== "panel" && phase !== "dialogue") {
      root.current?.focus({ preventScroll: true });
    }
  }, [phase]);
  useShortcuts(setMapOpen, setHelp);
  useWheelStepping(root);
  useAmbientSound(sound, scene === "rooftop");

  return (
    <CatalogProvider value={catalog}>
      <section ref={root} id="top" tabIndex={-1} aria-label="Softgress virtual headquarters tour" className="outline-none relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-midnight text-white">
        {ready && view === "3d" && webgl && (
          <WorldBoundary
            onError={() => {
              setPrefs({ view: "2d" });
              setNotice("The 3D office hit a problem on this device, so we switched to the simple navigator.");
            }}
          >
            <div className="absolute inset-0">
              <World
                onReady={() => {
                  (window as unknown as { __sgReadyMs?: number }).__sgReadyMs = Math.round(performance.now());
                  setLoaded(true);
                }}
              />
            </div>
            <HotspotLayer />
          </WorldBoundary>
        )}
        {ready && view === "2d" && <Navigator2D introVideo={catalog.config.introVideo} />}
        {ready && view === "2d" && catalog.config.introVideo && <IntroVideo />}
        {(!ready || (view === "3d" && webgl && !loaded)) && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-midnight" role="status" aria-live="polite">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full border-2 border-teal/30 border-t-teal animate-spin" aria-hidden />
              <p className="mt-4 font-semibold tracking-[0.3em] text-sm text-mint">SOFTGRESS</p>
              <p className="mt-1 text-white/70 text-sm">Preparing the campus…</p>
              <button type="button" className="mt-4 underline text-sm text-white/70" onClick={() => setPrefs({ view: "2d" })}>
                Use the simple 2D view instead
              </button>
            </div>
          </div>
        )}
        <Fade />
        {ready && (
          <>
            <TopBar onHelp={() => setHelp(true)} onSettings={() => setSettings(true)} mapOpen={mapOpen} setMapOpen={setMapOpen} />
            <MiniMap open={mapOpen} onClose={() => setMapOpen(false)} />
            {view === "3d" && <RoomPanel />}
            {view === "3d" && <IntroOverlay />}
            <EntryChoice />
            <TourControls />
            <RooftopFinale />
            <ChatDrawer />
            <ConsentNotice />
            <PanelHost />
            <HelpDialog open={help} onClose={() => setHelp(false)} />
            <SettingsDialog open={settings} onClose={() => setSettings(false)} />
            {notice && (
              <div role="status" className="absolute z-30 top-20 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-sm max-w-md text-center">
                {notice}{" "}
                <button type="button" className="underline ml-1" onClick={() => setNotice(null)}>
                  OK
                </button>
              </div>
            )}
          </>
        )}
        <span className="sr-only" aria-live="polite">
          {SCENES[scene].label}
        </span>
      </section>
    </CatalogProvider>
  );
}
