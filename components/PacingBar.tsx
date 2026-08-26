import type { Pacing } from "@/lib/pacing";

const STATUS_STYLES: Record<Pacing["status"], string> = {
  ahead: "text-accent",
  behind: "text-[#9a6a12]",
  onTrack: "text-gray-500",
};

function statusCopy(pacing: Pacing): string {
  const n = Math.abs(pacing.unitsAhead);
  if (pacing.status === "ahead") return `${n} subskill${n === 1 ? "" : "s"} ahead of pace`;
  if (pacing.status === "behind") return `${n} subskill${n === 1 ? "" : "s"} behind pace`;
  return "Right on pace";
}

/**
 * Shows today's position within the study plan against a steady-pace line,
 * so a student can tell at a glance whether they're ahead, on track, or
 * behind — without it feeling like a scolding.
 */
export function PacingBar({ pacing }: { pacing: Pacing }) {
  const weekOfCourse = Math.min(pacing.totalWeeks, Math.ceil(pacing.dayOfCourse / 7));
  const todayMarker = Math.min(98, Math.max(2, pacing.pctExpected));

  return (
    <div className="bg-[#eef0fc] border border-[#d7dbf3] rounded-xl p-6 mb-5">
      <div className="flex justify-between items-baseline mb-1 flex-wrap gap-x-3 gap-y-1">
        <span className="text-sm font-semibold text-ink">Study plan pace</span>
        <span className="text-xs text-[#6b6f8e]">
          Week {weekOfCourse} of {pacing.totalWeeks} &middot; Day {pacing.dayOfCourse} of {pacing.totalDays}
        </span>
      </div>
      <div className="relative mt-6 mb-2">
        <div
          className="absolute -top-4 -translate-x-1/2 text-[9px] font-semibold text-[#6b6f8e] uppercase tracking-wide whitespace-nowrap"
          style={{ left: `${todayMarker}%` }}
        >
          Today
        </div>
        <div className="relative h-3 bg-white/70 rounded-md overflow-hidden">
          <div
            className="h-full bg-[#6d7fd6] rounded-md transition-all duration-700 ease-out"
            style={{ width: `${pacing.pctComplete}%` }}
          />
        </div>
        <div
          className="absolute top-0 w-0.5 h-3 bg-ink/60 -translate-x-1/2"
          style={{ left: `${todayMarker}%` }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between items-baseline mt-1">
        <span className="text-xs text-[#6b6f8e]">
          {pacing.completedUnits} / {pacing.totalUnits} subskills done
        </span>
        <span className={`text-xs font-semibold ${STATUS_STYLES[pacing.status]}`}>
          {statusCopy(pacing)}
        </span>
      </div>
    </div>
  );
}
