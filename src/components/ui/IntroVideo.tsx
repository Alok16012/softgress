"use client";
import { useEffect, useRef } from "react";
import { useTour } from "@/stores/tour";

/**
 * Pre-rendered cinematic intro (Remotion) for constrained devices and the 2D view.
 * Muted autoplay (browser-policy compliant), captions, always skippable. Never shown
 * with reduced motion; the tour is usable while it plays (Skip is focused).
 */
export function IntroVideo() {
  const phase = useTour((s) => s.state.phase);
  const reduced = useTour((s) => s.prefs.reducedMotion);
  const dispatch = useTour((s) => s.dispatch);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (phase !== "intro") return;
    if (reduced) {
      dispatch({ type: "SKIP_INTRO" });
      return;
    }
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    void v.play().catch(() => {
      /* autoplay blocked: poster + Skip/Play remain */
    });
  }, [phase, reduced, dispatch]);

  if (phase !== "intro" || reduced) return null;
  return (
    <div className="absolute inset-0 z-30 bg-midnight">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/media/intro-poster.jpg"
        muted
        playsInline
        preload="metadata"
        onEnded={() => dispatch({ type: "INTRO_DONE" })}
        onError={() => dispatch({ type: "SKIP_INTRO" })}
        aria-label="Cinematic approach to the Softgress campus"
      >
        <source src="/media/intro.webm" type="video/webm" />
        <source src="/media/intro.mp4" type="video/mp4" />
        <track kind="captions" src="/media/intro.vtt" srcLang="en" label="English" default />
      </video>
      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-3">
        <button type="button" autoFocus className="btn-primary" onClick={() => dispatch({ type: "SKIP_INTRO" })}>
          Skip intro
        </button>
        <span className="text-xs text-white/70">Pre-rendered preview · muted · captions on</span>
      </div>
    </div>
  );
}
