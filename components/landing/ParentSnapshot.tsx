import type { ParentReport } from "@/lib/parentInsights";

// The parent dashboard, composed for the homepage: the report card, the
// Sunday email and a mastery moment, filled in for an example student
// ("Maya") and presented as the parent's view. Shown beside the pitch in
// Pitch.tsx; the whole report lives at /parents/sample.

const GREEN = "#2f6f4f";

function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function agoText(iso: string | null): string {
  if (!iso) return "recently";
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

function Up({ n, unit = "" }: { n: number; unit?: string }) {
  if (n === 0) return <span className="text-[11px] text-gray-400">same as last week</span>;
  return (
    <span className={`text-[11px] font-semibold ${n > 0 ? "text-accent" : "text-[#b23b3b]"}`}>
      {n > 0 ? "▲" : "▼"} {Math.abs(n)}
      {unit} vs last week
    </span>
  );
}

const SAMPLE_PILL = (
  <span className="whitespace-nowrap rounded-full bg-pastel-sage px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
    Parent view
  </span>
);

// ---- the snapshot: report card + Sunday email + a mastery moment --------------

export function Snapshot({ r }: { r: ParentReport }) {
  const w = r.week;
  const maxDay = Math.max(1, ...w.dayFlags.map((d) => d.minutes));
  const help = r.talkingPoints.find((t) => t.kind === "celebrate") ?? r.talkingPoints[0];
  const mastered = r.strengths.find((s) => s.status === "mastered");
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
      {/* The report card. */}
      <div className="relative z-10 rounded-2xl border border-[#e6e3f3] bg-white p-5 shadow-[0_2px_4px_rgba(26,26,46,0.04),0_24px_60px_-20px_rgba(26,26,46,0.25)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500">Your parent dashboard</div>
            <div className="font-display text-[26px] font-semibold leading-tight text-ink">{r.name}</div>
            <div className="text-[12px] text-gray-500">
              Last studied {agoText(r.lastActive)} &middot; {r.scores.daysUntilTest} days to the SAT
            </div>
          </div>
          {SAMPLE_PILL}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#cfe6d8] bg-[#eef7f1] px-4 py-3">
          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden />
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">On track</div>
            <div className="font-display text-[17px] font-semibold leading-snug text-ink">{r.verdict.headline}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Kpi label="Study time, 7 days" value={hm(w.minutes)} delta={<Up n={w.minutes - w.minutesPrev} unit=" min" />} />
          <Kpi label="Answered correctly" value={`${w.accuracy}%`} delta={<Up n={(w.accuracy ?? 0) - (w.accuracyPrev ?? 0)} unit=" pts" />} />
          <Kpi label="Questions" value={String(w.questions)} delta={<Up n={w.questions - w.questionsPrev} />} />
          <Kpi label="Skills mastered" value={`${r.mastery.mastered}/${r.mastery.total}`} delta={<span className="text-[11px] text-gray-400">{r.mastery.passed} more passed</span>} />
        </div>

        <div className="mt-4 border-t border-[#f0eef8] pt-3">
          <div className="mb-2 flex items-baseline justify-between text-[11px] text-gray-400">
            <span>Last 7 days</span>
            <span>
              {w.activeDays} of 7 days studied
            </span>
          </div>
          <div className="flex h-14 items-end gap-1.5">
            {w.dayFlags.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-[4px]"
                  style={{
                    height: d.minutes ? `${Math.max(12, (d.minutes / maxDay) * 40)}px` : "4px",
                    background: d.minutes ? GREEN : "#ece4d3",
                    opacity: d.minutes ? 0.55 + 0.45 * (d.minutes / maxDay) : 1,
                  }}
                  title={`${d.label}: ${d.minutes} min`}
                />
                <span className="text-[10px] text-gray-400">{d.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A mastery moment, pinned to the corner. */}
      {mastered && (
        <div className="relative z-20 mx-auto -mt-2 w-fit rounded-md bg-forest-900 px-3.5 py-2.5 text-ivory shadow-lg ring-1 ring-sage/50 sm:absolute sm:-bottom-12 sm:-right-6 sm:mt-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-pastel-butter">★ Mastered</div>
          <div className="text-[13px] font-semibold">{mastered.name}</div>
        </div>
      )}

      {/* The Sunday email, tucked underneath. */}
      <div className="relative z-20 mt-4 rounded-2xl border border-[#e6e3f3] bg-[#fffdf9] p-4 shadow-[0_18px_40px_-18px_rgba(26,26,46,0.3)] sm:absolute sm:-bottom-32 sm:-left-10 sm:mt-0 sm:w-[300px]">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[9px] font-bold text-ivory">O</span>
          <span className="font-semibold text-ink">Oakmont</span>
          <span>&middot; Sunday, 8:00 AM</span>
        </div>
        <div className="mt-2 text-[13px] font-semibold leading-snug text-ink">
          {r.name}&apos;s week: {r.verdict.headline}
        </div>
        {help && (
          <div className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
            <span className="font-semibold text-gray-600">How you can help: </span>
            {help.text}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="font-display text-[22px] font-semibold leading-tight text-ink tabular-nums">{value}</div>
      {delta}
    </div>
  );
}

// ---- the section ----------------------------------------------------------------
