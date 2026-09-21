"use client";

import { useState } from "react";
import type { Section } from "@/data/curriculum";
import type { Pacing } from "@/lib/pacing";
import type { DomainMastery } from "@/lib/mastery";
import type { PetStage } from "@/lib/pet";
import { PacingBar, PACE_STATUS_STYLES, paceStatusCopy } from "@/components/PacingBar";
import { StarRating } from "@/components/StarRating";
import { SubjectRing } from "@/components/SubjectRing";
import { PetAvatar } from "@/components/PetAvatar";
import { PET_NAME } from "@/lib/pet";
import { sectionTheme } from "@/lib/sectionTheme";
import { sectionProgress } from "@/lib/subjectProgress";
import { formatUTCDate } from "@/lib/dateOnly";

type ProgressMap = Record<string, { bestScore: number; total: number }>;

interface DomainCount {
  correct: number;
  total: number;
}

interface Test {
  id: string;
  takenAt: string;
  compositeScore: number;
  rwScore: number;
  mathScore: number;
  domainScores: Record<string, number>;
  domainCounts: Record<string, DomainCount>;
}

interface DomainInfo {
  domain: string;
  section: string;
}

const PET_STAGE_LABEL: Record<PetStage, string> = {
  thriving: "Thriving",
  content: "Doing well",
  hungry: "Hungry",
  critical: "Needs attention",
  dead: "Gone",
};

