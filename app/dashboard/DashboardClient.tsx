"use client";

import { useRouter } from "next/navigation";
import type { Section } from "@/data/curriculum";
import type { Pacing } from "@/lib/pacing";
import { PacingBar } from "@/components/PacingBar";
import { sectionTheme } from "@/lib/sectionTheme";

type ProgressMap = Record<string, { bestScore: number; total: number }>;

export function DashboardClient({
  curriculum,
  progress,
  totalSubskills,
  stats,
  pacing,
}: {
  curriculum: Section[];
  progress: ProgressMap;
  totalSubskills: number;
  stats: { currentStreak: number; longestStreak: number };
  pacing: Pacing;
}) {
  const router = useRouter();
  const completedCount = Object.keys(progress).length;
  const masteredCount = Object.values(progress).filter((p) => p.bestScore === p.total).length;
  const pct = Math.round((completedCount / totalSubskills) * 100);

  return (
    <div>
      <PacingBar pacing={pacing} />
      <div className="bg-[#eaf6ef] border border-[#d3ecdc] rounded-xl p-6 mb-7">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-ink">Overall progress</span>
          <span className="text-sm text-gray-500">
            {completedCount} / {totalSubskills} subskills &middot;{" "}
            <span className="text-accent font-semibold">{pct}%</span>
          </span>
        </div>
        <div className="h-2.5 bg-white/70 rounded-md overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        {(masteredCount > 0 || stats.currentStreak > 0) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-500">
            {masteredCount > 0 && (
              <span>
                <span className="text-[#c9971b] font-semibold">★ {masteredCount}</span> subskill
                {masteredCount === 1 ? "" : "s"} mastered (perfect score)
              </span>
            )}
            {stats.longestStreak > 0 && (
              <span>
                Longest streak:{" "}
                <span className="font-semibold text-ink">
                  {stats.longestStreak} day{stats.longestStreak === 1 ? "" : "s"}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {curriculum.map((sec) => {
        const theme = sectionTheme(sec.section);
        return (
        <div key={sec.section} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
            <div className="text-[17px] font-bold text-ink">{sec.section}</div>
          </div>
          {sec.domains.map((d) => {
            const domainDone = d.subskills.filter((s) => progress[s.id]).length;
            const domainPct = Math.round((domainDone / d.subskills.length) * 100);
            return (
              <div key={d.domain} className="mb-5">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {d.domain}
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                    <div className="h-1.5 flex-1 bg-gray-200 rounded-md overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${theme.bar}`}
                        style={{ width: `${domainPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {domainDone}/{d.subskills.length}
                    </span>
                  </div>
                </div>
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
            );
          })}
        </div>
        );
      })}
    </div>
  );
}
