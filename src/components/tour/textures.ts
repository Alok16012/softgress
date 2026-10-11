"use client";
// Procedural canvas textures (no network, no binary assets). Cached per key.
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

// Deterministic PRNG so textures look the same every load.
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function finish(c: HTMLCanvasElement, key: string, repeat: [number, number] = [1, 1], color = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

export function concreteTexture(tone = 228) {
  const key = `concrete:${tone}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(512, 512);
  const r = rng(7 + tone);
  g.fillStyle = `rgb(${tone},${tone - 2},${tone - 6})`;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const v = tone - 18 + r() * 30;
    g.fillStyle = `rgba(${v},${v - 2},${v - 5},${0.08 + r() * 0.12})`;
    const s = 1 + r() * 3;
    g.fillRect(r() * 512, r() * 512, s, s);
  }
  // Formwork joints
  g.strokeStyle = `rgba(0,0,0,0.06)`;
  g.lineWidth = 2;
  for (let y = 0; y <= 512; y += 128) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
  }
  return finish(c, key, [1, 1]);
}

export function woodTexture(base = "#B07A4A") {
  const key = `wood:${base}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(512, 512);
  const r = rng(42);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) {
    const y = r() * 512;
    g.strokeStyle = `rgba(${60 + r() * 40},${35 + r() * 25},${15 + r() * 10},${0.08 + r() * 0.12})`;
    g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x / 60 + i) * 3 + (r() - 0.5) * 2);
    g.stroke();
  }
  // Plank seams
  g.fillStyle = "rgba(40,22,10,0.25)";
  for (let y = 0; y < 512; y += 64) g.fillRect(0, y, 512, 1.5);
  return finish(c, key);
}

export function floorTileTexture(base = "#E9E5DE", seam = "rgba(0,0,0,0.07)") {
  const key = `tile:${base}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(512, 512);
  const r = rng(99);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(120,110,100,${r() * 0.05})`;
    g.fillRect(r() * 512, r() * 512, 2 + r() * 6, 1 + r() * 3);
  }
  g.strokeStyle = seam;
  g.lineWidth = 2;
  for (let p = 0; p <= 512; p += 256) {
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, 512);
    g.moveTo(0, p);
    g.lineTo(512, p);
    g.stroke();
  }
  return finish(c, key);
}

export function carpetTexture(base = "#3D4650") {
  const key = `carpet:${base}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(256, 256);
  const r = rng(5);
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 12000; i++) {
    const v = r() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${0.03 + r() * 0.04})`;
    g.fillRect(r() * 256, r() * 256, 1, 1);
  }
  return finish(c, key);
}

export function asphaltTexture() {
  const key = "asphalt";
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(512, 512);
  const r = rng(11);
  g.fillStyle = "#3a3d42";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 20000; i++) {
    const v = 40 + r() * 50;
    g.fillStyle = `rgba(${v},${v},${v + 3},${0.3 + r() * 0.4})`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  return finish(c, key);
}

export function grassTexture() {
  const key = "grass";
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(512, 512);
  const r = rng(23);
  g.fillStyle = "#5f8a3e";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) {
    const gr = 100 + r() * 70;
    g.fillStyle = `rgba(${50 + r() * 40},${gr},${30 + r() * 25},${0.25 + r() * 0.35})`;
    g.fillRect(r() * 512, r() * 512, 1, 2 + r() * 3);
  }
  return finish(c, key);
}

