import type { DepartmentSlug, SceneId } from "@/lib/types";

export type Vec3 = [number, number, number];

export interface Pose {
  position: Vec3;
  target: Vec3;
}

export interface Hotspot {
  id: string;
  kind: "staff" | "service" | "door" | "panel" | "cta";
  label: string;
  /** Short helper text for screen readers and the "In this room" list. */
  description?: string;
  position: Vec3;
  /** What happens on activation — same action as the 2D navigator. */
  action:
    | { type: "talk"; staffId: string }
    | { type: "service"; slug: string }
    | { type: "go"; scene: SceneId }
    | { type: "panel"; panel: "gallery" | "workflow" | "showcase" | "directory" | "dashboard" }
    | { type: "request"; kind: "quote" | "consultation" | "callback" | "brief" };
}

export interface SceneDef {
  id: SceneId;
  label: string;
  department: DepartmentSlug | null;
  pose: Pose;
  /** Camera boundary for free-look/WASD (target is clamped inside). */
  bounds: { min: Vec3; max: Vec3 };
  caption: { en: string };
  hotspots: Hotspot[];
}

// Floor plan (metres): building x -30..30, z -40..0, entrance at z = 0 (road is +z).
export const SCENES: Record<SceneId, SceneDef> = {
  campus: {
    id: "campus",
    label: "Campus",
    department: null,
    pose: { position: [0, 8.5, 44], target: [0, 4.2, 0] },
    bounds: { min: [-20, 1, 10], max: [20, 8, 60] },
    caption: {
      en: "Welcome to the Softgress campus. Ideas engineered, growth accelerated. Head through the glass doors to meet our AI receptionist.",
    },
    hotspots: [
      { id: "campus-doors", kind: "door", label: "Enter reception", position: [0, 1.6, 0.6], action: { type: "go", scene: "reception" } },
      { id: "campus-roof", kind: "door", label: "Rooftop terrace", position: [-18, 10.5, -6], action: { type: "go", scene: "rooftop" } },
    ],
  },
  reception: {
    id: "reception",
    label: "Reception",
    department: "reception",
    pose: { position: [0, 2.3, -1.4], target: [0, 1.55, -10] },
    bounds: { min: [-8, 1.2, -12.5], max: [8, 3.2, -1] },
    caption: {
      en: "This is reception. Aanya, our AI receptionist, can explain what we do and send you to the right team. The directory shows every department.",
    },
    hotspots: [
      { id: "talk-aanya", kind: "staff", label: "Talk to Aanya, AI Receptionist", position: [0, 1.9, -10.6], action: { type: "talk", staffId: "aanya-reception" } },
      { id: "reception-directory", kind: "panel", label: "Building directory", description: "Interactive map of every department", position: [7.6, 2.1, -3.8], action: { type: "panel", panel: "directory" } },
      { id: "reception-book", kind: "cta", label: "Book a consultation", position: [-3.2, 1.3, -8.6], action: { type: "request", kind: "consultation" } },
      { id: "door-software", kind: "door", label: "Software Development →", position: [9.6, 2.6, -7], action: { type: "go", scene: "software" } },
      { id: "door-marketing", kind: "door", label: "← Digital Marketing", position: [-9.6, 2.6, -7], action: { type: "go", scene: "marketing" } },
      { id: "door-corridor", kind: "door", label: "Studios, Lab & Boardroom", position: [0, 2.6, -13.6], action: { type: "go", scene: "strategy" } },
      { id: "door-roof", kind: "door", label: "Rooftop ↑", position: [-3, 6.5, -7], action: { type: "go", scene: "rooftop" } },
    ],
  },
  software: {
    id: "software",
    label: "Software Development",
    department: "software",
    pose: { position: [11.6, 2.25, -3.2], target: [19.5, 1.25, -11.5] },
    bounds: { min: [11, 1.2, -18.5], max: [28.5, 3.2, -1.5] },
    caption: {
      en: "The software floor: engineers building websites, stores, apps and platforms. Click a workstation to explore a service, or talk to Kabir about your project.",
    },
    hotspots: [
      { id: "talk-kabir", kind: "staff", label: "Talk to Kabir, AI Software Consultant", position: [14.2, 1.95, -8.2], action: { type: "talk", staffId: "kabir-software" } },
      { id: "ws-website", kind: "service", label: "Website Development", position: [17.6, 1.35, -4.6], action: { type: "service", slug: "website-development" } },
      { id: "ws-mobile", kind: "service", label: "Mobile Apps", position: [21.6, 1.35, -4.6], action: { type: "service", slug: "mobile-app-development" } },
      { id: "ws-ecommerce", kind: "service", label: "E-commerce", position: [25.6, 1.35, -4.6], action: { type: "service", slug: "ecommerce-development" } },
      { id: "ws-saas", kind: "service", label: "SaaS Platforms", position: [17.6, 1.35, -11.4], action: { type: "service", slug: "saas-platform-development" } },
      { id: "ws-crm", kind: "service", label: "CRM / ERP", position: [21.6, 1.35, -11.4], action: { type: "service", slug: "crm-erp-development" } },
      { id: "ws-integrations", kind: "service", label: "Custom Integrations", position: [25.6, 1.35, -11.4], action: { type: "service", slug: "custom-integrations" } },
      { id: "sw-review", kind: "service", label: "Maintenance & Support", position: [26.5, 2.0, -17.6], action: { type: "service", slug: "maintenance-support" } },
      { id: "sw-back", kind: "door", label: "← Reception", position: [10.4, 2.6, -7], action: { type: "go", scene: "reception" } },
    ],
  },
  marketing: {
    id: "marketing",
    label: "Digital Marketing",
    department: "marketing",
    pose: { position: [-11.6, 2.4, -3.0], target: [-22, 2.1, -10] },
    bounds: { min: [-28.5, 1.2, -18.5], max: [-11, 3.2, -1.5] },
    caption: {
      en: "The marketing command room. Dashboards here use illustrative, synthetic data, never real client results. Meera can help plan SEO, ads and lead generation.",
    },
    hotspots: [
      { id: "talk-meera", kind: "staff", label: "Talk to Meera, AI Marketing Strategist", position: [-14.4, 1.95, -8], action: { type: "talk", staffId: "meera-marketing" } },
      { id: "mk-wall", kind: "panel", label: "Campaign wall (illustrative)", position: [-29.2, 3.1, -9], action: { type: "panel", panel: "dashboard" } },
      { id: "mk-seo", kind: "service", label: "SEO", position: [-17, 1.35, -5], action: { type: "service", slug: "seo" } },
      { id: "mk-google", kind: "service", label: "Google Ads", position: [-21, 1.35, -5], action: { type: "service", slug: "google-ads" } },
      { id: "mk-meta", kind: "service", label: "Meta Ads", position: [-25, 1.35, -5], action: { type: "service", slug: "meta-ads" } },
      { id: "mk-social", kind: "service", label: "Social Media", position: [-17, 1.35, -13], action: { type: "service", slug: "social-media-marketing" } },
      { id: "mk-perf", kind: "service", label: "Performance Marketing", position: [-21, 1.35, -13], action: { type: "service", slug: "performance-marketing" } },
      { id: "mk-leads", kind: "service", label: "Lead Generation", position: [-25, 1.35, -13], action: { type: "service", slug: "lead-generation" } },
      { id: "mk-content", kind: "service", label: "Content Strategy", position: [-26.5, 1.6, -18.6], action: { type: "service", slug: "content-strategy" } },
      { id: "mk-back", kind: "door", label: "Reception →", position: [-10.4, 2.6, -7], action: { type: "go", scene: "reception" } },
    ],
  },
  creative: {
    id: "creative",
    label: "Creative Studio",
    department: "creative",
    pose: { position: [-11.8, 2.3, -22.4], target: [-22.5, 1.5, -32] },
    bounds: { min: [-28.5, 1.2, -38.5], max: [-11, 3.2, -21] },
    caption: {
      en: "Our creative production studio: photo and video set, editing bays and the brand wall. Rohan can walk you through deliverables and workflow.",
    },
    hotspots: [
      { id: "talk-rohan", kind: "staff", label: "Talk to Rohan, AI Creative Lead", position: [-14.6, 1.95, -26.4], action: { type: "talk", staffId: "rohan-creative" } },
      { id: "cr-showcase", kind: "panel", label: "Before/after showcase", position: [-20, 2.2, -20.6], action: { type: "panel", panel: "showcase" } },
      { id: "cr-brand", kind: "service", label: "Brand Identity", position: [-25.5, 2.2, -20.6], action: { type: "service", slug: "brand-identity" } },
      { id: "cr-uiux", kind: "service", label: "UI/UX Design", position: [-14.5, 1.35, -35.5], action: { type: "service", slug: "ui-ux-design" } },
      { id: "cr-video", kind: "service", label: "Video Editing", position: [-18.5, 1.35, -35.5], action: { type: "service", slug: "video-production" } },
      { id: "cr-content", kind: "service", label: "Content Creation", position: [-24.5, 1.8, -31.5], action: { type: "service", slug: "content-creation" } },
      { id: "cr-ads", kind: "service", label: "Ad Creatives", position: [-27.6, 1.6, -26], action: { type: "service", slug: "ad-creatives" } },
      { id: "cr-back", kind: "door", label: "Corridor →", position: [-10.4, 2.6, -23], action: { type: "go", scene: "strategy" } },
    ],
  },
  automation: {
    id: "automation",
    label: "AI & Automation Lab",
    department: "automation",
    pose: { position: [11.8, 2.3, -22.4], target: [23, 1.7, -31] },
    bounds: { min: [11, 1.2, -38.5], max: [28.5, 3.2, -21] },
    caption: {
      en: "The AI and automation lab: engineers building real workflows on real screens. The live workflow board uses synthetic demo data. Ira can map your automation.",
    },
    hotspots: [
      { id: "talk-ira", kind: "staff", label: "Talk to Ira, AI Automation Consultant", position: [14.6, 1.95, -26.4], action: { type: "talk", staffId: "ira-automation" } },
      { id: "au-workflow", kind: "panel", label: "Workflow board (demo data)", position: [29.2, 2.6, -30], action: { type: "panel", panel: "workflow" } },
      { id: "au-chatbots", kind: "service", label: "AI Chatbots", position: [18, 1.35, -27], action: { type: "service", slug: "ai-chatbots" } },
      { id: "au-whatsapp", kind: "service", label: "WhatsApp Automation", position: [22, 1.35, -27], action: { type: "service", slug: "whatsapp-automation" } },
      { id: "au-crm", kind: "service", label: "CRM Integration", position: [18, 1.35, -34], action: { type: "service", slug: "crm-automation" } },
      { id: "au-routing", kind: "service", label: "Lead Routing", position: [22, 1.35, -34], action: { type: "service", slug: "lead-routing" } },
      { id: "au-email", kind: "service", label: "Email Automation", position: [26, 1.35, -34], action: { type: "service", slug: "email-automation" } },
      { id: "au-reporting", kind: "service", label: "Reporting Agents", position: [26, 1.35, -27], action: { type: "service", slug: "reporting-agents" } },
      { id: "au-back", kind: "door", label: "← Corridor", position: [10.4, 2.6, -23], action: { type: "go", scene: "strategy" } },
    ],
  },
  strategy: {
    id: "strategy",
    label: "Strategy Boardroom",
    department: "strategy",
    pose: { position: [0, 2.35, -26.8], target: [0, 1.6, -38] },
    bounds: { min: [-8.5, 1.2, -38.5], max: [8.5, 3.2, -26.5] },
    caption: {
      en: "The boardroom. Review our project gallery (sample concepts are clearly labelled) and plan your project with Dev, then request a proposal or consultation.",
    },
    hotspots: [
      { id: "talk-dev", kind: "staff", label: "Talk to Dev, AI Project Strategist", position: [4.4, 1.95, -30.2], action: { type: "talk", staffId: "dev-strategy" } },
      { id: "st-gallery", kind: "panel", label: "Project gallery", position: [0, 2.4, -39.2], action: { type: "panel", panel: "gallery" } },
      { id: "st-quote", kind: "cta", label: "Request a proposal", position: [-3, 1.2, -33], action: { type: "request", kind: "quote" } },
      { id: "st-discovery", kind: "service", label: "Discovery Consultation", position: [3, 1.2, -35.5], action: { type: "service", slug: "discovery-consultation" } },
      { id: "st-creative", kind: "door", label: "← Creative Studio", position: [-9.4, 2.6, -23], action: { type: "go", scene: "creative" } },
      { id: "st-automation", kind: "door", label: "AI Lab →", position: [9.4, 2.6, -23], action: { type: "go", scene: "automation" } },
      { id: "st-reception", kind: "door", label: "Reception", position: [0, 2.6, -14.4], action: { type: "go", scene: "reception" } },
    ],
  },
  rooftop: {
    id: "rooftop",
    label: "Rooftop",
    department: null,
    pose: { position: [-7, 11.15, -5.6], target: [3, 6.2, 40] },
    bounds: { min: [-12, 10.2, -30], max: [12, 12.5, -4] },
    caption: {
      en: "The rooftop at sunset. Your next chapter starts here: request a proposal, book a consultation or send us your brief.",
    },
    hotspots: [
      { id: "roof-quote", kind: "cta", label: "Request a proposal", position: [-4, 10.2, -12], action: { type: "request", kind: "quote" } },
      { id: "roof-consult", kind: "cta", label: "Book a consultation", position: [0, 10.2, -12], action: { type: "request", kind: "consultation" } },
      { id: "roof-down", kind: "door", label: "Back to reception ↓", position: [3, 10.4, -8], action: { type: "go", scene: "reception" } },
    ],
  },
};