// A read-only render of a student's pace/mastery/practice-test data --
// shared by the parent dashboard (app/parent/dashboard) and the no-login
// public share view (app/share/[token]), so the two access paths (a linked
// parent account, or a share link) always show the exact same thing off
// the exact same data shape, rather than two views drifting apart.
export function StudentProgressView({
  studentEmail,
  curriculum,
  progress,
  domainMastery,
  domains,
  pacing,
  thisWeek,
  daysUntilTest,
  petStage,
  currentStreak,
  tests,
}: {
  studentEmail: string;
  curriculum: Section[];
  progress: ProgressMap;
  domainMastery: DomainMastery[];
  domains: DomainInfo[];
  pacing: Pacing;
  thisWeek: { done: number; total: number };
  daysUntilTest: number | null;
  petStage: PetStage;
  currentStreak: number;
  tests: Test[];
}) {
  const [subject, setSubject] = useState(curriculum[0]?.section ?? "");
  const activeSection = curriculum.find((s) => s.section === subject) ?? curriculum[0];
  const weekPct = thisWeek.total > 0 ? Math.round((thisWeek.done / thisWeek.total) * 100) : 0;
  const weekOfCourse = Math.min(pacing.totalWeeks, Math.ceil(pacing.dayOfCourse / 7));
  const eyebrow = "text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400";
  const latest = tests[0] ?? null;
  const previous = tests[1] ?? null;

  function starsFor(domain: string): number {
    return domainMastery.find((d) => d.domain === domain)?.stars ?? 0;
  }

  return (
    <div>
      <div className="text-xl font-bold text-ink mb-1">{studentEmail}</div>
      <div className="text-sm text-gray-500 mb-5">
        A read-only view of their Oakmont dashboard &mdash; nothing here can be changed from your side.
      </div>

      {/* Pace + Ozho -- same numbers as the student's own dashboard, plus a
          small engagement strip (pet mood, streak) so a parent can see
          whether their student is actually showing up, not just how their
          scores look. */}
      <div className="bg-white border border-[#ece9f7] rounded-2xl p-4 mb-4 shadow-[0_1px_3px_rgba(26,26,46,0.03)]">
        <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
          <span className={eyebrow}>Pace</span>
          {daysUntilTest !== null && (
            <span className="text-[11px] font-semibold text-[#9a6a12] bg-[#fffaf0] border border-[#f0e0b0] px-2.5 py-1 rounded-full whitespace-nowrap">
              {daysUntilTest > 0
                ? `${daysUntilTest} days until the SAT`
                : daysUntilTest === 0
                ? "Test day is today!"
                : "SAT date has passed"}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <span className="text-xs text-gray-400">Week {weekOfCourse} of {pacing.totalWeeks}</span>
          <span className={`text-xs font-semibold ${PACE_STATUS_STYLES[pacing.status]}`}>
            {paceStatusCopy(pacing)}
          </span>
        </div>
        <PacingBar pacing={pacing} />
        <div className="flex justify-between items-baseline mt-1 text-[11px] text-gray-400">
          <span>
            {thisWeek.total > 0 ? `This week ${thisWeek.done}/${thisWeek.total} (${weekPct}%)` : "Nothing scheduled this week"}
          </span>
          <span>{pacing.completedUnits}/{pacing.totalUnits} subskills overall</span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
          <PetAvatar stage={petStage} size={32} />
          <div className="text-xs text-gray-500">
            {PET_NAME} is <span className="font-semibold text-ink">{PET_STAGE_LABEL[petStage].toLowerCase()}</span>
            {currentStreak > 0 && <> &middot; {currentStreak}-day practice streak</>}
          </div>
        </div>
      </div>

      {/* Subject mastery -- identical ring/number to the student's own
          dashboard (see lib/subjectProgress.ts, components/SubjectRing.tsx),
          off the exact same numbers. */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {curriculum.map((sec) => {
          const theme = sectionTheme(sec.section);
          const active = sec.section === subject;
          const { total: sectionTotal, attemptedCount, masteredCount, avgPct } = sectionProgress(sec, progress);
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
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`text-[11px] font-bold uppercase tracking-wide ${active ? theme.text : "text-gray-400"}`}>
                  {label}
                </div>
                <SubjectRing
                  total={sectionTotal}
                  attemptedCount={attemptedCount}
                  masteredCount={masteredCount}
                  color={theme.dotHex}
                  lightColor={theme.barHex}
                />
              </div>
              {avgPct === null ? (
                <div className="text-sm text-gray-500">Not started yet</div>
              ) : (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[32px] leading-none font-display font-semibold text-ink">{avgPct}%</span>
                  {attemptedCount === 1 ? (
                    <span className="text-xs text-gray-400">first attempt</span>
                  ) : (
                    <span className="text-xs text-gray-500">average score</span>
                  )}
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {attemptedCount} started &middot; {masteredCount} mastered &middot; {sectionTotal} total
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain breakdown for whichever subject is selected above --
          quiz mastery only (no editing, no logging a test from here). */}
      {activeSection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {activeSection.domains.map((d) => {
            const theme = sectionTheme(activeSection.section);
            const mastery = domainMastery.find((m) => m.domain === d.domain);
            const domainDone = d.subskills.filter((s) => progress[s.id]).length;
            return (
              <div key={d.domain} className={`border rounded-[10px] p-4 ${theme.cardBg} ${theme.cardBorder}`}>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${theme.dot}`} />
                    <span className="text-sm font-medium text-ink truncate">{d.domain}</span>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {domainDone}/{d.subskills.length}
                    </span>
                  </div>
                  <StarRating stars={starsFor(d.domain)} />
                </div>
                <DomainBar label="Quiz mastery" pct={mastery?.quizPct ?? null} barClass={theme.bar} />
                <DomainBar label="Latest practice test" pct={mastery?.testPct ?? null} barClass="bg-gray-400" />
              </div>
            );
          })}
        </div>
      )}

      {/* Practice test history -- read-only mirror of the student's own
          analysis section (app/plan/AnalysisClient.tsx), minus the
          log/edit/delete controls that don't belong on a parent's view. */}
      <div className="text-sm font-semibold text-ink mb-3">Practice tests</div>
      {latest ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <ScoreCard
              label="Composite"
              value={latest.compositeScore}
              delta={previous ? latest.compositeScore - previous.compositeScore : null}
              accent="text-ink"
            />
            <ScoreCard
              label="Reading & Writing"
              value={latest.rwScore}
              delta={previous ? latest.rwScore - previous.rwScore : null}
              accent="text-[#6d7fd6]"
            />
            <ScoreCard
              label="Math"
              value={latest.mathScore}
              delta={previous ? latest.mathScore - previous.mathScore : null}
              accent="text-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {tests.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 border border-[#ece9f7] bg-white rounded-[10px] text-sm"
              >
                <span className="text-gray-500 whitespace-nowrap">
                  {formatUTCDate(t.takenAt, { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span className="text-ink font-semibold flex-1 text-right">
                  {t.compositeScore}{" "}
                  <span className="text-gray-400 font-normal">
                    ({t.rwScore} R&amp;W &middot; {t.mathScore} Math)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500 bg-white border border-[#ece9f7] rounded-[10px] p-4">
          No practice tests logged yet.
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: number;
  delta: number | null;
  accent: string;
}) {
  return (
    <div className="border border-[#ece9f7] bg-white rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>
        {value}
        {delta !== null && delta !== 0 && (
          <span className={`ml-2 text-sm font-semibold ${delta > 0 ? "text-accent" : "text-red-500"}`}>
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function DomainBar({
  label,
  pct,
  barClass,
}: {
  label: string;
  pct: number | null;
  barClass: string;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] text-gray-500">{label}</span>
        <span className="text-[11px] text-gray-500">{pct === null ? "not reported" : `${pct}%`}</span>
      </div>
      <div className="h-1.5 bg-white/70 rounded-md overflow-hidden">
        <div
          className={`h-full ${barClass} transition-all duration-500 ease-out`}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
    </div>
  );
}
