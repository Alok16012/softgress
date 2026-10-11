"use client";
import { useEffect } from "react";

/**
 * Optional, user-initiated ambient room tone generated with Web Audio (no files,
 * no autoplay: it starts only after the visitor turns sound on).
 */
export function useAmbientSound(on: boolean, sunset: boolean) {
  useEffect(() => {
    if (!on || typeof window === "undefined") return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02; // brown noise
        d[i] = last * 3.2;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = sunset ? 500 : 900;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => void ctx.close(), 400);
    };
  }, [on, sunset]);
}
