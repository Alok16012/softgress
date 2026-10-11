"use client";
import {
  ArrowLeft,
  ArrowRight,
  Captions,
  ClipboardList,
  Compass,
  FastForward,
  HelpCircle,
  Home,
  Map as MapIcon,
  Mail,
  MessageSquareText,
  Pause,
  Search,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { staffById } from "@/content/staff";
import { GUIDED_ORDER, SCENES } from "@/lib/tour/scenes";
import { stepIndex } from "@/lib/tour/machine";
import type { SceneId } from "@/lib/types";
import { briefIsEmpty, useBrief } from "@/stores/brief";
import { useChat } from "@/stores/chat";
import { useTour } from "@/stores/tour";
import { useCatalog } from "./CatalogContext";
import { Dialog } from "./Dialog";
import { useHotspotAction } from "./useHotspotAction";

// ── Top bar ────────────────────────────────────────────────────────────────
export function TopBar({ onHelp, onSettings, mapOpen, setMapOpen }: { onHelp: () => void; onSettings: () => void; mapOpen: boolean; setMapOpen: (v: boolean) => void }) {
  const st = useTour((s) => s.state);
  const prefs = useTour((s) => s.prefs);
  const setPrefs = useTour((s) => s.setPrefs);
  const dispatch = useTour((s) => s.dispatch);
  const brief = useBrief((b) => b.brief);
  const briefCount = [brief.projectType, brief.goals, brief.scope, brief.budget, brief.targetDate, brief.industry].filter(Boolean).length + brief.serviceSlugs.length + brief.features.length;
  const where = SCENES[st.phase === "transit" && st.target ? st.target : st.scene].label;
  const staff = st.staffId ? staffById.get(st.staffId) : null;
  const canAct = st.phase !== "intro" && st.phase !== "transit";

  return (
    <header className="pointer-events-auto glass absolute top-3 left-3 right-3 z-30 rounded-2xl px-2 sm:px-3 h-14 flex items-center gap-1 sm:gap-2">
      <a href="#top" className="flex items-center gap-2 pl-2 pr-3 font-extrabold tracking-[0.18em] text-sm" aria-label="Softgress virtual HQ">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-teal text-midnight text-xs">S</span>
        <span className="hidden md:inline">SOFTGRESS</span>
      </a>
      <nav aria-label="Breadcrumb" className="hidden sm:block min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm text-white/75 truncate">
          <li>
            <button type="button" className="hover:text-white" onClick={() => dispatch({ type: "GO", scene: "campus" })} disabled={!canAct}>
              Campus
            </button>
          </li>
          {where !== "Campus" && (
            <>
              <li aria-hidden>›</li>
              <li aria-current={staff ? undefined : "location"} className="text-white font-semibold truncate">
                {where}
                {st.phase === "transit" && <span className="ml-1 text-white/60 font-normal">(walking…)</span>}
              </li>
            </>
          )}
          {staff && (
            <>
              <li aria-hidden>›</li>
              <li aria-current="location" className="text-mint truncate">
                Talking with {staff.displayName}
              </li>
            </>
          )}
        </ol>
      </nav>
      <div className="flex-1 sm:hidden" />
      <div className="flex items-center gap-0.5">
        <button type="button" className="hud-btn" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "search" } })} disabled={!canAct} aria-label="Search services (/)" title="Search services (/)">
          <Search size={18} />
        </button>
        <button type="button" className="hud-btn" aria-pressed={mapOpen} onClick={() => setMapOpen(!mapOpen)} aria-label="Scene map (M)" title="Scene map (M)">
          <MapIcon size={18} />
        </button>
        <button type="button" className="hud-btn relative" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "brief" } })} disabled={!canAct} aria-label={`Project brief${briefCount ? `, ${briefCount} details` : ""} (B)`} title="Project brief (B)">
          <ClipboardList size={18} />
          {briefCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-teal text-midnight text-[11px] font-bold grid place-items-center">{briefCount}</span>}
        </button>
        <button type="button" className="hud-btn hidden sm:inline-flex" aria-pressed={prefs.captions} onClick={() => setPrefs({ captions: !prefs.captions })} aria-label="Captions (C)" title="Captions (C)">
          <Captions size={18} />
        </button>
        <button type="button" className="hud-btn hidden sm:inline-flex" aria-pressed={prefs.sound} onClick={() => setPrefs({ sound: !prefs.sound })} aria-label={prefs.sound ? "Mute ambient sound (V)" : "Turn on ambient sound (V)"} title="Ambient sound (V)">
          {prefs.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button type="button" className="hud-btn" onClick={onHelp} aria-label="Help and controls (?)" title="Help (?)">
          <HelpCircle size={18} />
        </button>
        <button type="button" className="hud-btn" onClick={onSettings} aria-label="Settings" title="Settings">
          <Settings size={18} />
        </button>
        <button type="button" className="btn-primary !min-h-10 !px-3 ml-1 text-sm" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: "consultation" } })} disabled={!canAct}>
          <span className="hidden sm:inline">Book a project call</span>
          <span className="sm:hidden">Book</span>
        </button>
      </div>
    </header>
  );
}

