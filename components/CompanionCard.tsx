"use client";

import { useEffect, useRef, useState } from "react";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import { PET_NAME, SECOND_PET_NAME } from "@/lib/pet";
import type { CompanionSummary } from "@/lib/companionSummary";

const STAGE_PILL: Record<CompanionSummary["stage"], { label: string; cls: string }> = {
  thriving: { label: "Thriving", cls: "bg-[#eaf6ef] text-accent" },
  content: { label: "Doing fine", cls: "bg-[#eaf1e5] text-[#2c4c3b]" },
  hungry: { label: "Hungry", cls: "bg-[#fbf1df] text-[#9a6a12]" },
  napping: { label: "Napping", cls: "bg-[#eef0f7] text-[#4a5275]" },
};

// Where Ozho stands today, in a sentence -- written from what actually
// feeds him (a finished quiz), so every line says what to do about it.
function statusCopy(c: CompanionSummary): { headline: string; body: string } {
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  switch (c.stage) {
    case "napping":
      return {
        headline: "Napping till you're back.",
        body: "He curled up after a few quiet days. One lesson or quiz wakes him up.",
      };
    case "hungry":
      return {
        headline: "Getting hungry.",
        body: `It's been ${plural(c.daysInactive, "day")} since his last meal. Any lesson or quiz feeds him.`,
      };
    case "content":
      return {
        headline: "Hasn't eaten today.",
        body:
          c.currentStreak > 0
            ? `Finish a lesson or quiz today to feed him and keep your ${c.currentStreak}-day streak.`
            : "Finish a lesson or quiz today to feed him and start a streak.",
      };
    default:
      return c.fedToday
        ? { headline: "Fed and happy.", body: "Today's session counted. Back tomorrow keeps the streak going." }
        : { headline: "Waiting for his first meal.", body: "Finish a lesson or quiz to feed him and start your streak." };
  }
}

// Lines he says when called over from the card -- the same voice as the
// rest of his dialogue (see ScoutCompanion), keyed to how he's doing.
function callLine(c: CompanionSummary): string {
  if (c.stage === "napping") return "*yawn* Oh, you're back. Lesson? I'm up. I'm up.";
  if (c.stage === "hungry") return "Did someone say quiz? I'm so hungry.";
  if (c.stage === "content") return "Here! Haven't had my quiz yet today. Just saying.";
  if (c.nextStreakCostume && c.currentStreak > 0 && c.nextStreakCostume.days - c.longestStreak === 1)
    return `One more day and I get the ${c.nextStreakCostume.name}. No pressure.`;
  return "You called? I came. I always come.";
}

function Meter({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#e6dcc8]">
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// The dashboard's home for Ozho: how he's doing, what's feeding him, and
// what the next few days of practice earn him. Calling him over sends the
// real, roaming Ozho trotting to the card -- this portrait is his profile,
// not a second dog.
export function CompanionCard({ companion: c }: { companion: CompanionSummary }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hop, setHop] = useState(false);
  const hopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (hopTimer.current) clearTimeout(hopTimer.current);
  }, []);

  const pill = STAGE_PILL[c.stage];
  const copy = statusCopy(c);

  function callOzho() {
    setHop(true);
    if (hopTimer.current) clearTimeout(hopTimer.current);
    hopTimer.current = setTimeout(() => setHop(false), 2000);
    const r = cardRef.current?.getBoundingClientRect();
    const near = r ? { x: r.left + window.scrollX - 34, y: r.top + window.scrollY + 70 } : undefined;
    window.dispatchEvent(new CustomEvent("ozho:say", { detail: { message: callLine(c), near } }));
  }



  return (
    <div
      ref={cardRef}
      className="flex flex-col rounded-2xl border border-[#e2d7c1] bg-white p-4 shadow-[0_1px_3px_rgba(38,34,24,0.03)]"
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={callOzho}
          aria-label={`Call ${PET_NAME} over`}
          title={`Call ${PET_NAME} over`}
          className="relative flex h-[76px] w-[76px] flex-shrink-0 items-end justify-center rounded-2xl bg-[#f6f1e6] pb-2 transition-colors hover:bg-[#eef3e9]"
        >
          <span className={hop ? "animate-ozho-hop" : ""}>
            <PixelDog
              size={56}
              mood={MOOD_BY_STAGE[c.stage]}
              asleep={c.stage === "napping"}
              costume={c.costume}
              sitting={!c.fedToday}
              tailFrame={c.fedToday ? 3 : 0}
            />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[17px] font-semibold text-ink">{PET_NAME}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${pill.cls}`}>{pill.label}</span>
          </div>
          <div className="mt-1 text-[13.5px] font-semibold leading-snug text-ink">{copy.headline}</div>
          <div className="mt-0.5 text-[12.5px] leading-relaxed text-stone-600">{copy.body}</div>
        </div>
      </div>

      <>
          <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-3.5">
            {c.nextStreakCostume && (
              <Reward
                costume={c.nextStreakCostume.id}
                title={c.nextStreakCostume.name}
                detail={`${c.nextStreakCostume.days}-day streak`}
                value={c.longestStreak}
                max={c.nextStreakCostume.days}
                unit="days"
                color="#e07a3a"
              />
            )}
            {c.nextDomainCostume && (
              <Reward
                costume={c.nextDomainCostume.id}
                title={c.nextDomainCostume.name}
                detail={`master ${c.nextDomainCostume.count} ${c.nextDomainCostume.count === 1 ? "domain" : "domains"}`}
                value={c.domainsCompleted}
                max={c.nextDomainCostume.count}
                unit="domains"
                color="#c9971b"
              />
            )}
            {!c.mochiUnlocked ? (
              <Reward
                mochi
                title={`${SECOND_PET_NAME} joins`}
                detail={`${c.mochiNeeds}-day streak`}
                value={c.longestStreak}
                max={c.mochiNeeds}
                unit="days"
                color="#8a8fd0"
              />
            ) : (
              <div className="flex items-center gap-3 text-[12.5px] text-stone-500">
                <span className="flex h-8 w-8 flex-shrink-0 items-end justify-center">
                  <PixelDog size={30} variant="mochi" mood="happy" shadow={false} />
                </span>
                {SECOND_PET_NAME} is tagging along. She goes wherever he goes.
              </div>
            )}
          </div>
          <div className="mt-3.5 flex items-center justify-between gap-2 text-[12.5px]">
            <button onClick={callOzho} className="font-semibold text-stone-500 transition-colors hover:text-ink">
              Call {PET_NAME} over
            </button>
            <a href="/settings#wardrobe" className="font-semibold text-[#2c4c3b] hover:underline">
              Wardrobe →
            </a>
          </div>
      </>
    </div>
  );
}

function Reward({
  costume,
  mochi = false,
  title,
  detail,
  value,
  max,
  unit,
  color,
}: {
  costume?: string;
  mochi?: boolean;
  title: string;
  detail: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-end justify-center opacity-90">
        {mochi ? (
          <PixelDog size={30} variant="mochi" mood="neutral" shadow={false} className="grayscale-[0.6]" />
        ) : (
          <PixelDog size={30} costume={costume} shadow={false} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="truncate text-[12.5px] text-stone-600">
            <span className="font-semibold text-ink">{title}</span> · {detail}
          </span>
          <span className="flex-shrink-0 text-[11px] tabular-nums text-stone-500">
            {Math.min(value, max)}/{max} {unit}
          </span>
        </div>
        <Meter value={value} max={max} color={color} />
      </div>
    </div>
  );
}
