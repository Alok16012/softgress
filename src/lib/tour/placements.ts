import type { Vec3 } from "./scenes";

// Where each AI guide stands (y = floor) and which way they face (radians about Y,
// 0 = facing +z). Used by the zones and by the camera's conversation framing.
export const STAFF_PLACEMENT: Record<string, { position: Vec3; rot: number }> = {
  "aanya-reception": { position: [0, 0, -10.7], rot: 0 },
  "kabir-software": { position: [14.2, 0, -8.2], rot: -0.48 },
  "meera-marketing": { position: [-14.4, 0, -8], rot: 0.51 },
  "rohan-creative": { position: [-14.6, 0, -26.4], rot: 0.61 },
  "ira-automation": { position: [14.6, 0, -26.4], rot: -0.61 },
  "dev-strategy": { position: [4.4, 0, -30.2], rot: -0.91 },
};

/** Comfortable conversation framing: guide slightly left of centre (chat drawer sits right). */
export function conversationPose(staffId: string): { position: Vec3; target: Vec3 } | null {
  const p = STAFF_PLACEMENT[staffId];
  if (!p) return null;
  const s = Math.sin(p.rot);
  const c = Math.cos(p.rot);
  const dist = 2.35;
  const head: Vec3 = [p.position[0], 1.62, p.position[2]];
  const right: Vec3 = [c, 0, -s];
  return {
    position: [head[0] + s * dist - right[0] * 0.15, 1.68, head[2] + c * dist - right[2] * 0.15],
    target: [head[0] + right[0] * 0.55, 1.5, head[2] + right[2] * 0.55],
  };
}
