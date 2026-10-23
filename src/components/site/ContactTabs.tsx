"use client";
import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { ClipboardList, MessageSquareText } from "lucide-react";

export type ContactTab = "enquiry" | "project";

const TABS: { value: ContactTab; label: string; hint: string; icon: typeof ClipboardList }[] = [
  { value: "enquiry", label: "Quick enquiry", hint: "One short form, takes a minute", icon: MessageSquareText },
  { value: "project", label: "Project request", hint: "Quote, consultation, callback or brief", icon: ClipboardList },
];

/** Switches between the quick enquiry form and the full project request flow. Only the active form is mounted. */
export function ContactTabs({ initial, enquiry, project }: { initial: ContactTab; enquiry: ReactNode; project: ReactNode }) {
  const [tab, setTab] = useState<ContactTab>(initial);
  return (
    <div>
      <div role="tablist" aria-label="Choose a form" className="mb-6 grid grid-cols-2 gap-2 rounded-[22px] border border-white/10 bg-white/[0.03] p-1.5">
        {TABS.map(({ value, label, hint, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`tab-${value}`}
            aria-selected={tab === value}
            aria-controls={`panel-${value}`}
            onClick={() => setTab(value)}
            className={clsx(
              "flex items-center gap-3 rounded-[16px] px-4 py-3 text-left transition-colors",
              tab === value ? "bg-teal text-midnight" : "text-white/75 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <Icon size={20} aria-hidden className="flex-none" />
            <span className="min-w-0">
              <span className="block font-bold leading-tight">{label}</span>
              <span className={clsx("hidden text-xs sm:block", tab === value ? "text-midnight/70" : "text-white/50")}>{hint}</span>
            </span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "enquiry" ? enquiry : project}
      </div>
    </div>
  );
}