export const GUIDED_ORDER: SceneId[] = [
  "campus",
  "reception",
  "software",
  "marketing",
  "creative",
  "automation",
  "strategy",
  "rooftop",
];

// ── Navigation graph: scenes + doorway waypoints, so camera rails never cut through walls.
type NodeId = SceneId | "outside" | "lobby" | "eDoor" | "wDoor" | "lobbyBack" | "corridor" | "cwDoor" | "ceDoor" | "stDoor" | "atrium" | "skylight";

const WAYPOINTS: Record<Exclude<NodeId, SceneId>, Vec3> = {
  outside: [0, 2.4, 9],
  lobby: [0, 2.35, -6.5],
  eDoor: [10, 2.25, -7],
  wDoor: [-10, 2.25, -7],
  lobbyBack: [0, 2.35, -14],
  corridor: [0, 2.35, -20],
  cwDoor: [-10, 2.25, -23],
  ceDoor: [10, 2.25, -23],
  stDoor: [0, 2.35, -26],
  atrium: [0, 6.5, -8],
  skylight: [0, 10.4, -8],
};

const EDGES: [NodeId, NodeId][] = [
  ["campus", "outside"],
  ["outside", "reception"],
  ["reception", "lobby"],
  ["lobby", "eDoor"],
  ["eDoor", "software"],
  ["lobby", "wDoor"],
  ["wDoor", "marketing"],
  ["lobby", "lobbyBack"],
  ["lobbyBack", "corridor"],
  ["corridor", "cwDoor"],
  ["cwDoor", "creative"],
  ["corridor", "ceDoor"],
  ["ceDoor", "automation"],
  ["corridor", "stDoor"],
  ["stDoor", "strategy"],
  ["lobby", "atrium"],
  ["atrium", "skylight"],
  ["skylight", "rooftop"],
];

