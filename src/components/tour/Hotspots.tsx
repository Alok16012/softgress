"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { allAnchors } from "./anchors";

/**
 * Projects registered DOM anchors (hotspot pills, staff tags) into screen space
 * every frame. Labels behind the camera or very far away are hidden.
 */
export function AnchorProjector() {
  const v = useRef(new THREE.Vector3());
  const camDir = useRef(new THREE.Vector3());
  useFrame(({ camera, size }) => {
    camera.getWorldDirection(camDir.current);
    for (const { el, pos } of allAnchors().values()) {
      v.current.set(pos[0], pos[1], pos[2]);
      const dist = camera.position.distanceTo(v.current);
      const toPoint = v.current.clone().sub(camera.position).normalize();
      const inFront = toPoint.dot(camDir.current) > 0.1;
      v.current.project(camera);
      const x = (v.current.x * 0.5 + 0.5) * size.width;
      const y = (-v.current.y * 0.5 + 0.5) * size.height;
      const visible = inFront && dist < 70 && x > -40 && x < size.width + 40 && y > -40 && y < size.height + 40;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
    }
  });
  return null;
}