// ── Signage ────────────────────────────────────────────────────────────────
export function signTexture(text: string, opts: { sub?: string; w?: number; h?: number; bg?: string; fg?: string; accent?: string } = {}) {
  const key = `sign:${text}:${opts.sub ?? ""}:${opts.bg ?? ""}:${opts.fg ?? ""}`;
  if (cache.has(key)) return cache.get(key)!;
  const w = opts.w ?? 1024;
  const h = opts.h ?? 256;
  const [c, g] = canvas(w, h);
  if (opts.bg && opts.bg !== "transparent") {
    g.fillStyle = opts.bg;
    g.fillRect(0, 0, w, h);
  }
  g.fillStyle = opts.fg ?? "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const size = Math.floor(h * (opts.sub ? 0.42 : 0.56));
  g.font = `700 ${size}px "Inter", "Helvetica Neue", Arial, sans-serif`;
  if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${Math.round(size * 0.12)}px`;
  g.fillText(text, w / 2, opts.sub ? h * 0.4 : h / 2);
  if (opts.sub) {
    g.font = `500 ${Math.floor(h * 0.16)}px "Inter", "Helvetica Neue", Arial, sans-serif`;
    if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = "2px";
    g.fillStyle = opts.accent ?? "#29C6C0";
    g.fillText(opts.sub, w / 2, h * 0.8);
  }
  return finish(c, key, [1, 1]);
}

// ── Screens ────────────────────────────────────────────────────────────────
const CODE_LINES = [
  ["kw", "export async function ", "fn", "createOrder", "p", "(cart: Cart) {"],
  ["p", "  const total = ", "fn", "sum", "p", "(cart.items.map(i => i.price * i.qty));"],
  ["kw", "  if ", "p", "(!cart.items.length) ", "kw", "throw new ", "fn", "EmptyCartError", "p", "();"],
  ["p", "  const order = ", "kw", "await ", "p", "db.orders.", "fn", "insert", "p", "({ total });"],
  ["kw", "  await ", "p", "payments.", "fn", "createIntent", "p", "(order.id, total);"],
  ["kw", "  return ", "p", "order;"],
  ["p", "}"],
  ["cm", "// a11y: keyboard focus order verified"],
  ["kw", "import ", "p", "{ test, expect } ", "kw", "from ", "s", "'@playwright/test'", "p", ";"],
  ["fn", "test", "p", "(", "s", "'checkout works'", "p", ", ", "kw", "async ", "p", "({ page }) => {"],
  ["kw", "  await ", "p", "page.", "fn", "goto", "p", "(", "s", "'/cart'", "p", ");"],
  ["kw", "  await ", "fn", "expect", "p", "(page.", "fn", "getByRole", "p", "(", "s", "'button'", "p", ")).", "fn", "toBeVisible", "p", "();"],
  ["p", "});"],
  ["cm", "// TODO: integrate shipping rates API"],
  ["kw", "const ", "p", "routes = [", "s", "'/'", "p", ", ", "s", "'/shop'", "p", ", ", "s", "'/account'", "p", "];"],
];
const COLORS: Record<string, string> = { kw: "#C792EA", fn: "#82AAFF", p: "#D6DEEB", s: "#ADDB67", cm: "#637777" };

export function drawCodeScreen(g: CanvasRenderingContext2D, w: number, h: number, offset: number, seed: number) {
  g.fillStyle = "#0B1622";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#0F1E2E";
  g.fillRect(0, 0, w, 28);
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(16 + i * 18, 14, 5, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = "#29C6C0";
  g.font = "600 13px monospace";
  g.fillText(["checkout.ts", "api/orders.ts", "app.spec.ts", "schema.sql"][seed % 4], 80, 18);
  g.font = "15px monospace";
  const lh = 21;
  for (let i = 0; i < Math.floor((h - 40) / lh); i++) {
    const line = CODE_LINES[(i + offset + seed) % CODE_LINES.length];
    let x = 46;
    g.fillStyle = "#3B5068";
    g.fillText(String(i + 1 + offset), 10, 48 + i * lh);
    for (let k = 0; k < line.length; k += 2) {
      g.fillStyle = COLORS[line[k]];
      g.fillText(line[k + 1], x, 48 + i * lh);
      x += g.measureText(line[k + 1]).width;
    }
  }
  g.fillStyle = "#29C6C0";
  g.fillRect(46 + ((offset * 37) % 300), 48 + ((offset % 8) * lh) - 14, 2, 18);
}

export function codeScreenTexture(seed: number) {
  const key = `code:${seed}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(640, 400);
  drawCodeScreen(g, 640, 400, 0, seed);
  return finish(c, key);
}

