"use client";
import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SCENES, railPoints, type Pose, type Vec3 } from "@/lib/tour/scenes";
import { conversationPose } from "@/lib/tour/placements";
import { useTour } from "@/stores/tour";

const v = (a: Vec3) => new THREE.Vector3(...a);
const LOOK_DIST = 0.6; // near-target "head turn" model for free look

const INTRO_START: Pose = { position: [3.5, 3.4, 158], target: [0, 3.2, 60] };

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Owns the camera. Long moves run on GSAP-driven Catmull-Rom rails through doorway
 * waypoints (never through walls); short moves (conversation framing) use
 * CameraControls' damped transitions. Free look = drag to turn your head, WASD to
 * step around, clamped to the room's bounds.
 */
export function CameraRig({ onIntroProgress }: { onIntroProgress?: (p: number) => void }) {
  const controls = useRef<CameraControls>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const keys = useRef(new Set<string>());
  const { camera } = useThree();
  const phase = useTour((s) => s.state.phase);
  const transitId = useTour((s) => s.state.transitId);
  const scene = useTour((s) => s.state.scene);
  const staffId = useTour((s) => s.state.staffId);
  const mode = useTour((s) => s.state.mode);
  const reduced = useTour((s) => s.prefs.reducedMotion);

  /** Place the camera at a pose using the near-target look model. */
  const settle = (pose: Pose, smooth: boolean) => {
    const c = controls.current;
    if (!c) return;
    const pos = v(pose.position);
    const dir = v(pose.target).sub(pos).normalize();
    const tgt = pos.clone().addScaledVector(dir, LOOK_DIST);
    void c.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, smooth);
  };

  const applyBounds = (id: keyof typeof SCENES | null) => {
    const c = controls.current;
    if (!c) return;
    if (!id) {
      c.setBoundary(undefined);
      return;
    }
    const b = SCENES[id].bounds;
    c.setBoundary(new THREE.Box3(v(b.min), v(b.max)));
  };

  // Configure controls once.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.smoothTime = 0.45;
    c.draggingSmoothTime = 0.12;
    c.azimuthRotateSpeed = -0.35; // "grab the world" feel
    c.polarRotateSpeed = -0.3;
    c.minPolarAngle = Math.PI * 0.32;
    c.maxPolarAngle = Math.PI * 0.62;
    c.minDistance = LOOK_DIST;
    c.maxDistance = LOOK_DIST;
    c.dollySpeed = 0;
    c.truckSpeed = 0;
    c.mouseButtons.wheel = 0; // ACTION.NONE: let the page scroll / guided stepping handle wheel
    c.mouseButtons.middle = 0;
    c.mouseButtons.right = 0;
    c.touches.two = 0;
    c.touches.three = 0;
    settle(useTour.getState().state.phase === "intro" && !reduced ? INTRO_START : SCENES.campus.pose, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intro: glide along the access road toward the campus.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (phase === "intro") {
      if (reduced) {
        settle(SCENES.campus.pose, false);
        useTour.getState().dispatch({ type: "INTRO_DONE" });
        return;
      }
      c.enabled = false;
      const curve = new THREE.CatmullRomCurve3([v(INTRO_START.position), v([2.5, 4.2, 100]), v([5, 5, 68]), v(SCENES.campus.pose.position)], false, "centripetal");
      const tgtFrom = v(INTRO_START.target);
      const tgtTo = v(SCENES.campus.pose.target);
      const state = { p: 0 };
      tween.current = gsap.to(state, {
        p: 1,
        duration: 9,
        ease: "power1.inOut",
        onUpdate: () => {
          const pos = curve.getPointAt(state.p);
          const tgt = tgtFrom.clone().lerp(tgtTo, smoothstep(0.1, 0.95, state.p));
          void c.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, false);
          onIntroProgress?.(state.p);
        },
        onComplete: () => {
          settle(SCENES.campus.pose, false);
          c.enabled = true;
          useTour.getState().dispatch({ type: "INTRO_DONE" });
        },
      });
      return () => {
        tween.current?.kill();
      };
    }
    if (phase === "entry") {
      tween.current?.kill();
      c.enabled = true;
      settle(SCENES.campus.pose, true);
      applyBounds("campus");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "intro", phase === "entry", reduced]);

  // Rails between scenes.
  useEffect(() => {
    const c = controls.current;
    const st = useTour.getState().state;
    if (!c || st.phase !== "transit" || !st.target) return;
    const from = st.scene;
    const to = st.target;
    const id = st.transitId;
    tween.current?.kill();
    applyBounds(null);

    if (reduced) {
      // Instant cut (the DOM overlay does a short fade).
      settle(SCENES[to].pose, false);
      const raf = requestAnimationFrame(() => useTour.getState().dispatch({ type: "ARRIVED", transitId: id }));
      return () => cancelAnimationFrame(raf);
    }

    c.enabled = false;
    const start = camera.position.clone();
    const startTarget = new THREE.Vector3();
    c.getTarget(startTarget);
    // Look direction at the start, extended to a far point so blending is stable.
    const startLook = start.clone().add(startTarget.clone().sub(start).normalize().multiplyScalar(8));
    const pts = railPoints(from, to, start.toArray() as Vec3).map(v);
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
    const len = curve.getLength();
    const finalTarget = v(SCENES[to].pose.target);
    const duration = THREE.MathUtils.clamp(len / 7.5, 1.4, 5.2);
    const state = { p: 0 };
    const ahead = new THREE.Vector3();
    const look = new THREE.Vector3();

    tween.current = gsap.to(state, {
      p: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const p = state.p;
        const pos = curve.getPointAt(p);
        curve.getPointAt(Math.min(1, p + 0.08), ahead);
        ahead.y = pos.y - 0.15;
        // Blend: initial gaze → look along the rail → final framing.
        look.copy(startLook).lerp(ahead.add(ahead.clone().sub(pos).multiplyScalar(4)), smoothstep(0, 0.25, p));
        look.lerp(finalTarget, smoothstep(0.55, 1, p));
        void c.setLookAt(pos.x, pos.y, pos.z, look.x, look.y, look.z, false);
      },
      onComplete: () => {
        settle(SCENES[to].pose, false);
        c.enabled = true;
        applyBounds(to);
        useTour.getState().dispatch({ type: "ARRIVED", transitId: id });
      },
    });
    return () => {
      tween.current?.kill();
      c.enabled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitId, phase === "transit"]);

  // Conversation framing and return.
  const wasDialogue = useRef(false);
  useEffect(() => {
    if (phase === "dialogue" && staffId) {
      const pose = conversationPose(staffId);
      if (pose) {
        applyBounds(null);
        settle(pose, !reduced);
      }
      wasDialogue.current = true;
    } else if (phase === "idle" && wasDialogue.current) {
      wasDialogue.current = false;
      settle(SCENES[scene].pose, !reduced);
      applyBounds(scene);
    } else if (phase === "idle") {
      applyBounds(scene);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, staffId]);

  // Enable/disable look controls by phase.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.enabled = phase === "idle" || phase === "entry" || phase === "dialogue";
  }, [phase]);

  // WASD / arrow stepping in free mode.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c || phase !== "idle" || mode !== "free" || keys.current.size === 0) return;
    const speed = 3.2 * Math.min(dt, 0.05);
    const k = keys.current;
    if (k.has("KeyW")) void c.forward(speed, false);
    if (k.has("KeyS")) void c.forward(-speed, false);
    if (k.has("KeyA")) void c.truck(-speed, 0, false);
    if (k.has("KeyD")) void c.truck(speed, 0, false);
  });

  return <CameraControls ref={controls} makeDefault />;
}
