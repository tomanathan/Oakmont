"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sectionTheme } from "@/lib/sectionTheme";
import { addUTCDays, formatUTCDate, utcDayDiff } from "@/lib/dateOnly";
import { TIGHT_TIMELINE_DAYS } from "@/lib/pacing";
import type { DayType } from "@/lib/studyPlan";
import { isMastered, isPassed, statusOf, type ProgressMap } from "@/lib/progressState";
import { SubskillStatusBadge, STATUS_CARD } from "@/components/SubskillStatusBadge";

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
  progress: ProgressMap;
  courseStartDate: string;
  targetTestDate: string | null;
  daysUntilTest: number | null;
}) {
  const router = useRouter();
  const allSubskills = weeks.flatMap((w) => w.subskills);
  const doneSubskills = allSubskills.filter((s) => isPassed(progress[s.id])).length;
  const masteredSubskills = allSubskills.filter((s) => isMastered(progress[s.id])).length;
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
      <h1 className="font-display text-[28px] font-semibold leading-tight text-ink mb-1.5">Study plan</h1>
      <p className="max-w-[62ch] text-sm leading-relaxed text-stone-600 mb-5">
        {weeks.length} weeks, day by day. All {totalTests} practice tests are spread across it, and the
        schedule leans toward whichever domains your scores say need the most work.{" "}
        {targetTestDate ? "Change your test date" : "Set a test date"} in{" "}
        <button onClick={() => router.push("/settings")} className="underline hover:text-ink">
          Settings
        </button>{" "}
        {targetTestDate ? "and it resizes to fit." : "to fit it to your timeline."}
      </p>

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
            <span className="text-stone-500">
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
              "That's a tight runway — this plan is compressed to fit it, not stretched past it."
            ) : (
              "This plan is paced to finish exactly by then, not before or after."
            )}
          </div>
        </div>
      )}

      <div className="bg-[#eaf1e5] border border-[#c9d8c2] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-ink">Overall progress</span>
          <span className="text-sm text-[#7a7565]">
            {doneSubskills} / {allSubskills.length} passed &middot; {masteredSubskills} mastered &middot;{" "}
            <span className="text-accent font-semibold">{weekPct}%</span>
          </span>
        </div>
        <div className="h-2.5 bg-white rounded-md overflow-hidden ring-1 ring-[#c9d8c2]">
          <div
            className="h-full bg-[#3d7a56] transition-all duration-700 ease-out"
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
          const doneInWeek = w.subskills.filter((s) => isPassed(progress[s.id])).length;

          return (
            <div
              key={w.week}
              className={`border rounded-[10px] overflow-hidden ${
                isCurrentWeek ? "border-[#c9d8c2]" : "border-[#e2d7c1]"
              } bg-white`}
            >
              <button
                onClick={() => toggleWeek(w.week)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-[#f8f4eb]"
              >
                <div className="text-xs font-bold text-stone-500 w-14 flex-shrink-0">
                  Week {w.week}
                </div>
                <div className="text-[11px] text-stone-500 w-28 flex-shrink-0">
                  {formatDate(weekStart)} &ndash; {formatDate(weekEnd)}
                </div>
                <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                  {isCurrentWeek && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#587356] bg-[#eaf1e5] px-1.5 py-0.5 rounded">
                      This week
                    </span>
                  )}
                  {w.subskills.length > 0 && (
                    <span className="text-[13px] text-stone-600">
                      {w.subskills.length} subskill{w.subskills.length === 1 ? "" : "s"}
                      {doneInWeek > 0 && ` · ${doneInWeek} passed`}
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className={`flex-shrink-0 text-stone-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                >
                  <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-[#eef3e9] divide-y divide-[#f6f1e6]">
                  {w.days.map((d) => {
                    const dayDate = addUTCDays(weekStart, d.day - 1);
                    const isToday = isCurrentWeek && d.day - 1 === currentDayOfWeek;
                    const isExamDay =
                      !!targetTestDate && w === lastWeek && d.day === lastWeek.days[lastWeek.days.length - 1]?.day;
                    return (
                      <div
                        key={d.day}
                        className={`flex items-start gap-3 px-3.5 py-2.5 ${
                          isExamDay ? "bg-[#fffaf0]" : isToday ? "bg-[#f8f4eb]" : ""
                        }`}
                      >
                        <div className="w-14 flex-shrink-0 pt-0.5">
                          {/* The real weekday of this date -- the plan's own dayName is just
                              the slot's position in the course week (slot 1 is
                              "Mon" whatever day the course started on). */}
                          <div className="text-[11px] font-bold text-stone-500">
                            {formatUTCDate(dayDate, { weekday: "short" })}
                          </div>
                          <div className="text-[10px] text-stone-500">{formatDate(dayDate)}</div>
                          {isExamDay ? (
                            <div className="text-[9px] font-bold uppercase text-[#9a6a12]">SAT day</div>
                          ) : isToday ? (
                            <div className="text-[9px] font-bold uppercase text-[#587356]">Today</div>
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
  progress: ProgressMap;
  onNavigate: (path: string) => void;
}) {
  if (day.type === "rest") {
    return <div className="text-[13px] italic text-stone-500">Rest &amp; catch up</div>;
  }
  if (day.type === "test") {
    return (
      <button
        // A same-page scroll now, not a navigation -- the practice-test
        // log this used to send students to a separate /analysis page for
        // now lives below this exact schedule on the same /plan page (see
        // app/plan/page.tsx). onNavigate still exists for the subskill
        // links below, which do go to a different page. The analysis
        // section is collapsed by default (see AnalysisClient's own
        // dueTestNumber prop), so scrolling there alone would just land on
        // a collapsed summary bar -- this event is AnalysisClient's cue to
        // actually expand and open its form, the same "plain window event,
        // every mounted listener applies it directly" pattern this app
        // already uses for Ozho's costume/celebrate events.
        onClick={() => {
          window.dispatchEvent(new CustomEvent("plan:log-test"));
          document.getElementById("practice-tests")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-left text-[13px] font-semibold text-[#9a6a12] hover:underline"
      >
        Take full-length practice test {day.testNumber} of 8, then log &amp; review your results &uarr;
      </button>
    );
  }
  if (day.type === "review") {
    return (
      <button
        onClick={() => onNavigate("/review")}
        className="flex w-full items-center gap-3 rounded-lg border border-[#d3e0cc] bg-[#eef4ea] px-2.5 py-1.5 text-left transition-colors hover:border-[#9fbb97] hover:bg-[#e4eedf]"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-ink">Mixed review</div>
          <div className="text-xs text-stone-500">A short set across everything you&apos;ve studied, no labels</div>
        </div>
        <span className="text-stone-500">&rarr;</span>
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {day.subskills.map((s) => {
        const p = progress[s.id];
        const status = statusOf(p);
        const theme = sectionTheme(s.section ?? "");
        return (
          <div
            key={s.id}
            onClick={() => onNavigate(`/subskill/${s.id}`)}
            className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              status === "new" ? `${theme.cardBg} border-transparent hover:opacity-80` : STATUS_CARD[status]
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink">{s.name}</div>
              <div className="text-xs text-stone-500">
                {s.section} &middot; {s.domain}
              </div>
            </div>
            <SubskillStatusBadge progress={p} />
          </div>
        );
      })}
    </div>
  );
}
