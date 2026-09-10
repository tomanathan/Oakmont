import type { Pacing } from "@/lib/pacing";

export const PACE_STATUS_STYLES: Record<Pacing["status"], string> = {
  ahead: "text-accent",
  behind: "text-[#9a6a12]",
  onTrack: "text-gray-500",
};

export function paceStatusCopy(pacing: Pacing): string {
  const n = Math.abs(pacing.unitsAhead);
  if (pacing.status === "ahead") return `${n} subskill${n === 1 ? "" : "s"} ahead of pace`;
  if (pacing.status === "behind") return `${n} subskill${n === 1 ? "" : "s"} behind pace`;
  return "Right on pace";
}

/**
 * Just the progress-vs-steady-pace visual itself -- a bar with a "Today"
 * marker showing where the student should be against a steady-pace line,
 * so a glance shows whether they're ahead, on track, or behind without it
 * feeling like a scolding. Deliberately just the bar: it's embedded inside
 * the dashboard's combined "today + pace" card (see DashboardClient) rather
 * than owning its own card chrome or stats, which used to duplicate what
 * that card already shows (week number, subskill counts) in a second box.
 */
export function PacingBar({ pacing }: { pacing: Pacing }) {
  const todayMarker = Math.min(98, Math.max(2, pacing.pctExpected));

  return (
    <div className="relative mt-5 mb-1">
      <div
        className="absolute -top-4 -translate-x-1/2 text-[9px] font-semibold text-[#6b6f8e] uppercase tracking-wide whitespace-nowrap"
        style={{ left: `${todayMarker}%` }}
      >
        Today
      </div>
      {/* Neutral ink fill, not a subject color -- this bar is the whole
          course's trajectory, not Math's or Reading's, and it sits right
          under the two subject cards, which are each strongly hued. */}
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#43435c] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pacing.pctComplete}%` }}
        />
      </div>
      <div
        className="absolute top-0 w-0.5 h-2.5 bg-ink/60 -translate-x-1/2"
        style={{ left: `${todayMarker}%` }}
        aria-hidden
      />
    </div>
  );
}