// ── Mini map ───────────────────────────────────────────────────────────────
const ROOMS: { id: SceneId; x: number; y: number; w: number; h: number; label: string }[] = [
  { id: "marketing", x: 0, y: 0, w: 40, h: 40, label: "Marketing" },
  { id: "reception", x: 40, y: 0, w: 40, h: 28, label: "Reception" },
  { id: "software", x: 80, y: 0, w: 40, h: 40, label: "Software" },
  { id: "creative", x: 0, y: 40, w: 40, h: 40, label: "Creative" },
  { id: "strategy", x: 40, y: 52, w: 40, h: 28, label: "Boardroom" },
  { id: "automation", x: 80, y: 40, w: 40, h: 40, label: "AI Lab" },
];

export function MiniMap({ open, onClose }: { open: boolean; onClose: () => void }) {
  const scene = useTour((s) => s.state.scene);
  const target = useTour((s) => s.state.target);
  const dispatch = useTour((s) => s.dispatch);
  if (!open) return null;
  const here = target ?? scene;
  return (
    <section aria-label="Scene map" className="pointer-events-auto glass absolute z-30 top-20 right-3 rounded-2xl p-3 w-[min(300px,calc(100vw-24px))] animate-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Floor plan</h2>
        <button type="button" className="text-xs text-white/60 hover:text-white" onClick={onClose}>
          Hide
        </button>
      </div>
      <svg viewBox="-2 -14 124 98" className="w-full" role="group" aria-label="Rooms">
        <rect x="-1" y="-1" width="122" height="82" rx="3" fill="none" stroke="rgba(255,255,255,0.25)" />
        {ROOMS.map((r) => {
          const active = here === r.id;
          return (
            <g key={r.id}>
              <a
                role="button"
                tabIndex={0}
                aria-label={`Go to ${SCENES[r.id].label}${active ? " (you are here)" : ""}`}
                aria-current={active ? "location" : undefined}
                onClick={() => dispatch({ type: "GO", scene: r.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    dispatch({ type: "GO", scene: r.id });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <rect x={r.x + 1} y={r.y + 1} width={r.w - 2} height={r.h - 2} rx="2" fill={active ? "rgba(41,198,192,0.35)" : "rgba(255,255,255,0.06)"} stroke={active ? "#29C6C0" : "rgba(255,255,255,0.2)"} />
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 3} textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight={active ? 700 : 500}>
                  {r.label}
                </text>
              </a>
              {active && <circle cx={r.x + r.w / 2} cy={r.y + r.h / 2 - 8} r="2.6" fill="#A8F0D3" />}
            </g>
          );
        })}
        <text x="60" y="-6" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.6)">
          ▲ Entrance · road
        </text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className="chip justify-center" aria-current={here === "campus" ? "location" : undefined} onClick={() => dispatch({ type: "GO", scene: "campus" })}>
          Campus
        </button>
        <button type="button" className="chip justify-center" aria-current={here === "rooftop" ? "location" : undefined} onClick={() => dispatch({ type: "GO", scene: "rooftop" })}>
          Rooftop ↑
        </button>
      </div>
    </section>
  );
}

// ── "In this room" (keyboard & screen-reader path to every hotspot) ────────
export function RoomPanel() {
  const scene = useTour((s) => s.state.scene);
  const phase = useTour((s) => s.state.phase);
  const run = useHotspotAction();
  const [open, setOpen] = useState(true);
  if (phase === "intro" || phase === "entry") return null;
  const spots = [...SCENES[scene].hotspots].sort((a, b) => (a.kind === "staff" ? -1 : b.kind === "staff" ? 1 : 0));
  return (
    <section aria-labelledby="room-title" className="pointer-events-auto glass absolute z-20 left-3 top-20 rounded-2xl w-[min(270px,calc(100vw-24px))] hidden md:block">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span id="room-title" className="text-sm font-semibold">
          In this room · {SCENES[scene].label}
        </span>
        <span aria-hidden className="text-white/60">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <ul className="px-2 pb-3 max-h-[52vh] overflow-y-auto scrollbar-thin">
          {spots.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                disabled={phase === "transit"}
                onClick={() => run(h.action)}
                className="w-full text-left flex items-start gap-2 rounded-xl px-2 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
              >
                <span aria-hidden className={`mt-0.5 grid place-items-center w-5 h-5 shrink-0 rounded-full text-[10px] font-bold ${h.kind === "staff" ? "bg-mint text-midnight" : h.kind === "door" ? "bg-white text-midnight" : "bg-teal text-midnight"}`}>
                  {h.kind === "staff" ? "AI" : h.kind === "door" ? "→" : h.kind === "cta" ? "★" : "+"}
                </span>
                <span>
                  {h.label}
                  {h.kind === "staff" && <span className="block text-[11px] text-mint">AI guide · opens chat</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Bottom controls + captions ─────────────────────────────────────────────
export function TourControls() {
  const st = useTour((s) => s.state);
  const prefs = useTour((s) => s.prefs);
  const dispatch = useTour((s) => s.dispatch);
  if (st.phase === "intro" || st.phase === "entry") return null;
  const current = st.phase === "transit" && st.target ? st.target : st.scene;
  const i = stepIndex(current);
  const caption = SCENES[current].caption.en;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-col items-center gap-2 px-3">
      {prefs.captions && st.phase !== "dialogue" && (
        <p className="pointer-events-auto glass rounded-xl px-4 py-2 text-sm sm:text-[15px] max-w-2xl text-center leading-snug" aria-live="polite" role="status">
          {caption}
        </p>
      )}
      <div className="pointer-events-auto glass rounded-2xl p-1.5 flex items-center gap-1 flex-wrap justify-center">
        {st.mode === "guided" ? (
          <>
            <button type="button" className="hud-btn" onClick={() => dispatch({ type: "PREV" })} disabled={i <= 0} aria-label="Previous stop">
              <ArrowLeft size={18} />
            </button>
            <span className="px-2 text-sm min-w-40 text-center" aria-live="polite">
              <span className="text-white/60">Stop {i + 1} of {GUIDED_ORDER.length} · </span>
              <strong>{SCENES[current].label}</strong>
            </span>
            <button type="button" className="hud-btn" onClick={() => dispatch({ type: "NEXT" })} disabled={i >= GUIDED_ORDER.length - 1} aria-label="Next stop">
              <ArrowRight size={18} />
            </button>
            <span className="w-px h-6 bg-white/15 mx-1" aria-hidden />
            <button type="button" className="hud-btn text-sm" onClick={() => dispatch({ type: "CHOOSE_MODE", mode: "free" })}>
              <Pause size={16} aria-hidden /> Explore freely
            </button>
          </>
        ) : (
          <>
            <button type="button" className="hud-btn text-sm" onClick={() => dispatch({ type: "GO", scene: "reception" })} disabled={current === "reception"}>
              <Home size={16} aria-hidden /> Back to reception
            </button>
            <button type="button" className="hud-btn text-sm" onClick={() => dispatch({ type: "CHOOSE_MODE", mode: "guided" })}>
              <Compass size={16} aria-hidden /> Resume guided tour
            </button>
          </>
        )}
        {st.phase === "transit" && st.target && (
          <button type="button" className="hud-btn text-sm" onClick={() => dispatch({ type: "JUMP", scene: st.target! })}>
            <FastForward size={16} aria-hidden /> Skip animation
          </button>
        )}
      </div>
    </div>
  );
}

// ── Intro overlay & entry choice ───────────────────────────────────────────
export function IntroOverlay() {
  const phase = useTour((s) => s.state.phase);
  const dispatch = useTour((s) => s.dispatch);
  if (phase !== "intro") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end p-6 sm:p-12 bg-gradient-to-t from-midnight/80 via-midnight/10 to-transparent">
      <div className="animate-in max-w-3xl">
        <p className="text-mint font-semibold tracking-[0.3em] text-xs sm:text-sm">VIRTUAL HEADQUARTERS</p>
        <h1 className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-tight text-white">SOFTGRESS</h1>
        <p className="mt-2 text-lg sm:text-2xl text-white/90">Ideas engineered. Growth accelerated.</p>
      </div>
      <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => dispatch({ type: "SKIP_INTRO" })} autoFocus>
          Skip intro
        </button>
      </div>
    </div>
  );
}

export function EntryChoice() {
  const phase = useTour((s) => s.state.phase);
  const dispatch = useTour((s) => s.dispatch);
  if (phase !== "entry") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-end sm:items-center justify-center p-3 sm:p-6">
      <section aria-labelledby="entry-title" className="pointer-events-auto glass rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl animate-in">
        <p className="text-mint font-semibold tracking-[0.25em] text-xs">WELCOME TO SOFTGRESS</p>
        <h1 id="entry-title" className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
          How would you like to visit?
        </h1>
        <p className="mt-2 text-white/75">No sign-up needed. Our guides are AI assistants; a real team member follows up on every request.</p>
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <button type="button" autoFocus className="text-left rounded-2xl border border-teal bg-teal/10 p-4 hover:bg-teal/20" onClick={() => dispatch({ type: "CHOOSE_MODE", mode: "guided" })}>
            <Sparkles className="text-teal" aria-hidden />
            <span className="mt-2 block font-bold">Guided tour</span>
            <span className="mt-1 block text-sm text-white/70">A smooth walk through every department, step by step.</span>
          </button>
          <button type="button" className="text-left rounded-2xl border border-white/15 p-4 hover:border-white/40" onClick={() => dispatch({ type: "CHOOSE_MODE", mode: "free" })}>
            <Compass className="text-mint" aria-hidden />
            <span className="mt-2 block font-bold">Explore freely</span>
            <span className="mt-1 block text-sm text-white/70">Wander at your own pace. Click doors, people and screens.</span>
          </button>
          <button type="button" className="text-left rounded-2xl border border-white/15 p-4 hover:border-white/40" onClick={() => dispatch({ type: "CHOOSE_MODE", mode: "direct" })}>
            <Search className="text-mint" aria-hidden />
            <span className="mt-2 block font-bold">I know what I need</span>
            <span className="mt-1 block text-sm text-white/70">Search services and go straight to the right team.</span>
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <button type="button" className="underline text-white/80 hover:text-white" onClick={() => dispatch({ type: "TALK", staffId: "aanya-reception" })}>
            <MessageSquareText size={14} className="inline mr-1" aria-hidden />
            Ask the AI receptionist
          </button>
          <a href="#directory" className="underline text-white/80 hover:text-white">
            Browse as a regular page
          </a>
          <a href="/contact" className="underline text-white/80 hover:text-white">
            <Mail size={14} className="inline mr-1" aria-hidden />
            Contact form
          </a>
        </div>
      </section>
    </div>
  );
}

// ── Help & settings ────────────────────────────────────────────────────────
export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows: [string, string][] = [
    ["Drag / swipe", "Look around"],
    ["Click a person", "Talk to an AI guide"],
    ["Click a marker", "Open a service, screen or door"],
    ["W A S D", "Step around (free explore, desktop)"],
    ["← →  or  N / P", "Previous / next stop (guided tour)"],
    ["M", "Scene map"],
    ["/", "Search services"],
    ["B", "Your project brief"],
    ["C / V", "Captions / ambient sound (off by default)"],
    ["Esc", "Close chat or panel"],
  ];
  return (
    <Dialog open={open} onClose={onClose} title="Help & controls">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt>
              <kbd className="rounded-md border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-xs">{k}</kbd>
            </dt>
            <dd className="text-white/80">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 space-y-2 text-sm text-white/75">
        <p>Everything in the 3D office is also available from the “In this room” list, the map and the regular page below, using only a keyboard or screen reader.</p>
        <p>The building and people are a stylised preview (procedural placeholders) of the Softgress headquarters experience. Dashboards and workflows use labelled synthetic data.</p>
      </div>
    </Dialog>
  );
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prefs = useTour((s) => s.prefs);
  const setPrefs = useTour((s) => s.setPrefs);
  const dispatch = useTour((s) => s.dispatch);
  const resetChat = useChat((c) => c.resetAll);
  const resetBrief = useBrief((b) => b.reset);
  const brief = useBrief((b) => b.brief);
  const threads = useChat((c) => c.threads);
  const [resetState, setResetState] = useState<"idle" | "done" | "partial">("idle");
  const { config } = useCatalog();
  const reset = async () => {
    const old = resetChat();
    resetBrief();
    try {
      const r = await fetch("/api/session", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: old }) });
      setResetState(r.ok ? "done" : "partial");
    } catch {
      setResetState("partial");
    }
  };
  const hasData = !briefIsEmpty(brief) || Object.keys(threads).length > 0;
  return (
    <Dialog open={open} onClose={onClose} title="Settings & privacy">
      <div className="space-y-6">
        <section>
          <h3 className="font-semibold mb-2">Graphics quality</h3>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Graphics quality">
            {(["low", "medium", "high"] as const).map((q) => (
              <button key={q} type="button" role="radio" aria-checked={prefs.quality === q} className="chip capitalize" onClick={() => setPrefs({ quality: q, autoQuality: false })}>
                {q}
              </button>
            ))}
            <button type="button" className="chip" aria-pressed={prefs.autoQuality} onClick={() => setPrefs({ autoQuality: !prefs.autoQuality })}>
              Auto-adjust
            </button>
          </div>
        </section>
        <section>
          <h3 className="font-semibold mb-2">View</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={prefs.view === "3d"} onClick={() => setPrefs({ view: "3d" })}>
              3D office
            </button>
            <button type="button" className="chip" aria-pressed={prefs.view === "2d"} onClick={() => setPrefs({ view: "2d" })}>
              Simple 2D navigator
            </button>
            <button type="button" className="chip" aria-pressed={prefs.reducedMotion} onClick={() => setPrefs({ reducedMotion: !prefs.reducedMotion })}>
              Reduce motion
            </button>
          </div>
        </section>
        <section>
          <h3 className="font-semibold mb-1">Your privacy</h3>
          <p className="text-sm text-white/70">
            No tracking cookies or analytics. Chats and your draft brief live only in this browser tab. Display preferences are remembered on this device. AI mode: {config.aiMode === "demo" ? "demo (no AI model connected)" : "live AI"}.
          </p>
          <button type="button" className="mt-3 btn-ghost" onClick={() => void reset()} disabled={!hasData && resetState !== "idle"}>
            Reset session: delete chats &amp; draft
          </button>
          {resetState === "done" && <p className="mt-2 text-sm text-mint" role="status">Done. Local data and server session metadata were deleted.</p>}
          {resetState === "partial" && <p className="mt-2 text-sm text-[#ffd75e]" role="status">Local data deleted. The server couldn&apos;t be reached to delete session metadata; it will expire automatically.</p>}
        </section>
        <section>
          <button type="button" className="btn-ghost" onClick={() => {
            dispatch({ type: "RESET" });
            onClose();
          }}>
            Restart the visit
          </button>
        </section>
      </div>
    </Dialog>
  );
}

