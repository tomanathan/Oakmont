import type { ParentReport } from "@/lib/parentInsights";

// The Sunday email: one card per linked student, built from the same
// report as the dashboard. Table layout and inline styles, for email
// clients.

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const TONE = {
  good: { label: "On track", color: "#2f6f4f", bg: "#eef7f1" },
  watch: { label: "Worth watching", color: "#9a6a12", bg: "#fffaf0" },
  act: { label: "Needs a push", color: "#b23b3b", bg: "#fdf1f1" },
} as const;

function delta(now: number | null, prev: number | null, unit = ""): string {
  if (now === null || prev === null || now === prev) return "";
  const d = now - prev;
  return `<div style="font-size:11px;color:${d > 0 ? "#2f6f4f" : "#b23b3b"};">${d > 0 ? "&#9650;" : "&#9660;"} ${Math.abs(d)}${unit} vs last week</div>`;
}

function stat(label: string, value: string, sub: string): string {
  return `<td style="padding:10px 8px;vertical-align:top;width:25%;">
    <div style="font-size:11px;color:#8a8499;">${label}</div>
    <div style="font-size:22px;font-weight:700;color:#1a1a2e;font-family:Georgia,serif;">${value}</div>${sub}
  </td>`;
}

function studentCard(r: ParentReport, studentId: string, setupUrl?: string): string {
  const t = TONE[r.verdict.tone];
  const mins = r.week.minutes >= 60 ? `${Math.floor(r.week.minutes / 60)}h ${r.week.minutes % 60}m` : `${r.week.minutes} min`;
  const days = r.week.dayFlags
    .map(
      (d) =>
        `<td style="padding:0 2px;text-align:center;"><div style="height:18px;border-radius:4px;background:${d.active ? "#2f6f4f" : "#f1eff8"};"></div><div style="font-size:10px;color:#8a8499;margin-top:3px;">${d.label.slice(0, 2)}</div></td>`
    )
    .join("");
  const points = r.talkingPoints
    .slice(0, 3)
    .map((p) => `<li style="margin:0 0 8px;color:#333;font-size:14px;line-height:1.5;">${esc(p.text)}</li>`)
    .join("");
  const mastered = r.feed.filter((e) => e.kind === "mastered" && Date.now() - new Date(e.at).getTime() < 7 * 86400000);
  return `
  <div style="border:1px solid #ece9f7;border-radius:16px;padding:22px;margin:0 0 18px;background:#fff;">
    <div style="font-size:22px;font-weight:700;color:#1a1a2e;font-family:Georgia,serif;">${esc(r.name)}</div>
    <div style="margin:12px 0 4px;padding:12px 14px;border-radius:12px;background:${t.bg};">
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${t.color};">${t.label}</div>
      <div style="font-size:16px;font-weight:600;color:#1a1a2e;margin-top:2px;">${esc(r.verdict.headline)}</div>
      <div style="font-size:13px;color:#555;margin-top:2px;">${esc(r.verdict.detail)}</div>
    </div>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:6px;"><tr>
      ${stat("Study time", mins, delta(r.week.minutes, r.week.minutesPrev, " min"))}
      ${stat("Study days", `${r.week.activeDays}/7`, delta(r.week.activeDays, r.week.activeDaysPrev))}
      ${stat("Questions", String(r.week.questions), delta(r.week.questions, r.week.questionsPrev))}
      ${stat("Correct", r.week.accuracy === null ? "&mdash;" : `${r.week.accuracy}%`, delta(r.week.accuracy, r.week.accuracyPrev, " pts"))}
    </tr></table>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:4px 0 14px;"><tr>${days}</tr></table>
    ${
      mastered.length
        ? `<div style="font-size:13px;color:#2f6f4f;margin-bottom:10px;">&#9733; Mastered this week: ${mastered.map((e) => esc(e.title.replace(/^Mastered /, ""))).join(", ")}</div>`
        : ""
    }
    ${points ? `<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8a8499;margin:6px 0 8px;">How you can help</div><ul style="padding-left:18px;margin:0;">${points}</ul>` : ""}
    <div style="margin-top:14px;"><a href="${setupUrl ? esc(setupUrl) : `${APP_URL}/parent/dashboard?student=${encodeURIComponent(studentId)}`}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">${setupUrl ? "Set a password to see the full report" : "See the full report"}</a></div>
  </div>`;
}

// `setupUrl`: for a parent whose account a student created and who hasn't
// set a password yet -- links point there, with a way to opt out.
export function parentWeeklyEmail(
  students: { id: string; report: ParentReport }[],
  opts: { setupUrl?: string } = {}
): { subject: string; html: string } {
  const names = students.map((s) => s.report.name);
  const subject =
    students.length === 1
      ? `${names[0]}'s week: ${students[0].report.verdict.headline}`
      : `This week's SAT prep: ${names.join(" and ")}`;
  const html = `<meta charset="utf-8">
  <div style="background:#faf8f4;padding:24px 12px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;">
      <div style="font-size:13px;color:#4a5bb0;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 14px;">Oakmont &middot; Weekly report</div>
      ${students.map((s) => studentCard(s.report, s.id, opts.setupUrl)).join("")}
      <div style="font-size:12px;color:#8a8499;line-height:1.5;margin-top:8px;">
        ${
          opts.setupUrl
            ? `You're getting this because ${esc(names.join(" and "))} added you as their parent on Oakmont Study Center. Not their parent? <a href="${esc(opts.setupUrl)}&amp;decline=1" style="color:#4a5bb0;">Remove this account</a> and the emails stop.`
            : `You're getting this because you have a parent account on Oakmont Study Center. Turn the Sunday email off with the switch at the top of
        <a href="${APP_URL}/parent/dashboard" style="color:#4a5bb0;">your dashboard</a>.`
        }
      </div>
    </div>
  </div>`;
  return { subject, html };
}