function label(g: CanvasRenderingContext2D, w: number) {
  g.fillStyle = "rgba(255,196,0,0.95)";
  g.fillRect(w - 186, 8, 178, 22);
  g.fillStyle = "#1a1300";
  g.font = "700 12px sans-serif";
  g.fillText("ILLUSTRATIVE DATA", w - 175, 24);
}

export function dashboardTexture(kind: "seo" | "ads" | "social" | "funnel" | "wall", seed = 1) {
  const key = `dash:${kind}:${seed}`;
  if (cache.has(key)) return cache.get(key)!;
  const W = kind === "wall" ? 1600 : 640;
  const H = kind === "wall" ? 600 : 400;
  const [c, g] = canvas(W, H);
  const r = rng(seed * 31 + kind.length);
  g.fillStyle = "#07111F";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#A8F0D3";
  g.font = `700 ${kind === "wall" ? 30 : 18}px sans-serif`;
  const titles = { seo: "Organic visibility (sample)", ads: "Campaign pacing (sample)", social: "Content calendar (sample)", funnel: "Lead funnel (sample)", wall: "Campaign command wall — sample metrics" };
  g.fillText(titles[kind], 20, kind === "wall" ? 46 : 32);
  label(g, W);
  // KPI tiles
  const tiles = kind === "wall" ? 5 : 3;
  const tw = (W - 40 - (tiles - 1) * 14) / tiles;
  const ty = kind === "wall" ? 74 : 48;
  for (let i = 0; i < tiles; i++) {
    const x = 20 + i * (tw + 14);
    g.fillStyle = "#0E2235";
    g.fillRect(x, ty, tw, kind === "wall" ? 110 : 70);
    g.fillStyle = "#6B8299";
    g.font = `500 ${kind === "wall" ? 18 : 12}px sans-serif`;
    g.fillText(["Sessions", "CTR", "Leads", "CPL", "Reach"][i], x + 12, ty + (kind === "wall" ? 30 : 20));
    g.fillStyle = "#FFFFFF";
    g.font = `700 ${kind === "wall" ? 38 : 24}px sans-serif`;
    const demoVals = [`${(8 + r() * 9).toFixed(1)}k`, `${(1.5 + r() * 3).toFixed(1)}%`, `${Math.round(90 + r() * 200)}`, `${Math.round(120 + r() * 300)}`, `${(40 + r() * 80).toFixed(0)}k`];
    g.fillText(demoVals[i], x + 12, ty + (kind === "wall" ? 82 : 54));
    g.fillStyle = "#29C6C0";
    g.font = `500 ${kind === "wall" ? 16 : 11}px sans-serif`;
    g.fillText("demo", x + tw - (kind === "wall" ? 60 : 40), ty + (kind === "wall" ? 82 : 54));
  }
  // Line chart
  const cx = 20;
  const cy = ty + (kind === "wall" ? 140 : 90);
  const cw = kind === "wall" ? W * 0.62 : W - 40;
  const ch = H - cy - 20;
  g.fillStyle = "#0B1B2B";
  g.fillRect(cx, cy, cw, ch);
  g.strokeStyle = "rgba(255,255,255,0.06)";
  for (let i = 1; i < 5; i++) {
    g.beginPath();
    g.moveTo(cx, cy + (ch * i) / 5);
    g.lineTo(cx + cw, cy + (ch * i) / 5);
    g.stroke();
  }
  for (const [col, amp] of [["#29C6C0", 0.6], ["#A8F0D3", 0.35]] as const) {
    g.strokeStyle = col;
    g.lineWidth = kind === "wall" ? 4 : 2.5;
    g.beginPath();
    let v = 0.3 + r() * 0.2;
    for (let x = 0; x <= 40; x++) {
      v = Math.min(0.92, Math.max(0.08, v + (r() - 0.45) * 0.08 * amp * 2));
      const px = cx + (cw * x) / 40;
      const py = cy + ch - v * ch;
      if (x === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
  }
  if (kind === "wall") {
    // Bar chart + map-ish blocks
    const bx = cx + cw + 20;
    const bw = W - bx - 20;
    g.fillStyle = "#0B1B2B";
    g.fillRect(bx, cy, bw, ch);
    for (let i = 0; i < 7; i++) {
      const hgt = (0.2 + r() * 0.7) * (ch - 40);
      g.fillStyle = i % 2 ? "#1E5F5C" : "#29C6C0";
      g.fillRect(bx + 20 + i * ((bw - 40) / 7), cy + ch - 20 - hgt, (bw - 40) / 7 - 10, hgt);
    }
  }
  return finish(c, key);
}

export function workflowTexture() {
  const key = "workflow";
  if (cache.has(key)) return cache.get(key)!;
  const W = 1400;
  const H = 600;
  const [c, g] = canvas(W, H);
  g.fillStyle = "#081420";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#A8F0D3";
  g.font = "700 30px sans-serif";
  g.fillText("Lead routing workflow — synthetic demo data", 28, 50);
  label(g, W);
  const nodes = [
    ["Meta lead form", 80, 200], ["Validate & dedupe", 380, 200], ["Score (rules)", 680, 200], ["Route by service", 980, 200],
    ["WhatsApp opt-in msg", 980, 420], ["CRM: create deal", 680, 420], ["Notify owner", 380, 420], ["Daily report agent", 80, 420],
  ] as const;
  g.strokeStyle = "#29C6C0";
  g.lineWidth = 4;
  const centers = nodes.map(([, x, y]) => [x + 120, y + 40] as const);
  const order = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let i = 0; i < order.length - 1; i++) {
    const [ax, ay] = centers[order[i]];
    const [bx, by] = centers[order[i + 1]];
    g.beginPath();
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.stroke();
  }
  for (const [name, x, y] of nodes) {
    g.fillStyle = "#0F2638";
    g.strokeStyle = "#29C6C0";
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, y, 240, 80, 14);
    g.fill();
    g.stroke();
    g.fillStyle = "#FFFFFF";
    g.font = "600 22px sans-serif";
    g.fillText(name, x + 18, y + 48);
  }
  return finish(c, key);
}

