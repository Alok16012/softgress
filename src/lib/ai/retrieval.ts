// Lightweight BM25 retrieval over approved knowledge + the live service catalogue,
// with English/Hindi/Hinglish normalisation. Deterministic and dependency-free so it
// can run per request without an embedding service.
import type { DepartmentSlug, KnowledgeDocument, Service } from "@/lib/types";

export interface RetrievalDoc {
  id: string;
  title: string;
  body: string;
  departmentSlug: DepartmentSlug | null;
  kind: "knowledge" | "service";
  serviceSlug?: string;
}

const STOP = new Set(
  "a an the and or of to in on for with is are be can do does you your we our i me my it this that what how which who when where why from at by as about have has need want would like please".split(" "),
);

// Canonical term ← variants (English, Hinglish, Hindi).
const SYNONYMS: Record<string, string[]> = {
  ecommerce: ["e-commerce", "ecom", "shop", "store", "dukaan", "dukan", "shopify", "woocommerce", "cart", "checkout", "दुकान", "ऑनलाइन"],
  website: ["site", "webpage", "web", "landing", "वेबसाइट"],
  app: ["application", "android", "ios", "mobile", "ऐप"],
  price: ["pricing", "cost", "costs", "kitna", "kitne", "kitni", "paise", "rupaye", "rate", "rates", "budget", "fees", "fee", "charges", "quote", "estimate", "कीमत", "कितना", "खर्च"],
  timeline: ["time", "kab", "deadline", "duration", "weeks", "months", "jaldi", "delivery", "समय"],
  meta: ["facebook", "instagram", "insta", "fb"],
  ads: ["ad", "advertising", "campaign", "campaigns", "chalwane", "promotion", "विज्ञापन"],
  seo: ["ranking", "rank", "organic", "google search"],
  whatsapp: ["wa", "whatsapp", "व्हाट्सएप"],
  chatbot: ["bot", "assistant", "chatbots", "gpt", "llm"],
  automation: ["automate", "automatic", "workflow", "workflows", "zapier"],
  brand: ["branding", "logo", "identity"],
  video: ["reel", "reels", "shoot", "editing", "film"],
  portfolio: ["work", "projects", "case", "studies", "clients", "examples", "samples"],
  consultation: ["meeting", "call", "consult", "baat", "milna", "appointment", "book", "booking", "मीटिंग"],
  guarantee: ["guaranteed", "guarantees", "promise", "assured", "pakka", "100%"],
  privacy: ["data", "personal", "delete", "stored", "store"],
};
const CANON = new Map<string, string>();
for (const [canon, vars] of Object.entries(SYNONYMS)) {
  CANON.set(canon, canon);
  for (const v of vars) CANON.set(v, canon);
}

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase().replace(/e-commerce/g, "ecommerce");
  const raw = lower.match(/[\p{L}\p{N}]+/gu) ?? [];
  const out: string[] = [];
  for (let w of raw) {
    if (STOP.has(w) || w.length < 2) continue;
    w = CANON.get(w) ?? w;
    if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) w = CANON.get(w.slice(0, -1)) ?? w.slice(0, -1);
    out.push(w);
  }
  return out;
}

export function buildCorpus(knowledge: KnowledgeDocument[], services: Service[]): RetrievalDoc[] {
  const docs: RetrievalDoc[] = knowledge
    .filter((k) => k.approvedAt && k.visibility === "public")
    .map((k) => ({ id: k.id, title: k.title, body: k.body, departmentSlug: k.departmentSlug, kind: "knowledge" }));
  for (const s of services) {
    if (!s.active) continue;
    const price =
      s.pricingType === "custom" || s.startingPrice == null
        ? "Pricing: Custom quote required."
        : s.pricingType === "fixed"
          ? `Pricing: ${s.currency} ${s.startingPrice} (fixed, published).`
          : `Pricing: starting at ${s.currency} ${s.startingPrice} (published).`;
    docs.push({
      id: `svc:${s.slug}`,
      title: `Service: ${s.title}`,
      body: `${s.summary} ${s.description}\nDeliverables: ${s.deliverables.join("; ")}.\nProcess: ${s.process.join(" → ")}.\nWhat we need from you: ${s.whatWeNeed.join("; ")}.\n${price}\nKeywords: ${s.keywords.join(", ")}`,
      departmentSlug: s.departmentSlug,
      kind: "service",
      serviceSlug: s.slug,
    });
  }
  return docs;
}

export interface Hit {
  doc: RetrievalDoc;
  score: number;
}

export function search(
  corpus: RetrievalDoc[],
  query: string,
  opts: { departmentSlug?: DepartmentSlug | null; k?: number; boostDepartment?: number } = {},
): Hit[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const docs = corpus.map((d) => ({ d, toks: tokenize(`${d.title} ${d.title} ${d.body}`) }));
  const N = docs.length;
  const avg = docs.reduce((a, x) => a + x.toks.length, 0) / Math.max(1, N);
  const df = new Map<string, number>();
  for (const { toks } of docs) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  const k1 = 1.4;
  const b = 0.75;
  const hits: Hit[] = [];
  for (const { d, toks } of docs) {
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const t of new Set(q)) {
      const f = tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * toks.length) / avg)));
    }
    if (score <= 0) continue;
    if (opts.departmentSlug && d.departmentSlug === opts.departmentSlug) score *= opts.boostDepartment ?? 1.6;
    hits.push({ doc: d, score });
  }
  return hits.sort((a, b2) => b2.score - a.score).slice(0, opts.k ?? 6);
}

/**
 * Per-department retrieval filter: a guide sees shared docs + its own department's
 * docs. Reception sees everything (summary-level routing).
 */
export function corpusFor(corpus: RetrievalDoc[], departmentSlug: DepartmentSlug): RetrievalDoc[] {
  if (departmentSlug === "reception") return corpus;
  return corpus.filter((d) => d.departmentSlug === null || d.departmentSlug === departmentSlug || d.kind === "service");
}
