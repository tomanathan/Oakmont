import type { ParentReport } from "@/lib/parentInsights";

// The parent dashboard, composed for the homepage as a page taped into the
// notebook: the report card, a mastered skill and the Sunday email, filled
// in for an example student ("Maya") from lib/parentDemo.ts. The whole
// report lives at /parents/sample.

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
  if (n === 0) return <span className="nb-kpi-d">same as last week</span>;
  return (
    <span className="nb-kpi-d">
      {n > 0 ? "▲" : "▼"} {Math.abs(n)}
      {unit} vs last week
    </span>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: React.ReactNode }) {
  return (
    <div className="nb-kpi">
      <span className="nb-kpi-l">{label}</span>
      <b>{value}</b>
      {delta}
    </div>
  );
}

export function Snapshot({ r }: { r: ParentReport }) {
  const w = r.week;
  const maxDay = Math.max(1, ...w.dayFlags.map((d) => d.minutes));
  const help = r.talkingPoints.find((t) => t.kind === "celebrate") ?? r.talkingPoints[0];
  const mastered = r.strengths.find((s) => s.status === "mastered");
  return (
    <div className="nb-snap">
      <div className="nb-snap-card">
        <span className="nb-kicker">Your parent dashboard</span>
        <p className="nb-snap-name">{r.name}</p>
        <p className="nb-snap-sub">
          Last studied {agoText(r.lastActive)} &middot; {r.scores.daysUntilTest} days to the SAT
        </p>

        <div className="nb-snap-verdict">
          <span className="nb-kicker">On track</span>
          <p>{r.verdict.headline}</p>
        </div>

        <div className="nb-kpis">
          <Kpi label="Study time, 7 days" value={hm(w.minutes)} delta={<Up n={w.minutes - w.minutesPrev} unit=" min" />} />
          <Kpi label="Answered correctly" value={`${w.accuracy}%`} delta={<Up n={(w.accuracy ?? 0) - (w.accuracyPrev ?? 0)} unit=" pts" />} />
          <Kpi label="Questions" value={String(w.questions)} delta={<Up n={w.questions - w.questionsPrev} />} />
          <Kpi label="Skills mastered" value={`${r.mastery.mastered}/${r.mastery.total}`} delta={<span className="nb-kpi-d">{r.mastery.passed} more passed</span>} />
        </div>

        <div className="nb-week">
          <div className="nb-week-h">
            <span>Last 7 days</span>
            <span>{w.activeDays} of 7 days studied</span>
          </div>
          <div className="nb-bars">
            {w.dayFlags.map((d) => (
              <div key={d.day} className="nb-bar">
                <div
                  className={`nb-bar-fill ${d.minutes ? "" : "is-empty"}`}
                  style={{ height: d.minutes ? `${Math.max(12, (d.minutes / maxDay) * 44)}px` : "4px" }}
                  title={`${d.label}: ${d.minutes} min`}
                />
                <span>{d.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nb-snap-extras">
        {mastered && (
          <div className="nb-mastered">
            <span className="nb-kicker">★ Mastered</span>
            <b>{mastered.name}</b>
          </div>
        )}
        <div className="nb-mail">
          <div className="nb-mail-from">
            <span className="nb-mail-o" aria-hidden>
              O
            </span>
            <b>Oakmont</b>
            <span>&middot; Sunday, 8:00 AM</span>
          </div>
          <p className="nb-mail-subj">
            {r.name}&apos;s week: {r.verdict.headline}
          </p>
          {help && (
            <p className="nb-mail-body">
              <b>How you can help</b>
              {help.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
