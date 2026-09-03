"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Section } from "@/data/curriculum";
import type { Pacing } from "@/lib/pacing";
import type { DomainMastery } from "@/lib/mastery";
import { PacingBar, PACE_STATUS_STYLES, paceStatusCopy } from "@/components/PacingBar";
import { StarRating } from "@/components/StarRating";
import { sectionTheme } from "@/lib/sectionTheme";

type ProgressMap = Record<string, { bestScore: number; total: number }>;

interface TodaySubskill {
  id: string;
  name: string;
  section: string;
  domain: string;
}

interface TodayPlan {
  week: number;
  dayName: string;
  type: "lesson" | "test" | "review" | "rest";
  testNumber?: number;
  subskills: TodaySubskill[];
}

export function DashboardClient({
  curriculum,
  progress,
  totalSubskills,
  stats,
  pacing,
  domainMastery,
  today,
  daysUntilTest,
  thisWeek,
}: {
  curriculum: Section[];
  progress: ProgressMap;
  totalSubskills: number;
  stats: { currentStreak: number; longestStreak: number };
  pacing: Pacing;
  domainMastery: DomainMastery[];
  today: TodayPlan | null;
  daysUntilTest: number | null;
  thisWeek: { done: number; total: number };
}) {
  const router = useRouter();
  const completedCount = Object.keys(progress).length;
  const masteredCount = Object.values(progress).filter((p) => p.bestScore === p.total).length;

  const [subject, setSubject] = useState(curriculum[0]?.section ?? "");
  const activeSection = curriculum.find((s) => s.section === subject) ?? curriculum[0];

  const recommended = findRecommended(curriculum, progress, today);

  const [openDomains, setOpenDomains] = useState<Set<string>>(() => {
    // Start with whichever domain holds today's recommended module already
    // expanded -- everything else stays tidy and collapsed so a student
    // sees only what they're working on, not the entire syllabus at once.
    if (recommended?.domain) return new Set([recommended.domain]);
    return new Set();
  });

  function toggleDomain(domain: string) {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  function starsFor(domain: string): number {
    return domainMastery.find((d) => d.domain === domain)?.stars ?? 0;
  }

  return (
    <div>
      {recommended && (
        <button
          onClick={() => router.push(recommended.href)}
          className="w-full flex items-center justify-between gap-3 bg-ink text-white rounded-xl px-5 py-4 mb-5 text-left hover:bg-[#2a2a42] transition-colors"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60 mb-0.5">
              {completedCount > 0 ? "Jump back in" : "Start here"}
            </div>
            <div className="text-[15px] font-semibold truncate">{recommended.label}</div>
          </div>
          <span className="flex-shrink-0 text-white/80">&rarr;</span>
        </button>
      )}

      {/* One card instead of the two this used to be: "today's plan" and
          "study plan pace" both answer the same underlying question --
          where am I in the plan right now -- just at different zoom
          levels, and showed overlapping subskill counts in separate boxes.
          Skipped only in the rare case there's nothing at all to show
          (e.g. a finished custom timeline). */}
      {(today || thisWeek.total > 0) && (
        <PlanCard
          today={today}
          progress={progress}
          daysUntilTest={daysUntilTest}
          thisWeek={thisWeek}
          pacing={pacing}
          masteredCount={masteredCount}
          completedCount={completedCount}
          totalSubskills={totalSubskills}
          longestStreak={stats.longestStreak}
        />
      )}

      {/* Subject toggle -- one subject shown at a time, kept simple and
          friendly rather than dumping both subjects' full syllabus on
          screen together. */}
      <div className="flex gap-2 mb-5">
        {curriculum.map((sec) => {
          const theme = sectionTheme(sec.section);
          const active = sec.section === subject;
          return (
            <button
              key={sec.section}
              onClick={() => setSubject(sec.section)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                active ? "bg-ink text-white border-ink" : `${theme.cardBg} ${theme.cardBorder} text-ink`
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : theme.dot}`} />
              {sec.section === "Reading and Writing" ? "Reading & Writing" : sec.section}
            </button>
          );
        })}
      </div>

      {activeSection && (
        <div>
          {activeSection.domains.map((d) => {
            const theme = sectionTheme(activeSection.section);
            const isOpen = openDomains.has(d.domain);
            const domainDone = d.subskills.filter((s) => progress[s.id]).length;
            return (
              <div key={d.domain} className="mb-3 border border-[#ece9f7] rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => toggleDomain(d.domain)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[#faf9ff]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${theme.dot}`} />
                    <span className="text-[15px] font-semibold text-ink truncate">{d.domain}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {domainDone}/{d.subskills.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StarRating stars={starsFor(d.domain)} />
                    <span className={`text-gray-300 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>
                      &#9656;
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#f0eff9]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {d.subskills.map((s) => {
                        const p = progress[s.id];
                        const mastered = p && p.bestScore === p.total;
                        return (
                          <div
                            key={s.id}
                            onClick={() => router.push(`/subskill/${s.id}`)}
                            className={`border rounded-[10px] p-3.5 cursor-pointer transition-colors ${
                              mastered
                                ? "bg-[#fffaf0] border-[#f0e0b0] hover:border-[#e8d29a]"
                                : p
                                ? "bg-[#f0f7f2] border-gray-200 hover:border-gray-300"
                                : `${theme.cardBg} ${theme.cardBorder}`
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-ink">{s.name}</span>
                              {mastered ? (
                                <span className="text-[11px] text-[#c9971b] font-semibold whitespace-nowrap ml-2">
                                  ★ Mastered
                                </span>
                              ) : p ? (
                                <span className="text-[11px] text-accent font-semibold whitespace-nowrap ml-2">
                                  ✓ {p.bestScore}/{p.total}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{s.blurb}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DAY_TYPE_COPY: Record<TodayPlan["type"], string> = {
  lesson: "Today's plan",
  review: "Today's review",
  test: "Today's plan",
  rest: "Today's plan",
};

function PlanCard({
  today,
  progress,
  daysUntilTest,
  thisWeek,
  pacing,
  masteredCount,
  completedCount,
  totalSubskills,
  longestStreak,
}: {
  today: TodayPlan | null;
  progress: ProgressMap;
  daysUntilTest: number | null;
  thisWeek: { done: number; total: number };
  pacing: Pacing;
  masteredCount: number;
  completedCount: number;
  totalSubskills: number;
  longestStreak: number;
}) {
  const router = useRouter();
  const weekPct = thisWeek.total > 0 ? Math.round((thisWeek.done / thisWeek.total) * 100) : 0;
  const weekOfCourse = Math.min(pacing.totalWeeks, Math.ceil(pacing.dayOfCourse / 7));

  return (
    <div className="bg-white border border-[#ece9f7] rounded-xl p-4 mb-5">
      {today && (
        <>
          <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {DAY_TYPE_COPY[today.type]}
              </span>
              <span className="text-[11px] text-gray-300">&middot; {today.dayName}, week {today.week}</span>
            </div>
            {daysUntilTest !== null && (
              <span className="text-[11px] font-semibold text-[#9a6a12] bg-[#fffaf0] border border-[#f0e0b0] px-2 py-0.5 rounded-full whitespace-nowrap">
                {daysUntilTest > 0
                  ? `${daysUntilTest} days until your SAT`
                  : daysUntilTest === 0
                  ? "Your SAT is today!"
                  : "SAT date has passed"}
              </span>
            )}
          </div>

          {today.type === "rest" ? (
            <div className="text-sm text-gray-500">
              Rest day &mdash; no new material scheduled. A quick review never hurts, but you've earned the break.
            </div>
          ) : today.type === "test" ? (
            <button
              onClick={() => router.push("/analysis")}
              className="text-left text-sm font-semibold text-[#9a6a12] hover:underline"
            >
              Take full-length practice test {today.testNumber} of 8, then log &amp; review your results &rarr;
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              {today.subskills.map((s) => {
                const p = progress[s.id];
                const mastered = p && p.bestScore === p.total;
                const theme = sectionTheme(s.section);
                return (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/subskill/${s.id}`)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
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
                      <span className="text-[11px] text-[#c9971b] font-semibold whitespace-nowrap">★ Mastered</span>
                    ) : p ? (
                      <span className="text-[11px] text-accent font-semibold whitespace-nowrap">
                        ✓ {p.bestScore}/{p.total}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* The pace section: this week's completion and the whole-course
          trajectory used to be two separate boxes, each reporting its own
          subskill count -- combined here so "week X of Y", "this week's
          progress", and "overall pace" each appear exactly once. */}
      <div className={today ? "mt-3 pt-3 border-t border-gray-100" : ""}>
        <div className="flex justify-between items-baseline mb-1 flex-wrap gap-x-3 gap-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Your pace</span>
          <span className="text-xs text-gray-500">
            Week {weekOfCourse} of {pacing.totalWeeks}
            {thisWeek.total > 0 && (
              <>
                {" "}
                &middot; this week{" "}
                <span className="text-[#4a5bb0] font-semibold">
                  {thisWeek.done}/{thisWeek.total} ({weekPct}%)
                </span>
              </>
            )}
          </span>
        </div>
        <PacingBar pacing={pacing} />
        <div className="flex justify-between items-baseline mt-1.5">
          <span className="text-xs text-gray-500">
            {pacing.completedUnits}/{pacing.totalUnits} subskills overall
          </span>
          <span className={`text-xs font-semibold ${PACE_STATUS_STYLES[pacing.status]}`}>
            {paceStatusCopy(pacing)}
          </span>
        </div>
        {(masteredCount > 0 || longestStreak > 0) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
            {masteredCount > 0 && (
              <span>
                <span className="text-[#c9971b] font-semibold">★ {masteredCount}</span> subskill
                {masteredCount === 1 ? "" : "s"} mastered &middot; {completedCount}/{totalSubskills} attempted
              </span>
            )}
            {longestStreak > 0 && (
              <span>
                Longest streak:{" "}
                <span className="font-semibold text-ink">
                  {longestStreak} day{longestStreak === 1 ? "" : "s"}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The single subskill to feature at the very top of the dashboard as a
 * one-click "start here". Prefers whatever the 6-month plan has scheduled
 * for today (skipping anything already mastered); falls back to the first
 * not-yet-mastered subskill in curriculum order once today's slate is
 * clear (or there's no plan slot at all -- e.g. a custom timeline that's
 * already finished).
 */
function findRecommended(
  curriculum: Section[],
  progress: ProgressMap,
  today: TodayPlan | null
): { label: string; href: string; domain?: string } | null {
  if (today && today.type !== "test" && today.type !== "rest") {
    const next = today.subskills.find((s) => {
      const p = progress[s.id];
      return !p || p.bestScore !== p.total;
    });
    if (next) return { label: next.name, href: `/subskill/${next.id}`, domain: next.domain };
  }
  if (today?.type === "test") {
    return { label: `Take full-length practice test ${today.testNumber} of 8`, href: "/analysis" };
  }
  for (const sec of curriculum) {
    for (const d of sec.domains) {
      for (const s of d.subskills) {
        const p = progress[s.id];
        if (!p || p.bestScore !== p.total) {
          return { label: s.name, href: `/subskill/${s.id}`, domain: d.domain };
        }
      }
    }
  }
  return null;
}
