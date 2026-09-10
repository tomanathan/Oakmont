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
  stats,
  pacing,
  domainMastery,
  today,
  daysUntilTest,
  thisWeek,
}: {
  curriculum: Section[];
  progress: ProgressMap;
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
          className="group w-full flex items-center justify-between gap-4 bg-ink text-white rounded-2xl px-6 py-5 mb-4 text-left hover:bg-[#26263c] transition-colors shadow-[0_2px_12px_rgba(26,26,46,0.14)]"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 mb-1">
              {completedCount > 0 ? "Jump back in" : "Start here"}
            </div>
            <div className="text-[17px] font-display font-semibold truncate">{recommended.label}</div>
          </div>
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-lg transition-colors">
            &rarr;
          </span>
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
          longestStreak={stats.longestStreak}
        />
      )}

      {/* Subject toggle -- these two sections are the entire test, and the
          two halves of everything below this point, so the control that
          switches between them now actually looks like it's carrying that
          weight instead of reading as a pair of small nav pills. Each side
          shows its own real mastery number so picking a subject doubles as
          a glance at how it's going there; the active side goes full color
          and scales up slightly while the inactive one recedes (a muted
          card, not just an unfilled outline), the same "one side steps
          forward, the other steps back" contrast a two-option select
          screen uses to make the current pick unmistakable at a glance. */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {curriculum.map((sec) => {
          const theme = sectionTheme(sec.section);
          const active = sec.section === subject;
          const { masteredCount: sectionMastered, total: sectionTotal, pct } = sectionProgress(sec, progress);
          const label = sec.section === "Reading and Writing" ? "Reading & Writing" : sec.section;
          return (
            <button
              key={sec.section}
              onClick={() => setSubject(sec.section)}
              aria-pressed={active}
              className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                active
                  ? `${theme.cardBg} ${theme.cardBorder.split(" ")[0]} shadow-[0_4px_18px_rgba(26,26,46,0.1)] scale-[1.02]`
                  : "bg-white border-gray-200 opacity-[0.55] hover:opacity-90 hover:border-gray-300"
              }`}
            >
              <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${active ? theme.text : "text-gray-400"}`}>
                {label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] leading-none font-display font-semibold text-ink">{pct}%</span>
                <span className="text-xs text-gray-500">
                  {sectionMastered} of {sectionTotal} mastered
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full ${active ? theme.bar : "bg-gray-300"} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {activeSection && (
        <div className="flex flex-col gap-2.5">
          {activeSection.domains.map((d) => {
            const theme = sectionTheme(activeSection.section);
            const isOpen = openDomains.has(d.domain);
            const domainDone = d.subskills.filter((s) => progress[s.id]).length;
            return (
              <div
                key={d.domain}
                className={`overflow-hidden rounded-2xl border border-[#ece9f7] border-l-[3px] ${theme.accentBorder} bg-white transition-colors`}
              >
                <button
                  onClick={() => toggleDomain(d.domain)}
                  className={`w-full flex items-center gap-3 pl-5 pr-4 py-4 text-left transition-colors ${
                    isOpen ? theme.cardBg : "hover:bg-[#faf9ff]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
                    <span className="text-[15px] font-semibold text-ink truncate">{d.domain}</span>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {domainDone}/{d.subskills.length}
                    </span>
                  </div>
                  {/* Fills the gap in the header and echoes the progress
                      bars on the subject cards above -- attempted, not
                      mastered (that's what the stars are for). Only drawn
                      where there's room for it. */}
                  <div className="flex-1 mx-3">
                    <div className="hidden md:block h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${theme.bar}`}
                        style={{ width: `${(domainDone / d.subskills.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StarRating stars={starsFor(d.domain)} />
                    <span className={`text-gray-300 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>
                      &#9656;
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-3 border-t border-[#f0eff9] bg-white">
                    {/* lg:grid-cols-4 -- the dashboard now renders at the
                        same 1180px width as the lesson page (see AppShell's
                        wide prop), so a fourth column here puts that extra
                        room toward showing more subskill cards at once
                        instead of just stretching three columns wider. */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {d.subskills.map((s) => {
                        const p = progress[s.id];
                        const mastered = p && p.bestScore === p.total;
                        return (
                          <div
                            key={s.id}
                            onClick={() => router.push(`/subskill/${s.id}`)}
                            className={`border rounded-xl p-3.5 cursor-pointer transition-colors ${
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
  longestStreak,
}: {
  today: TodayPlan | null;
  progress: ProgressMap;
  daysUntilTest: number | null;
  thisWeek: { done: number; total: number };
  pacing: Pacing;
  masteredCount: number;
  completedCount: number;
  longestStreak: number;
}) {
  const router = useRouter();
  const weekPct = thisWeek.total > 0 ? Math.round((thisWeek.done / thisWeek.total) * 100) : 0;
  const weekOfCourse = Math.min(pacing.totalWeeks, Math.ceil(pacing.dayOfCourse / 7));
  const showStats = masteredCount > 0 || longestStreak > 0;

  const eyebrow = "text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400";

  return (
    <div className="bg-white border border-[#ece9f7] rounded-2xl p-5 mb-4 shadow-[0_1px_3px_rgba(26,26,46,0.03)]">
      {today && (
        <div className="mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className={eyebrow}>{DAY_TYPE_COPY[today.type]}</span>
              <span className="text-[11px] text-gray-300">{today.dayName}, week {today.week}</span>
            </div>
            {daysUntilTest !== null && (
              <span className="text-[11px] font-semibold text-[#9a6a12] bg-[#fffaf0] border border-[#f0e0b0] px-2.5 py-1 rounded-full whitespace-nowrap">
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
              onClick={() => router.push("/plan#practice-tests")}
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
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
        </div>
      )}

      {/* The pace section: this week's completion and the whole-course
          trajectory used to be two separate boxes, each reporting its own
          subskill count -- combined here so "week X of Y", "this week's
          progress", and "overall pace" each appear exactly once. The pace
          status is the headline; everything else is context under it. */}
      <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
        <span className={eyebrow}>Your pace</span>
        <span className={`text-[13px] font-semibold ${PACE_STATUS_STYLES[pacing.status]}`}>
          {paceStatusCopy(pacing)}
        </span>
      </div>
      <PacingBar pacing={pacing} />
      <div className="flex justify-between items-baseline mt-1 text-[11px] text-gray-400">
        <span>
          Week {weekOfCourse} of {pacing.totalWeeks}
          {thisWeek.total > 0 && (
            <>
              {" "}
              &middot; this week {thisWeek.done}/{thisWeek.total} ({weekPct}%)
            </>
          )}
        </span>
        <span>
          {pacing.completedUnits}/{pacing.totalUnits} subskills overall
        </span>
      </div>

      {showStats && (
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 pt-4 border-t border-gray-100">
          {masteredCount > 0 && (
            <div>
              <div className={eyebrow}>Mastered</div>
              <div className="text-sm mt-0.5">
                <span className="font-display font-semibold text-[15px] text-[#c9971b]">{masteredCount}</span>
                <span className="text-gray-400 text-xs"> of {completedCount} attempted</span>
              </div>
            </div>
          )}
          {longestStreak > 0 && (
            <div>
              <div className={eyebrow}>Longest streak</div>
              <div className="text-sm mt-0.5">
                <span className="font-display font-semibold text-[15px] text-ink">{longestStreak}</span>
                <span className="text-gray-400 text-xs"> day{longestStreak === 1 ? "" : "s"}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Real mastery numbers for one whole section (Math, or Reading and
 * Writing), for the subject toggle above -- every subskill across every
 * domain in this section, and how many of them are quizzed to a perfect
 * score. Same "mastered" definition the wardrobe and the header stats use
 * (bestScore === total), just totaled per section instead of per domain
 * or across the whole curriculum.
 */
function sectionProgress(
  section: Section,
  progress: ProgressMap
): { masteredCount: number; total: number; pct: number } {
  const subskillIds = section.domains.flatMap((d) => d.subskills.map((s) => s.id));
  const masteredCount = subskillIds.filter((id) => {
    const p = progress[id];
    return !!p && p.bestScore === p.total;
  }).length;
  const total = subskillIds.length;
  const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
  return { masteredCount, total, pct };
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
    return { label: `Take full-length practice test ${today.testNumber} of 8`, href: "/plan#practice-tests" };
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