// ── First-visit notice (no tracking; informational) ────────────────────────
export function ConsentNotice() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem("sg:notice") === "1";
    } catch {
      return false;
    }
  });
  const phase = useTour((s) => s.state.phase);
  if (hidden || phase === "intro") return null;
  return (
    <div role="note" className="pointer-events-auto glass absolute z-20 left-3 bottom-24 sm:bottom-3 max-w-sm rounded-2xl p-4 text-sm animate-in">
      <p>
        <strong>AI guides, no tracking.</strong> The people you can talk to here are AI assistants. Chats stay in your browser unless you attach them to a request.{" "}
        <a href="/privacy" className="underline">
          Privacy
        </a>
      </p>
      <button
        type="button"
        className="mt-2 btn-ghost !min-h-9 !px-3 text-sm"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem("sg:notice", "1");
          } catch {
            /* ignore */
          }
        }}
      >
        Got it
      </button>
    </div>
  );
}

// ── Rooftop finale ─────────────────────────────────────────────────────────
export function RooftopFinale() {
  const show = useTour((s) => s.state.scene === "rooftop" && s.state.phase === "idle");
  const dispatch = useTour((s) => s.dispatch);
  const { config } = useCatalog();
  if (!show) return null;
  return (
    <section aria-labelledby="finale-title" className="pointer-events-auto absolute z-20 left-1/2 -translate-x-1/2 top-24 w-[min(640px,calc(100%-24px))] text-center animate-in">
      <h2 id="finale-title" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
        Your next chapter starts here.
      </h2>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: "quote" } })}>
          Request a proposal
        </button>
        <button type="button" className="btn-ghost glass" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: "consultation" } })}>
          Book a consultation
        </button>
        {config.whatsappNumber && (
          <a className="btn-ghost glass" href={`https://wa.me/${config.whatsappNumber.replace(/^\+/, "")}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        )}
        {config.contactEmail && (
          <a className="btn-ghost glass" href={`mailto:${config.contactEmail}`}>
            Email
          </a>
        )}
      </div>
    </section>
  );
}
