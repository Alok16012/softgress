"use client";
import { ArrowRight, ExternalLink, MessageCircle, Play, Plus, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { staffByDepartment } from "@/content/staff";
import { sceneForDepartment } from "@/lib/tour/scenes";
import type { PanelRef } from "@/lib/tour/machine";
import { useBrief } from "@/stores/brief";
import { useTour } from "@/stores/tour";
import { priceLabel, useCatalog } from "./CatalogContext";
import { Dialog } from "./Dialog";
import { RequestFlow } from "./RequestFlow";
import { BriefEditor } from "./BriefEditor";

// ── Service ────────────────────────────────────────────────────────────────
function ServicePanel({ slug }: { slug: string }) {
  const { services, departments } = useCatalog();
  const dispatch = useTour((s) => s.dispatch);
  const brief = useBrief((b) => b.brief);
  const setBrief = useBrief((b) => b.set);
  const s = services.find((x) => x.slug === slug);
  if (!s) return <p>That service isn&apos;t available.</p>;
  const dept = departments.find((d) => d.slug === s.departmentSlug);
  const guide = staffByDepartment.get(s.departmentSlug);
  const inBrief = brief.serviceSlugs.includes(s.slug);
  return (
    <div className="space-y-5">
      <p className="text-lg text-white/85">{s.summary}</p>
      <p className="text-white/75">{s.description}</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <section>
          <h3 className="font-semibold text-mint mb-2">Typical deliverables</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/85">
            {s.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="font-semibold text-mint mb-2">What we&apos;ll need from you</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/85">
            {s.whatWeNeed.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>
      </div>
      <section>
        <h3 className="font-semibold text-mint mb-2">How it works</h3>
        <ol className="flex flex-wrap gap-2 text-sm">
          {s.process.map((p, i) => (
            <li key={p} className="chip">
              <span className="text-teal font-bold">{i + 1}</span> {p}
            </li>
          ))}
        </ol>
      </section>
      <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-white/70">Pricing</span>
        <strong>{priceLabel(s)}</strong>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => {
          if (!inBrief) setBrief({ serviceSlugs: [...brief.serviceSlugs, s.slug], projectType: brief.projectType || s.title });
          dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: "quote" } });
        }}>
          Request a quote <ArrowRight size={18} aria-hidden />
        </button>
        <button type="button" className="btn-ghost" disabled={inBrief} onClick={() => setBrief({ serviceSlugs: [...brief.serviceSlugs, s.slug], projectType: brief.projectType || s.title })}>
          <Plus size={18} aria-hidden /> {inBrief ? "In your brief" : "Add to brief"}
        </button>
        {guide && (
          <button type="button" className="btn-ghost" onClick={() => dispatch({ type: "TALK", staffId: guide.id })}>
            <MessageCircle size={18} aria-hidden /> Ask {guide.displayName} ({dept?.shortName})
          </button>
        )}
        <Link href={`/services/${s.slug}`} className="btn-ghost">
          Service page <ExternalLink size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

// ── Search ("I know what I need") ──────────────────────────────────────────
const HINGLISH_HINTS: Record<string, string> = { dukaan: "ecommerce", dukan: "ecommerce", banwana: "", chalwane: "ads", kitna: "", website: "website" };

function SearchPanel() {
  const { services, departments } = useCatalog();
  const dispatch = useTour((s) => s.dispatch);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string | null>(null);
  const results = useMemo(() => {
    const terms = q
      .toLowerCase()
      .split(/\s+/)
      .map((t) => HINGLISH_HINTS[t] ?? t)
      .filter(Boolean);
    return services
      .filter((s) => !dept || s.departmentSlug === dept)
      .map((s) => {
        const hay = `${s.title} ${s.summary} ${s.keywords.join(" ")}`.toLowerCase();
        const score = terms.length ? terms.reduce((a, t) => a + (hay.includes(t) ? (s.title.toLowerCase().includes(t) ? 3 : 1) : 0), 0) : 1;
        return { s, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [q, dept, services]);
  return (
    <div>
      <label htmlFor="svc-search" className="sr-only">
        Search services
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} aria-hidden />
        <input id="svc-search" autoFocus className="field !pl-10" placeholder="What do you need? e.g. online store, Meta ads, WhatsApp bot" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by department">
        <button type="button" className="chip" aria-pressed={!dept} onClick={() => setDept(null)}>
          All
        </button>
        {departments
          .filter((d) => d.slug !== "reception")
          .map((d) => (
            <button key={d.slug} type="button" className="chip" aria-pressed={dept === d.slug} onClick={() => setDept(d.slug)}>
              {d.shortName}
            </button>
          ))}
      </div>
      <ul className="mt-4 grid sm:grid-cols-2 gap-3" aria-live="polite">
        {results.map(({ s }) => {
          const guide = staffByDepartment.get(s.departmentSlug);
          return (
            <li key={s.slug} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">{departments.find((d) => d.slug === s.departmentSlug)?.shortName}</p>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-white/70">{s.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="chip" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "service", slug: s.slug } })}>
                  View service
                </button>
                {guide && (
                  <button type="button" className="chip" onClick={() => dispatch({ type: "TALK", staffId: guide.id })}>
                    Talk to {guide.displayName}
                  </button>
                )}
                <button type="button" className="chip" onClick={() => dispatch({ type: "GO", scene: sceneForDepartment(s.departmentSlug) })}>
                  Visit department
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {results.length === 0 && (
        <p className="mt-4 text-white/70">
          No exact match.{" "}
          <button type="button" className="underline text-mint" onClick={() => dispatch({ type: "TALK", staffId: "aanya-reception" })}>
            Ask Aanya at reception
          </button>{" "}
          to find the right team.
        </p>
      )}
    </div>
  );
}

// ── Info panels ────────────────────────────────────────────────────────────
function Gallery() {
  const { projects, services } = useCatalog();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <p className="text-sm text-white/70 mb-4">
        Approved client case studies appear here once published by Softgress. Until then, this gallery shows <strong>sample concepts</strong> created for this site: not client work, no results claimed.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {projects.map((p) => (
          <li key={p.slug} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
            {p.isSample && <span className="badge badge-sample">SAMPLE CONCEPT</span>}
            <h3 className="mt-2 font-semibold">{p.title.replace(/^Sample concept:\s*/i, "")}</h3>
            <p className="mt-1 text-sm text-white/70">{p.summary}</p>
            <p className="mt-2 text-xs text-white/50">{p.industry}</p>
            <button type="button" className="mt-3 chip" aria-expanded={open === p.slug} onClick={() => setOpen(open === p.slug ? null : p.slug)}>
              {open === p.slug ? "Hide details" : "Details"}
            </button>
            {open === p.slug && (
              <div className="mt-3 text-sm text-white/80 space-y-2">
                <p>{p.body}</p>
                <p className="text-white/60">Services: {p.serviceSlugs.map((s) => services.find((x) => x.slug === s)?.title ?? s).join(", ")}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const FLOW = [
  { id: "form", label: "Meta lead form", log: "New synthetic lead received: 'Priya (demo)', service: e-commerce" },
  { id: "validate", label: "Validate & dedupe", log: "Email/phone format OK · no duplicate in demo CRM" },
  { id: "score", label: "Score (rules)", log: "Rules: budget 3–10L (+2), timeline < 3 months (+1) → score 3 (warm)" },
  { id: "route", label: "Route by service", log: "Service = e-commerce → Software team queue" },
  { id: "whatsapp", label: "WhatsApp opt-in message", log: "Opt-in present (synthetic) → template 'thanks_for_enquiry' queued" },
  { id: "crm", label: "CRM: create deal", log: "Deal created in demo CRM · stage: New" },
  { id: "notify", label: "Notify owner", log: "Owner alerted in demo channel" },
  { id: "report", label: "Daily report agent", log: "Added to tomorrow's summary (human-reviewed)" },
];

function WorkflowDemo() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const reduced = useTour((s) => s.prefs.reducedMotion);
  const run = async () => {
    setRunning(true);
    for (let i = 0; i < FLOW.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, reduced ? 0 : 650));
    }
    setRunning(false);
  };
  return (
    <div>
      <p className="text-sm text-white/70">
        An interactive example of a lead-routing automation. <strong>All data is synthetic</strong>; nothing is sent anywhere.
      </p>
      <ol className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FLOW.map((n, i) => (
          <li key={n.id} className={`rounded-xl border px-3 py-3 text-sm transition ${i <= step ? "border-teal bg-teal/15 text-white" : "border-white/12 text-white/65"}`} aria-current={i === step ? "step" : undefined}>
            <span className="text-xs text-white/50">Step {i + 1}</span>
            <span className="block font-semibold">{n.label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-3 font-mono text-xs min-h-28" aria-live="polite">
        {step < 0 ? (
          <span className="text-white/50">Press “Run demo” to send a synthetic lead through the workflow.</span>
        ) : (
          FLOW.slice(0, step + 1).map((n) => (
            <div key={n.id}>
              <span className="text-teal">✓</span> {n.log}
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button type="button" className="btn-primary" onClick={() => void run()} disabled={running}>
          <Play size={16} aria-hidden /> Run demo
        </button>
        <button type="button" className="btn-ghost" onClick={() => setStep(-1)} disabled={running}>
          <RotateCcw size={16} aria-hidden /> Reset
        </button>
      </div>
    </div>
  );
}

function Showcase() {
  const [pos, setPos] = useState(50);
  return (
    <div>
      <p className="text-sm text-white/70 mb-3">
        Drag to compare a wireframe with the finished design. <strong>Original sample concept made for this site</strong>, not client work.
      </p>
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 select-none">
        {/* After */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2233] to-[#07111F] p-6">
          <div className="h-8 w-32 rounded-lg bg-teal" />
          <div className="mt-6 h-6 w-3/4 rounded bg-white/90" />
          <div className="mt-3 h-4 w-1/2 rounded bg-white/50" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {["#29C6C0", "#A8F0D3", "#F4B860"].map((c) => (
              <div key={c} className="h-24 rounded-xl" style={{ background: c }} />
            ))}
          </div>
          <div className="mt-6 h-10 w-40 rounded-xl bg-mint" />
        </div>
        {/* Before (wireframe) */}
        <div className="absolute inset-0 bg-[#EDEDED] p-6" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <div className="h-8 w-32 rounded border-2 border-dashed border-gray-400" />
          <div className="mt-6 h-6 w-3/4 rounded bg-gray-300" />
          <div className="mt-3 h-4 w-1/2 rounded bg-gray-300" />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded border-2 border-dashed border-gray-400" />
            ))}
          </div>
          <div className="mt-6 h-10 w-40 rounded border-2 border-dashed border-gray-400" />
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }} aria-hidden />
      </div>
      <label htmlFor="showcase" className="sr-only">
        Comparison position
      </label>
      <input id="showcase" type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="mt-3 w-full accent-teal" />
      <div className="flex justify-between text-xs text-white/55">
        <span>Before: wireframe</span>
        <span>After: final UI</span>
      </div>
    </div>
  );
}

function Directory() {
  const { departments } = useCatalog();
  const dispatch = useTour((s) => s.dispatch);
  return (
    <ul className="grid sm:grid-cols-2 gap-3">
      {departments.map((d) => {
        const guide = staffByDepartment.get(d.slug);
        return (
          <li key={d.slug} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
            <h3 className="font-semibold">{d.name}</h3>
            <p className="mt-1 text-sm text-white/70">{d.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="chip" onClick={() => dispatch({ type: "GO", scene: d.sceneId })}>
                Go there <ArrowRight size={14} aria-hidden />
              </button>
              {guide && (
                <button type="button" className="chip" onClick={() => dispatch({ type: "TALK", staffId: guide.id })}>
                  Talk to {guide.displayName}
                </button>
              )}
            </div>
          </li>
        );
      })}
      <li className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
        <h3 className="font-semibold">Rooftop terrace</h3>
        <p className="mt-1 text-sm text-white/70">Sunset views and your next step.</p>
        <button type="button" className="mt-3 chip" onClick={() => dispatch({ type: "GO", scene: "rooftop" })}>
          Go up <ArrowRight size={14} aria-hidden />
        </button>
      </li>
    </ul>
  );
}

function Dashboard() {
  const pts = [22, 28, 26, 34, 31, 40, 38, 47, 45, 52, 58, 55];
  const max = 60;
  return (
    <div>
      <span className="badge badge-warn">ILLUSTRATIVE · SYNTHETIC DATA</span>
      <p className="mt-3 text-sm text-white/75">
        The marketing room&apos;s screens show how campaigns are monitored: pacing, conversions and lead quality. These numbers are made up for illustration; they are not client results.
      </p>
      <svg viewBox="0 0 360 140" className="mt-4 w-full rounded-xl bg-black/25 border border-white/10" role="img" aria-label="Illustrative line chart of weekly leads (synthetic)">
        <polyline fill="none" stroke="#29C6C0" strokeWidth="3" points={pts.map((p, i) => `${15 + i * 30},${130 - (p / max) * 115}`).join(" ")} />
        {pts.map((p, i) => (
          <circle key={i} cx={15 + i * 30} cy={130 - (p / max) * 115} r="3" fill="#A8F0D3" />
        ))}
      </svg>
      <ul className="mt-4 list-disc pl-5 text-sm text-white/80 space-y-1">
        <li>Tracking first: GA4, Tag Manager, Meta Pixel / Conversions API.</li>
        <li>Weekly optimisation and plain-language reporting.</li>
        <li>Ad spend is paid directly to Google/Meta, separate from fees.</li>
      </ul>
    </div>
  );
}

const INFO_TITLES = {
  gallery: "Project gallery",
  workflow: "Lead-routing workflow (demo data)",
  showcase: "Before / after design showcase",
  directory: "Building directory",
  dashboard: "Campaign wall",
} as const;

/** Maps the machine's panel state to accessible dialogs. */
export function PanelHost() {
  const panel = useTour((s) => (s.state.phase === "panel" ? s.state.panel : null));
  const dispatch = useTour((s) => s.dispatch);
  const { services } = useCatalog();
  const close = () => dispatch({ type: "CLOSE_PANEL" });
  if (!panel) return null;
  return <PanelDialog panel={panel} onClose={close} serviceTitle={(slug) => services.find((s) => s.slug === slug)?.title ?? "Service"} />;
}

function PanelDialog({ panel, onClose, serviceTitle }: { panel: PanelRef; onClose: () => void; serviceTitle: (slug: string) => string }) {
  switch (panel.type) {
    case "service":
      return (
        <Dialog open onClose={onClose} title={serviceTitle(panel.slug)} wide>
          <ServicePanel slug={panel.slug} />
        </Dialog>
      );
    case "search":
      return (
        <Dialog open onClose={onClose} title="What do you need?" subtitle="Search services, then view details, talk to a guide or walk to the department." wide>
          <SearchPanel />
        </Dialog>
      );
    case "brief":
      return (
        <Dialog open onClose={onClose} title="Your project brief" subtitle="Editable at any time. Nothing is sent until you submit a request.">
          <BriefEditor />
          <BriefFooter />
        </Dialog>
      );
    case "request":
      return (
        <Dialog open onClose={onClose} title="Start a request" subtitle="Takes about a minute. You'll get a reference code.">
          <RequestFlow initialKind={panel.kind} onDone={onClose} />
        </Dialog>
      );
    case "info":
      return (
        <Dialog open onClose={onClose} title={INFO_TITLES[panel.panel]} wide>
          {panel.panel === "gallery" && <Gallery />}
          {panel.panel === "workflow" && <WorkflowDemo />}
          {panel.panel === "showcase" && <Showcase />}
          {panel.panel === "directory" && <Directory />}
          {panel.panel === "dashboard" && <Dashboard />}
        </Dialog>
      );
  }
}

function BriefFooter() {
  const dispatch = useTour((s) => s.dispatch);
  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
      <button type="button" className="btn-ghost" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: "consultation" } })}>
        Book a consultation
      </button>
      <button type="button" className="btn-primary" onClick={() => dispatch({ type: "OPEN_PANEL", panel: { type: "request", kind: "quote" } })}>
        Request a quote <ArrowRight size={18} aria-hidden />
      </button>
    </div>
  );
}