export function designTexture(seed: number) {
  const key = `design:${seed}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, g] = canvas(640, 400);
  const r = rng(seed + 300);
  g.fillStyle = "#1E1E1E";
  g.fillRect(0, 0, 640, 400);
  g.fillStyle = "#2C2C2C";
  g.fillRect(0, 0, 120, 400);
  g.fillRect(520, 0, 120, 400);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = "#3a3a3a";
    g.fillRect(12, 20 + i * 36, 96, 22);
  }
  // Artboard
  g.fillStyle = "#FFFFFF";
  g.fillRect(150, 30, 340, 340);
  const palette = ["#29C6C0", "#07111F", "#A8F0D3", "#F4B860", "#E85D75"];
  g.fillStyle = palette[seed % palette.length];
  g.fillRect(150, 30, 340, 90);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = palette[(seed + i + 1) % palette.length];
    g.fillRect(170 + i * 105, 150, 90, 90 + r() * 40);
  }
  g.fillStyle = "#C9CED6";
  for (let i = 0; i < 4; i++) g.fillRect(170, 290 + i * 18, 200 + r() * 90, 8);
  return finish(c, key);
}

export function galleryTexture() {
  const key = "gallery";
  if (cache.has(key)) return cache.get(key)!;
  const W = 1600;
  const H = 800;
  const [c, g] = canvas(W, H);
  g.fillStyle = "#07111F";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#FFFFFF";
  g.font = "700 46px sans-serif";
  g.fillText("Project gallery", 60, 90);
  g.fillStyle = "#29C6C0";
  g.font = "500 26px sans-serif";
  g.fillText("Sample concepts: clearly labelled, not client work", 60, 132);
  const cards = ["D2C storefront", "Clinic lead funnel", "Field-service SaaS", "Café rebrand"];
  cards.forEach((t, i) => {
    const x = 60 + i * 380;
    g.fillStyle = "#0F2236";
    g.beginPath();
    g.roundRect(x, 190, 350, 520, 22);
    g.fill();
    const grad = g.createLinearGradient(x, 190, x + 350, 450);
    grad.addColorStop(0, ["#29C6C0", "#A8F0D3", "#4F7CAC", "#F4B860"][i]);
    grad.addColorStop(1, "#07111F");
    g.fillStyle = grad;
    g.beginPath();
    g.roundRect(x, 190, 350, 260, [22, 22, 0, 0]);
    g.fill();
    g.fillStyle = "rgba(255,196,0,0.95)";
    g.fillRect(x + 20, 210, 150, 34);
    g.fillStyle = "#1a1300";
    g.font = "700 18px sans-serif";
    g.fillText("SAMPLE CONCEPT", x + 30, 234);
    g.fillStyle = "#FFFFFF";
    g.font = "700 30px sans-serif";
    g.fillText(t, x + 24, 510);
    g.fillStyle = "#8FA3B8";
    g.font = "400 22px sans-serif";
    g.fillText("Click to view details", x + 24, 556);
  });
  return finish(c, key);
}

export function brandWallTexture() {
  const key = "brandwall";
  if (cache.has(key)) return cache.get(key)!;
  const W = 1600;
  const H = 600;
  const [c, g] = canvas(W, H);
  g.fillStyle = "#F4F1EC";
  g.fillRect(0, 0, W, H);
  const swatches = ["#07111F", "#29C6C0", "#A8F0D3", "#FFFFFF", "#F4B860", "#E85D75"];
  swatches.forEach((s, i) => {
    g.fillStyle = s;
    g.fillRect(60 + i * 120, 70, 100, 160);
    g.strokeStyle = "rgba(0,0,0,0.1)";
    g.strokeRect(60 + i * 120, 70, 100, 160);
  });
  g.fillStyle = "#07111F";
  g.font = "800 92px sans-serif";
  g.fillText("Aa", 820, 190);
  g.font = "500 30px sans-serif";
  g.fillText("Type system · Logo studies · Moodboards", 820, 240);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = ["#E6E1D9", "#DCD6CC", "#D0E9E4"][i % 3];
    g.fillRect(60 + i * 250, 300, 220, 240);
    g.fillStyle = swatches[(i + 1) % swatches.length];
    g.beginPath();
    g.arc(170 + i * 250, 420, 60, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#7A7268";
  g.font = "500 22px sans-serif";
  g.fillText("Original sample studies (not client work)", 60, 580);
  return finish(c, key);
}

export function directoryTexture() {
  const key = "directory";
  if (cache.has(key)) return cache.get(key)!;
  const W = 600;
  const H = 1000;
  const [c, g] = canvas(W, H);
  g.fillStyle = "#07111F";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#29C6C0";
  g.font = "800 46px sans-serif";
  g.fillText("DIRECTORY", 40, 90);
  const rows: [string, string][] = [
    ["Reception", "You are here"],
    ["Software Development", "East wing →"],
    ["Digital Marketing", "← West wing"],
    ["Creative Studio", "West, rear"],
    ["AI & Automation Lab", "East, rear"],
    ["Strategy Boardroom", "Straight ahead"],
    ["Rooftop Terrace", "Atrium ↑"],
  ];
  rows.forEach(([a, b], i) => {
    const y = 180 + i * 112;
    g.fillStyle = "rgba(255,255,255,0.08)";
    g.fillRect(40, y - 46, W - 80, 1);
    g.fillStyle = "#FFFFFF";
    g.font = "600 32px sans-serif";
    g.fillText(a, 40, y);
    g.fillStyle = "#A8F0D3";
    g.font = "400 24px sans-serif";
    g.fillText(b, 40, y + 36);
  });
  return finish(c, key);
}
