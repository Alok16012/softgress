"use client";
import { useEffect } from "react";
import { RequestFlow, type DirectChannels } from "@/components/ui/RequestFlow";
import { useBrief } from "@/stores/brief";
import type { RequestKind } from "@/lib/types";

export function ContactClient({ kind, service, direct = null }: { kind: RequestKind | null; service: string | null; direct?: DirectChannels | null }) {
  const set = useBrief((b) => b.set);
  useEffect(() => {
    if (!service) return;
    const b = useBrief.getState().brief;
    if (!b.serviceSlugs.includes(service)) set({ serviceSlugs: [...b.serviceSlugs, service] });
  }, [service, set]);
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <RequestFlow initialKind={kind ?? undefined} direct={direct} />
    </div>
  );
}
