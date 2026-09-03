"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sectionTheme } from "@/lib/sectionTheme";
import { addUTCDays, formatUTCDate, utcDayDiff } from "@/lib/dateOnly";
import { TIGHT_TIMELINE_DAYS } from "@/lib/pacing";
import type { DayType } from "@/lib/studyPlan";

interface WeekSubskill {
  id: string;
  name?: string;
  section?: string;
  domain?: string;
}

interface DayItem {
  day: number;
  dayName: string;
  type: DayType;
  testNumber?: number;
  subskills: WeekSubskill[];
}

interface WeekItem {
  week: number;
  testNumbers: number[];
  subskills: WeekSubskill[];
  days: DayItem[];
}

function formatDate(d: Date): string {
  return formatUTCDate(d, { month: "short", day: "numeric" });
}

export function PlanClient({
  weeks,
  progress,
  courseStartDate,
  targetTestDate,
  daysUntilTest,
}: {
  weeks: WeekItem[];
  progress: Record<string, { bestScore: number; total: number }>;
  courseStartDate: string;
  targetTestDate: string | null;
  daysUntilTest: number | null;
}) {
  const router = useRouter();
  const allSubskills = weeks.flatMap((w) => w.subskills);
  const doneSubskills = allSubskills.filter((s) => progress[s.id]).length;
  const weekPct =
    allSubskills.length > 0 ? Math.round((doneSubskills / allSubskills.length) * 100) : 0;
  const totalTests = weeks.reduce((acc, w) => acc + w.testNumbers.length, 0);
  const lastWeek = weeks[weeks.length - 1];

  // UTC calendar-day difference, not raw elapsed milliseconds -- keeps
  // "today"/"this week" lined up with the server's own day-of-course math
  // (lib/studyPlan.ts, lib/pacing.ts) instead of drifting near midnight or
  // in timezones behind UTC.
  const daysElapsed = useMemo(() => utcDayDiff(courseStartDate, new Date()), [courseStartDate]);
  const currentWeekNumber = Math.max(1, Math.floor(daysElapsed / 7) + 1);
  const currentDayOfWeek = ((daysElapsed % 7) + 7) % 7; // 0-6

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([currentWeekNumber]));

  function toggleWeek(week: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  return (
    <div>
      <div className="text-xl font-bold text-ink mb-1.5">Your study roadmap</div>
      <div className="text-sm text-gray-500 mb-4">
        {weeks.length} weeks, broken down day by day. All {totalTests} full-length practice
        tests are spaced throughout based on how much time you have, not bunched up at the end.{" "}
        {targetTestDate ? (
          <>
            Change your target date any time in{" "}
            <button onClick={() => router.push("/settings")} className="underline hover:text-ink">
              Settings
            </button>{" "}
            and this timeline resizes to fit.
          </>
        ) : (
          <>
            Set a target SAT date in{" "}
            <button onClick={() => router.push("/settings")} className="underline hover:text-ink">
              Settings
            </button>{" "}
            to custom-fit this timeline.
          </>
        )}{" "}
        Click a week to see the day-by-day plan.
      </div>

      {targetTestDate && daysUntilTest !== null && (
        <div className="flex items-center justify-between gap-3 bg-[#fffaf0] border border-[#f0e0b0] rounded-xl px-5 py-3.5 mb-5 flex-wrap">
          <div className="text-sm text-ink">
            <span className="font-semibold">
              {daysUntilTest > 0
                ? `${daysUntilTest} day${daysUntilTest === 1 ? "" : "s"} until your SAT`
                : daysUntilTest === 0
                ? "Your SAT is today — good luck!"
                : "Your SAT date has passed"}
            </span>{" "}
            <span className="text-gray-500">
              &middot;{" "}
              {formatUTCDate(targetTestDate, { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="text-xs text-[#9a6a12]">
            {daysUntilTest < 0 ? (
              <button onClick={() => router.push("/settings")} className="underline hover:text-[#7a5410]">
                Update your test date in Settings
              </button>
            ) : daysUntilTest < TIGHT_TIMELINE_DAYS ? (
              "That's a tight runway -- this plan is compressed to fit it, not stretched past it."
            ) : (
              "This plan is paced to finish exactly by then, not before or after."
            )}
          </div>
        </div>
      )}

      <div className="bg-[#eef0fc] border border-[#d7dbf3] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-ink">Overall progress</span>
          <span className="text-sm text-[#6b6f8e]">
            {doneSubskills} / {allSubskills.length} subskills &middot;{" "}
            <span className="text-accent font-semibold">{weekPct}%</span>
          </span>
        </div>
        <div className="h-2.5 bg-white/70 rounded-md overflow-hidden">
          <div
            className="h-full bg-[#6d7fd6] transition-all duration-700 ease-out"
            style={{ width: `${weekPct}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {weeks.map((w) => {
          const isOpen = expanded.has(w.week);
          const isCurrentWeek = w.week === currentWeekNumber;
          const weekStart = addUTCDays(courseStartDate, (w.week - 1) * 7);
          // w.days.length is 7 for every week except a truncated final week
          // (see app/plan/page.tsx), so this naturally lines up with the
          // real target date instead of always assuming a full 7 days.
          const weekEnd = addUTCDays(weekStart, w.days.length - 1);
          const doneInWeek = w.subskills.filter((s) => progress[s.id]).length;

          return (
            <div
              key={w.week}
              className={`border rounded-[10px] overflow-hidden ${
                isCurrentWeek ? "border-[#c9c6ee]" : "border-[#ece9f7]"
              } bg-white`}
            >
              <button
                onClick={() => toggleWeek(w.week)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-[#faf9ff]"
              >
                <div className="text-xs font-bold text-gray-400 w-14 flex-shrink-0">
                  Week {w.week}
                </div>
                <div className="text-[11px] text-gray-400 w-28 flex-shrink-0">
                  {formatDate(weekStart)} &ndash; {formatDate(weekEnd)}
                </div>
                <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                  {isCurrentWeek && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#6d7fd6] bg-[#eef0fc] px-1.5 py-0.5 rounded">
                      This week
                    </span>
                  )}
                  {w.subskills.length > 0 && (
                    <span className="text-[13px] text-gray-600">
                      {w.subskills.length} subskill{w.subskills.length === 1 ? "" : "s"}
                      {doneInWeek > 0 && ` · ${doneInWeek} done`}
                    </span>
                  )}
                  {w.testNumbers.map((n) => (
                    <span
                      key={n}
                      className="text-[11px] font-semibold text-[#c9971b] bg-[#fffaf0] border border-[#f0e0b0] px-1.5 py-0.5 rounded"
                    >
                      Practice test {n} of 8
                    </span>
                  ))}
                </div>
                <span className="text-gray-300 text-xs flex-shrink-0">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-[#f0eff9] divide-y divide-[#f5f4fb]">
                  {w.days.map((d) => {
                    const dayDate = addUTCDays(weekStart, d.day - 1);
                    const isToday = isCurrentWeek && d.day - 1 === currentDayOfWeek;
                    const isExamDay =
                      !!targetTestDate && w === lastWeek && d.day === lastWeek.days[lastWeek.days.length - 1]?.day;
                    return (
                      <div
                        key={d.day}
                        className={`flex items-start gap-3 px-3.5 py-2.5 ${
                          isExamDay ? "bg-[#fffaf0]" : isToday ? "bg-[#faf9ff]" : ""
                        }`}
                      >
                        <div className="w-14 flex-shrink-0 pt-0.5">
                          <div className="text-[11px] font-bold text-gray-500">{d.dayName}</div>
                          <div className="text-[10px] text-gray-400">{formatDate(dayDate)}</div>
                          {isExamDay ? (
                            <div className="text-[9px] font-bold uppercase text-[#9a6a12]">🎯 SAT day</div>
                          ) : isToday ? (
                            <div className="text-[9px] font-bold uppercase text-[#6d7fd6]">Today</div>
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <DayContent day={d} progress={progress} onNavigate={router.push} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayContent({
  day,
  progress,
  onNavigate,
}: {
  day: DayItem;
  progress: Record<string, { bestScore: number; total: number }>;
  onNavigate: (path: string) => void;
}) {
  if (day.type === "rest") {
    return <div className="text-[13px] text-gray-300">Rest &amp; catch up</div>;
  }
  if (day.type === "test") {
    return (
      <button
        onClick={() => onNavigate("/analysis")}
        className="text-left text-[13px] font-semibold text-[#9a6a12] hover:underline"
      >
        Take full-length practice test {day.testNumber} of 8, then log &amp; review your results &rarr;
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {day.type === "review" && (
        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">
          Review
        </div>
      )}
      {day.subskills.map((s) => {
        const p = progress[s.id];
        const mastered = p && p.bestScore === p.total;
        const theme = sectionTheme(s.section ?? "");
        return (
          <div
            key={s.id}
            onClick={() => onNavigate(`/subskill/${s.id}`)}
            className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              mastered
                ? "bg-[#fffaf0] hover:bg-[#fdf3df]"
                : p
                ? "bg-[#f0f7f2] hover:bg-[#e6f1e9]"
                : `${theme.cardBg} hover:opacity-80`
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink">{s.name}</div>
              <div className="text-xs text-gray-400">
                {s.section} &middot; {s.domain}
              </div>
            </div>
            {mastered ? (
              <span className="text-[11px] text-[#c9971b] font-semibold whitespace-nowrap">
                ★ Mastered
              </span>
            ) : p ? (
              <span className="text-[11px] text-accent font-semibold whitespace-nowrap">
                ✓ {p.bestScore}/{p.total}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
