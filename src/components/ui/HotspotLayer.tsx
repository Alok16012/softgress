"use client";
import { staffById } from "@/content/staff";
import { STAFF_PLACEMENT } from "@/lib/tour/placements";
import { SCENES, type Hotspot } from "@/lib/tour/scenes";
import { useTour } from "@/stores/tour";
import { registerAnchor, useStaffHover } from "@/components/tour/anchors";
import { useHotspotAction } from "./useHotspotAction";

const ICON: Record<Hotspot["kind"], string> = { service: "+", door: "→", panel: "◳", cta: "★", staff: "AI" };

/**
 * Visual hotspot pills positioned over the 3D view (mouse/touch). Keyboard and
 * screen-reader users get the same actions from the "In this room" list.
 */
export function HotspotLayer() {
  const scene = useTour((s) => s.state.scene);
  const phase = useTour((s) => s.state.phase);
  const staffId = useTour((s) => s.state.staffId);
  const hover = useStaffHover((s) => s.id);
  const run = useHotspotAction();
  const showSpots = phase === "idle" || phase === "entry";
  const spots = SCENES[scene].hotspots.filter((h) => h.kind !== "staff");
  const tagId = phase === "dialogue" ? staffId : hover;
  const tagStaff = tagId ? staffById.get(tagId) : null;
  const tagPlace = tagId ? STAFF_PLACEMENT[tagId] : null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {showSpots &&
        spots.map((h) => (
          <button
            key={`${scene}:${h.id}`}
            ref={(el) => registerAnchor(`hs:${scene}:${h.id}`, h.position, el)}
            type="button"
            tabIndex={-1}
            className={`sg-hotspot sg-hotspot--${h.kind} absolute left-0 top-0 opacity-0`}
            onClick={() => run(h.action)}
          >
            <span className="sg-hotspot__dot">{ICON[h.kind]}</span>
            <span className="sg-hotspot__label">{h.label}</span>
          </button>
        ))}
      {tagStaff && tagPlace && phase !== "transit" && (
        <div
          key={`tag:${tagStaff.id}`}
          ref={(el) => registerAnchor(`tag:${tagStaff.id}`, [tagPlace.position[0], tagPlace.position[1] + 2.15, tagPlace.position[2]], el)}
          className="sg-staff-tag absolute left-0 top-0 opacity-0"
        >
          <strong>{phase === "dialogue" ? tagStaff.displayName : `Talk to ${tagStaff.displayName}`}</strong>
          <span>{tagStaff.roleTitle} · AI guide</span>
        </div>
      )}
    </div>
  );
}
