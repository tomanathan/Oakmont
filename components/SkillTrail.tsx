"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { turnTo } from "@/components/paper/turn";
import { PawPrint } from "@/components/paper/dog";
import { PixelDog } from "@/components/PixelDog";
import { StarRating } from "@/components/StarRating";
import { rng, smooth, tick } from "@/components/paper/sketch";
import { statusOf, type ProgressMap, type SubskillStatus } from "@/lib/progressState";

// One topic as a trail drawn across the page: each skill is a stop on it,
// the stretch you've walked is inked in (with Ozho's paw prints), the rest
// is still pencil, and a pennant at the end carries the topic's stars.
// Ozho stands on the stop that's up next. Styles: .trail-* in app/paper.css.

interface TrailSkill {
  id: string;
  name: string;
  blurb?: string;
}

const MIN_STEP = 112; // narrowest a stop's column gets before the trail scrolls
const FLAG_W = 76;
const PAD = 18;
const STOP_Y = 74;
const H = 172;

const STATUS_WORD: Partial<Record<SubskillStatus, string>> = {
  mastered: "Mastered",
  passed: "Passed",
  due: "Refresher due",
};

export function SkillTrail({
  domain,
  skills,
  progress,
  stars,
  ink,
  darkInk,
  tint,
  here,
  costume,
  seed,
}: {
  domain: string;
  skills: TrailSkill[];
  progress: ProgressMap;
  stars: number;
  ink: string;
  darkInk: string;
  tint: string;
  here: string | null; // the stop Ozho stands on
  costume: string | null;
  seed: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const n = skills.length;
  const minW = PAD * 2 + n * MIN_STEP + FLAG_W;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const width = Math.max(w, minW);
  const step = (width - PAD * 2 - FLAG_W) / n;
  const r = rng(seed * 97 + n);
  const pts = skills.map((_, i) => {
    const x = PAD + step * (i + 0.5);
    const y = STOP_Y + (i % 2 ? 13 : -9) + (r() - 0.5) * 8;
    return [Math.round(x), Math.round(y)] as [number, number];
  });
  const start: [number, number] = [2, STOP_Y + 4];
  const flag: [number, number] = [Math.round(width - FLAG_W / 2 - 6), STOP_Y + 8];

  const statuses = skills.map((s) => statusOf(progress[s.id]));
  const allMastered = statuses.every((s) => s === "mastered");
  // Walked up to the furthest stop that's been started.
  let walked = -1;
  statuses.forEach((s, i) => {
    if (s !== "new") walked = i;
  });
  const walkedPts = walked < 0 ? [] : allMastered ? [start, ...pts, flag] : [start, ...pts.slice(0, walked + 1)];
  const masteredCount = statuses.filter((s) => s === "mastered").length;

  // On a narrow screen the trail scrolls sideways: start it with Ozho in view.
  useEffect(() => {
    const el = scrollRef.current;
    const i = skills.findIndex((s) => s.id === here);
    if (!el || i < 0 || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = Math.max(0, pts[i][0] - el.clientWidth / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here, w]);

  return (
    <section className="trail-card rounded-2xl border border-[#c9d6ee] bg-white">
      <header className="flex items-baseline justify-between gap-3 px-5 pt-4">
        <h3 className="font-display text-[17px] font-semibold text-ink">{domain}</h3>
        <span className="whitespace-nowrap text-xs text-stone-500">
          {masteredCount} of {n} mastered
        </span>
      </header>
      <div ref={scrollRef} className="trail-scroll overflow-x-auto overflow-y-hidden">
        <div className="relative" style={{ width, height: H }}>
          <svg className="absolute inset-0" width={width} height={H} aria-hidden>
            {/* the way ahead, in pencil */}
            <path d={smooth([start, ...pts, flag])} fill="none" stroke="#b9c7e4" strokeWidth={2.2} strokeDasharray="1.5 7" strokeLinecap="round" />
            {/* the way walked, in ink */}
            {walkedPts.length > 1 && (
              <path className="trail-ink" d={smooth(walkedPts)} pathLength={1} fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
            )}
          </svg>

          {/* paw prints between stops already walked */}
          {walkedPts.slice(0, -1).flatMap((p, i) => {
            const q = walkedPts[i + 1];
            const dx = q[0] - p[0];
            const dy = q[1] - p[1];
            const len = Math.hypot(dx, dy) || 1;
            const a = Math.round((Math.atan2(dy, dx) * 180) / Math.PI + 90);
            // a left print and a right one, either side of the line
            return [0.38, 0.56].map((t, k) => {
              const side = k ? 7 : -7;
              return (
                <span
                  key={`${i}-${k}`}
                  className="trail-paw absolute"
                  style={{
                    left: Math.round(p[0] + dx * t - (dy / len) * side),
                    top: Math.round(p[1] + dy * t + (dx / len) * side) - 8,
                    color: darkInk,
                    ["--r" as string]: `${a}deg`,
                    animationDelay: `${400 + (i * 2 + k) * 80}ms`,
                  }}
                  aria-hidden
                >
                  <PawPrint size={15} />
                </span>
              );
            });
          })}

          {skills.map((s, i) => {
            const status = statuses[i];
            const p = progress[s.id];
            const isHere = s.id === here;
            const [x, y] = pts[i];
            const word = isHere ? "Up next" : STATUS_WORD[status];
            return (
              <div key={s.id}>
                {isHere && (
                  <span className="trail-dog absolute" style={{ left: x - 24, top: y - 53 }} aria-hidden>
                    <PixelDog size={48} mood="happy" tailFrame={2} costume={costume} shadow={false} />
                  </span>
                )}
                <button
                  onClick={() => turnTo(`/subskill/${s.id}`)}
                  title={s.blurb}
                  className={`trail-stop trail-${status} absolute ${isHere ? "is-here" : ""}`}
                  style={{
                    left: x - 26,
                    top: y - 26,
                    animationDelay: `${i * 70}ms`,
                    ["--ink" as string]: ink,
                    ["--dark" as string]: darkInk,
                    ["--tint" as string]: tint,
                    ["--tilt" as string]: `${(rng(seed + i * 13)() - 0.5) * 14}deg`,
                  }}
                  aria-label={`${s.name}${word ? `, ${word}` : ""}`}
                >
                  <StopFace status={status} score={p ? [p.bestScore, p.total] : null} seed={seed + i} />
                </button>
                <div
                  className="pointer-events-none absolute text-center"
                  style={{ left: Math.round(x - step / 2 + 4), width: Math.round(step - 8), top: y + 33 }}
                >
                  <div className={`line-clamp-2 text-[12.5px] leading-[1.25] ${isHere ? "font-semibold text-ink" : "text-stone-600"}`}>
                    {s.name}
                  </div>
                  {word && (
                    <div
                      className={`mt-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${
                        isHere ? "text-accent" : status === "mastered" ? "text-[#b8860b]" : status === "due" ? "text-[#b4541a]" : "text-stone-500"
                      }`}
                    >
                      {word}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* the pennant at the end of the trail */}
          <div className="absolute flex flex-col items-center" style={{ left: flag[0] - 34, width: 68, top: flag[1] - 46 }}>
            <svg width="40" height="50" viewBox="0 0 40 50" aria-hidden className={allMastered ? "trail-flag is-won" : "trail-flag"}>
              <path d="M8 3 L8 48" stroke="#7d8fb5" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M9 4 C 18 6, 26 2, 36 7 C 29 11, 30 15, 35 21 C 25 17, 17 22, 9 19 Z" fill={allMastered ? "#e3b23c" : tint} stroke={allMastered ? "#b8860b" : ink} strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <StarRating stars={stars} className="mt-1" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StopFace({ status, score, seed }: { status: SubskillStatus; score: [number, number] | null; seed: number }) {
  switch (status) {
    case "mastered":
      return <span className="text-[24px] leading-none text-white drop-shadow-[0_1px_0_rgba(140,95,0,0.5)]">★</span>;
    case "passed":
      return (
        <svg width="26" height="22" viewBox="0 0 26 22" aria-hidden>
          <path d={tick(26, 22, seed)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "due":
      return <span className="text-[22px] font-bold leading-none">↻</span>;
    case "attempted": {
      const [got, of] = score ?? [0, 1];
      const c = 2 * Math.PI * 22;
      return (
        <>
          <svg className="absolute inset-0 -rotate-90" width="52" height="52" viewBox="0 0 52 52" aria-hidden>
            <circle cx="26" cy="26" r="22" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(got / Math.max(1, of)) * c} ${c}`} />
          </svg>
          <span className="relative text-[12px] font-semibold tabular-nums text-ink">
            {got}/{of}
          </span>
        </>
      );
    }
    default:
      return <span className="h-2 w-2 rounded-full bg-[#c9d6ee]" />;
  }
}