const ADJ = new Map<NodeId, NodeId[]>();
for (const [a, b] of EDGES) {
  ADJ.set(a, [...(ADJ.get(a) ?? []), b]);
  ADJ.set(b, [...(ADJ.get(b) ?? []), a]);
}

const isScene = (n: NodeId): n is SceneId => n in SCENES;

/** Shortest node path between two scenes (BFS). */
export function nodePath(from: SceneId, to: SceneId): NodeId[] {
  if (from === to) return [from];
  const prev = new Map<NodeId, NodeId | null>([[from, null]]);
  const queue: NodeId[] = [from];
  while (queue.length) {
    const n = queue.shift()!;
    if (n === to) break;
    for (const m of ADJ.get(n) ?? []) {
      if (!prev.has(m)) {
        prev.set(m, n);
        queue.push(m);
      }
    }
  }
  const path: NodeId[] = [];
  for (let n: NodeId | null | undefined = to; n != null; n = prev.get(n)) path.unshift(n);
  return path[0] === from ? path : [from, to];
}

/** Camera rail control points: start pose → waypoints (skipping intermediate scene poses) → target pose. */
export function railPoints(from: SceneId, to: SceneId, startPosition?: Vec3): Vec3[] {
  const nodes = nodePath(from, to);
  const pts: Vec3[] = [startPosition ?? SCENES[from].pose.position];
  for (const n of nodes.slice(1, -1)) {
    pts.push(isScene(n) ? SCENES[n].pose.position : WAYPOINTS[n]);
  }
  pts.push(SCENES[to].pose.position);
  return pts;
}

/**
 * Nearby scenes for zone streaming while idle: reachable through at most three
 * doorway waypoints and no other scene. (During transit every zone is mounted.)
 */
export function neighbours(scene: SceneId): SceneId[] {
  const out: SceneId[] = [];
  for (const s of Object.keys(SCENES) as SceneId[]) {
    if (s === scene) continue;
    const mid = nodePath(scene, s).slice(1, -1);
    if (mid.length <= 3 && mid.every((n) => !isScene(n))) out.push(s);
  }
  return out;
}

export function sceneForDepartment(slug: DepartmentSlug): SceneId {
  return (Object.values(SCENES).find((s) => s.department === slug)?.id ?? "reception") as SceneId;
}
