"use client";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { BRIEF_BUDGETS, BUDGET_LABELS, type ProjectBrief } from "@/lib/types";
import { useBrief } from "@/stores/brief";
import { useCatalog } from "./CatalogContext";

const PLATFORMS = ["Web", "Android", "iOS", "Desktop", "WhatsApp", "Instagram", "Facebook", "Google", "LinkedIn", "YouTube"];

function TagInput({ id, value, onChange, placeholder }: { id: string; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().slice(0, 120);
    if (v && !value.includes(v) && value.length < 30) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          id={id}
          className="field"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-ghost !px-3" onClick={add} aria-label="Add">
          <Plus size={18} />
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((v) => (
            <li key={v} className="chip !pr-1">
              {v}
              <button type="button" className="rounded-full p-1 hover:bg-white/10" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}>
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Visible, editable project brief. Everything stays in this browser session until submitted. */
export function BriefEditor({ errors = {}, compact }: { errors?: Record<string, string>; compact?: boolean }) {
  const brief = useBrief((b) => b.brief);
  const set = useBrief((b) => b.set);
  const reset = useBrief((b) => b.reset);
  const { services, departments } = useCatalog();
  const [confirming, setConfirming] = useState(false);
  const upd = (p: Partial<ProjectBrief>) => set(p);
  const toggleService = (slug: string) =>
    upd({ serviceSlugs: brief.serviceSlugs.includes(slug) ? brief.serviceSlugs.filter((s) => s !== slug) : [...brief.serviceSlugs, slug].slice(0, 10) });

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="label">Services you&apos;re interested in</legend>
        <div className={`space-y-3 ${compact ? "max-h-56 overflow-y-auto scrollbar-thin pr-1" : ""}`}>
          {departments
            .filter((d) => d.slug !== "reception")
            .map((d) => (
              <div key={d.slug}>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-1.5">{d.shortName}</p>
                <div className="flex flex-wrap gap-2">
                  {services
                    .filter((s) => s.departmentSlug === d.slug)
                    .map((s) => (
                      <button key={s.slug} type="button" className="chip" aria-pressed={brief.serviceSlugs.includes(s.slug)} onClick={() => toggleService(s.slug)}>
                        {s.title}
                      </button>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="b-type">
            Project type
          </label>
          <input id="b-type" className="field" value={brief.projectType} maxLength={120} placeholder="e.g. E-commerce website" onChange={(e) => upd({ projectType: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="b-industry">
            Industry
          </label>
          <input id="b-industry" className="field" value={brief.industry} maxLength={80} placeholder="e.g. Fashion retail" onChange={(e) => upd({ industry: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="b-goals">
          Goals
        </label>
        <textarea id="b-goals" className="field min-h-20" value={brief.goals} maxLength={1500} placeholder="What should this project achieve?" onChange={(e) => upd({ goals: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="b-scope">
          Scope &amp; requirements
        </label>
        <textarea id="b-scope" className="field min-h-24" value={brief.scope} maxLength={3000} placeholder="Pages, users, integrations, content you already have…" onChange={(e) => upd({ scope: e.target.value })} />
        {errors["brief.scope"] && <p className="field-error">{errors["brief.scope"]}</p>}
      </div>

      <div>
        <label className="label" htmlFor="b-features">
          Key features
        </label>
        <TagInput id="b-features" value={brief.features} onChange={(features) => upd({ features })} placeholder="Type a feature and press Enter" />
      </div>

      <fieldset>
        <legend className="label">Platforms / channels</legend>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              className="chip"
              aria-pressed={brief.platforms.includes(p)}
              onClick={() => upd({ platforms: brief.platforms.includes(p) ? brief.platforms.filter((x) => x !== p) : [...brief.platforms, p] })}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="b-budget">
            Budget range
          </label>
          <select id="b-budget" className="field" value={brief.budget} onChange={(e) => upd({ budget: e.target.value as ProjectBrief["budget"] })}>
            <option value="">Prefer not to say</option>
            {BRIEF_BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[b]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="b-date">
            Target timing
          </label>
          <input id="b-date" className="field" value={brief.targetDate} maxLength={60} placeholder="e.g. within 3 months" onChange={(e) => upd({ targetDate: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="b-notes">
          Anything else
        </label>
        <textarea id="b-notes" className="field min-h-16" value={brief.notes} maxLength={2000} onChange={(e) => upd({ notes: e.target.value })} />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-white/55">Your draft stays in this browser tab until you submit it.</p>
        {confirming ? (
          <span className="flex gap-2">
            <button
              type="button"
              className="btn-ghost !min-h-9 !px-3 text-sm text-red-200"
              onClick={() => {
                reset();
                setConfirming(false);
              }}
            >
              Yes, delete draft
            </button>
            <button type="button" className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => setConfirming(false)}>
              Keep
            </button>
          </span>
        ) : (
          <button type="button" className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => setConfirming(true)}>
            <Trash2 size={14} aria-hidden /> Delete draft
          </button>
        )}
      </div>
    </div>
  );
}
