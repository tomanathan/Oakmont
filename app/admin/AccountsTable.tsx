"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { StudentRow } from "./data";
import { DAY, PET_LABEL, PILL, ago, dur, fmtDate, fmtDateYear, pct, statusOf } from "./format";

// Every student account, with search, filters, sorting and a CSV export.
// A row opens that student's full page.

type SortKey = "createdAt" | "name" | "lastActive" | "lastLogin" | "streak" | "days" | "questions" | "accuracy" | "lessons" | "time" | "skills" | "test";

const FILTERS = [
  ["all", "Everyone"],
  ["paying", "Paying"],
  ["trial", "In free trial"],
  ["ended", "Trial ended or canceled"],
  ["active7", "Studied this week"],
  ["quiet", "No study in 7+ days"],
  ["cold", "Ozho is cold"],
  ["never", "Never studied"],
  ["parent", "Parent connected"],
  ["noparent", "No parent"],
  ["onboarding", "Onboarding not finished"],
] as const;

export function AccountsTable({ students, now }: { students: StudentRow[]; now: Date }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });

  const rows = useMemo(() => {
    const weekAgo = now.getTime() - 7 * DAY;
    const needle = q.trim().toLowerCase();
    const val = (u: StudentRow): number | string => {
      switch (sort.key) {
        case "createdAt":
          return u.createdAt.getTime();
        case "name":
          return (u.firstName || u.email).toLowerCase();
        case "lastActive":
          return u.lastActiveDate?.getTime() ?? 0;
        case "lastLogin":
          return u.lastLoginAt?.getTime() ?? 0;
        case "streak":
          return u.currentStreak;
        case "days":
          return u.daysStudied;
        case "questions":
          return u.questions;
        case "accuracy":
          return u.questions ? u.correct / u.questions : -1;
        case "lessons":
          return u.lessons;
        case "time":
          return u.questionMs + u.lessonMs;
        case "skills":
          return u.skillsPassed;
        case "test":
          return u.latestTest ?? 0;
      }
    };
    return students
      .filter((u) => {
        if (needle && !`${u.firstName ?? ""} ${u.email} ${u.parents.map((p) => p.email).join(" ")}`.toLowerCase().includes(needle)) return false;
        const st = statusOf(u, now);
        switch (filter) {
          case "paying":
          case "trial":
          case "ended":
            return st.group === filter;
          case "active7":
            return !!u.lastActiveDate && u.lastActiveDate.getTime() >= weekAgo;
          case "quiet":
            return !!u.lastActiveDate && u.lastActiveDate.getTime() < weekAgo;
          case "cold":
            return u.petStage === "cold";
          case "never":
            return !u.firstStudiedAt && u.questions === 0;
          case "parent":
            return u.parents.some((p) => p.setUp);
          case "noparent":
            return u.parents.length === 0;
          case "onboarding":
            return !u.welcomeSeenAt;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const x = val(a);
        const y = val(b);
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      });
  }, [students, q, filter, sort, now]);

  function exportCsv() {
    const head = ["Name", "Email", "Signed up", "Sign-in", "Came via starter questions", "Starter score", "Onboarding finished", "Status", "First paid", "Trial ends", "Last studied", "Last login", "Streak", "Longest streak", "Days studied", "Ozho", "Questions", "Accuracy", "Lessons read", "Time studying (min)", "Skills passed", "Skills mastered", "Practice tests", "Latest test", "Best test", "Goal score", "Test date", "Parents", "Parent invite emails sent"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
    const lines = rows.map((u) =>
      [
        u.firstName,
        u.email,
        iso(u.createdAt),
        u.hasGoogle && u.hasPassword ? "Both" : u.hasGoogle ? "Google" : "Email",
        u.viaStart ? "yes" : "no",
        u.starter ? `${u.starter.correct}/${u.starter.total}` : "",
        u.welcomeSeenAt ? "yes" : "no",
        statusOf(u, now).label,
        iso(u.firstPaidAt),
        iso(u.trialEndsAt),
        iso(u.lastActiveDate),
        iso(u.lastLoginAt),
        u.currentStreak,
        u.longestStreak,
        u.daysStudied,
        PET_LABEL[u.petStage],
        u.questions,
        u.questions ? Math.round((u.correct / u.questions) * 100) + "%" : "",
        u.lessons,
        Math.round((u.questionMs + u.lessonMs) / 60000),
        u.skillsPassed,
        u.skillsMastered,
        u.tests,
        u.latestTest,
        u.bestTest,
        u.goalScore,
        iso(u.targetTestDate),
        u.parents.map((p) => `${p.email}${p.setUp ? "" : " (not set up)"}`).join("; "),
        u.parentInviteEmails,
      ]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[head.map(esc).join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `oakmont-students-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const Th = ({ k, children, right }: { k?: SortKey; children: React.ReactNode; right?: boolean }) => (
    <th className={`px-3 py-2 font-semibold ${right ? "text-right" : ""}`}>
      {k ? (
        <button type="button" className="inline-flex items-center gap-1 uppercase tracking-[0.06em] hover:text-ink" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : -1 }))}>
          {children}
          <span aria-hidden className={sort.key === k ? "text-ink" : "text-stone-300"}>{sort.key === k && sort.dir === 1 ? "▲" : "▼"}</span>
        </button>
      ) : (
        children
      )}
    </th>
  );

  return (
    <section className="rounded-xl border border-[#e2d7c1] bg-white">
      <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-5">
        <h2 className="mr-auto text-[15px] font-semibold">
          Students <span className="font-normal text-stone-500">· {rows.length} of {students.length}</span>
        </h2>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email or parent"
          aria-label="Search students"
          className="h-9 w-[240px] rounded-lg border border-[#d9cfba] bg-white px-3 text-[13px] outline-none focus:border-forest"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter students" className="h-9 rounded-lg border border-[#d9cfba] bg-white px-2 text-[13px] outline-none focus:border-forest">
          {FILTERS.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" onClick={exportCsv} className="h-9 rounded-lg border border-forest px-3 text-[13px] font-semibold text-forest hover:bg-[#eef3e9]">
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1720px] text-left text-[13px] [&_td]:whitespace-nowrap">
          <thead>
            <tr className="border-y border-[#efe7d6] bg-[#faf6ec] text-[11px] uppercase tracking-[0.06em] text-stone-500">
              <th className="sticky left-0 z-10 bg-[#faf6ec] px-5 py-2 font-semibold">
                <button type="button" className="uppercase tracking-[0.06em] hover:text-ink" onClick={() => setSort((s) => ({ key: "name", dir: s.key === "name" && s.dir === 1 ? -1 : 1 }))}>
                  Student
                </button>
              </th>
              <Th k="createdAt">Signed up</Th>
              <Th>Sign-in</Th>
              <Th>Status</Th>
              <Th k="lastActive">Last studied</Th>
              <Th k="lastLogin">Last login</Th>
              <Th k="streak" right>Streak</Th>
              <Th k="days" right>Days studied</Th>
              <Th>Ozho</Th>
              <Th k="questions" right>Questions</Th>
              <Th k="accuracy" right>Accuracy</Th>
              <Th k="lessons" right>Lessons</Th>
              <Th k="time" right>Time</Th>
              <Th k="skills" right>Passed / mastered</Th>
              <Th k="test" right>Tests</Th>
              <Th>Goal · test date</Th>
              <Th>Parents</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const st = statusOf(u, now);
              return (
                <tr key={u.id} className="group border-b border-[#f3eee2] last:border-0 hover:bg-[#fcfaf4]">
                  <td className="sticky left-0 z-10 bg-white px-5 py-2.5 group-hover:bg-[#fcfaf4]">
                    <Link href={`/admin/student/${u.id}`} className="block">
                      <div className="font-medium text-forest underline-offset-2 group-hover:underline">{u.firstName || "(no name)"}</div>
                      <div className="text-[12px] text-stone-500">{u.email}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-stone-600">
                    {fmtDate(u.createdAt)}
                    {u.viaStart && <div className="text-[11px] text-stone-400">starter {u.starter ? `${u.starter.correct}/${u.starter.total}` : ""}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-stone-600">{u.hasGoogle && u.hasPassword ? "Both" : u.hasGoogle ? "Google" : "Email"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium ring-1 ${PILL[st.tone]}`}>{st.label}</span>
                    {!u.welcomeSeenAt && <div className="mt-1 text-[11px] text-stone-500">Onboarding not finished</div>}
                  </td>
                  <td className="px-3 py-2.5 text-stone-600">{ago(u.lastActiveDate, now)}</td>
                  <td className="px-3 py-2.5 text-stone-600">{ago(u.lastLoginAt, now)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {u.currentStreak}
                    <span className="text-stone-400"> · best {u.longestStreak}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{u.daysStudied}</td>
                  <td className="px-3 py-2.5">
                    <span className={u.petStage === "cold" ? "font-medium text-[#33598f]" : u.petStage === "hungry" ? "text-[#8a5d0f]" : "text-stone-600"}>{PET_LABEL[u.petStage]}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{u.questions}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{pct(u.correct, u.questions)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{u.lessons}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{dur(u.questionMs + u.lessonMs)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {u.skillsPassed} / {u.skillsMastered}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {u.tests ? (
                      <>
                        {u.latestTest}
                        <span className="text-stone-400"> · {u.tests}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-stone-600">
                    {u.goalScore ?? "—"} · {u.targetTestDate ? fmtDateYear(u.targetTestDate) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-stone-600">
                    {u.parents.length === 0
                      ? u.parentInviteEmails > 0
                        ? <span className="text-stone-400">Invited, not connected</span>
                        : "—"
                      : u.parents.map((p) => (
                          <div key={p.id} className="whitespace-nowrap text-[12px]">
                            {p.email}
                            {!p.setUp && <span className="text-stone-400"> (not set up)</span>}
                          </div>
                        ))}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={17} className="px-5 py-8 text-center text-stone-500">
                  No students match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
