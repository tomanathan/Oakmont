"use client";

import { useRouter } from "next/navigation";
import { sectionTheme } from "@/lib/sectionTheme";

interface WeekSubskill {
  id: string;
  name?: string;
  section?: string;
  domain?: string;
}

interface WeekItem {
  week: number;
  type: "subskill" | "fulltest";
  label?: string;
  subskills: WeekSubskill[];
}

export function PlanClient({
  weeks,
  progress,
}: {
  weeks: WeekItem[];
  progress: Record<string, { bestScore: number; total: number }>;
}) {
  const router = useRouter();
  const allSubskills = weeks.filter((w) => w.type === "subskill").flatMap((w) => w.subskills);
  const doneSubskills = allSubskills.filter((s) => progress[s.id]).length;
  const weekPct =
    allSubskills.length > 0 ? Math.round((doneSubskills / allSubskills.length) * 100) : 0;
  const fulltestCount = weeks.filter((w) => w.type === "fulltest").length;

  return (
    <div>
      <div className="text-xl font-bold text-ink mb-1.5">Your study roadmap</div>
      <div className="text-sm text-gray-500 mb-4">
        {weeks.length} weeks: focused subskills week by week, followed by{" "}
        {fulltestCount === 1 ? "a" : fulltestCount} full-length practice test{" "}
        {fulltestCount === 1 ? "week" : "weeks"} to finish. Set a target SAT date in{" "}
        <button onClick={() => router.push("/settings")} className="underline hover:text-ink">
          Settings
        </button>{" "}
        to custom-fit this timeline.
      </div>
      <div className="bg-[#eef0fc] border border-[#d7dbf3] rounded-xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-ink">Subskills completed</span>
          <span className="text-sm text-[#6b6f8e]">
            {doneSubskills} / {allSubskills.length} &middot;{" "}
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
          if (w.type === "fulltest") {
            return (
              <div
                key={w.week}
                className="flex items-center gap-3 px-3.5 py-2.5 border border-dashed border-[#e8cd8f] bg-[#fffaf0] rounded-[10px]"
              >
                <div className="text-xs font-bold text-[#c9971b] w-16">Week {w.week}</div>
                <div className="text-sm text-gray-700">{w.label}</div>
              </div>
            );
          }
          return (
            <div
              key={w.week}
              className="flex items-start gap-3 px-3.5 py-2.5 border border-[#ece9f7] bg-white rounded-[10px]"
            >
              <div className="text-xs font-bold text-gray-400 w-16 pt-2">Week {w.week}</div>
              <div className="flex-1 flex flex-col gap-1.5">
                {w.subskills.map((s) => {
                  const p = progress[s.id];
                  const mastered = p && p.bestScore === p.total;
                  const theme = sectionTheme(s.section ?? "");
                  return (
                    <div
                      key={s.id}
                      onClick={() => router.push(`/subskill/${s.id}`)}
                      className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        mastered
                          ? "bg-[#fffaf0] hover:bg-[#fdf3df]"
                          : p
                          ? "bg-[#f0f7f2] hover:bg-[#e6f1e9]"
                          : `${theme.cardBg} hover:opacity-80`
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-ink">{s.name}</div>
                        <div className="text-xs text-gray-400">
                          {s.section} · {s.domain}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
