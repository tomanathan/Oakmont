"use client";

import { useEffect, useRef, useState } from "react";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import type { PetStage } from "@/lib/pet";

// Kept warm and low-pressure on purpose -- Scout is a companion, not a
// nag. Even the "hungry"/"critical" pool below invites rather than
// guilt-trips, regardless of how urgent the pet-death countdown actually is.
const GREETINGS = [
  "Woof! Good to see you.",
  "Hey there — ready when you are.",
  "I'm rooting for you today.",
  "Happy to see you back.",
];
const ENCOURAGEMENTS = [
  "Every problem you solve makes test day easier.",
  "Small steps count — even one quiz helps.",
  "Proud of you for showing up today.",
  "Take a breather if you need one, I'll be here.",
  "You've got this, one question at a time.",
];
const NUDGES = [
  "I'd love a little study time together today.",
  "No pressure — even five minutes helps.",
  "Whenever you're ready, I'll come along.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MIN_X = 4;
const MAX_X = 90;

export function ScoutCompanion() {
  const [stage, setStage] = useState<PetStage | null>(null);
  const [x, setX] = useState(8);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [isWalking, setIsWalking] = useState(true);
  const [bubble, setBubble] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const walkingRef = useRef(true);
  const dirRef = useRef<1 | -1>(1);
  const xRef = useRef(8);
  const behaviorUntilRef = useRef(0);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<PetStage | null>(null);
  const streakRef = useRef(0);
  const hasGreetedRef = useRef(false);

  useEffect(() => {
    fetch("/api/pet/state")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.stage) {
          stageRef.current = data.stage;
          streakRef.current = data.currentStreak ?? 0;
          setStage(data.stage);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  function speak(text: string, ms = 4200) {
    setBubble(text);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => setBubble(null), ms);
  }

  function ambientMessage(): string {
    const s = stageRef.current;
    if (s === "hungry" || s === "critical") return pick(NUDGES);
    if (streakRef.current >= 2 && (s === "thriving" || s === "content")) {
      return pick([
        `${streakRef.current}-day streak! Keep it going.`,
        `Loving this ${streakRef.current}-day streak.`,
      ]);
    }
    return pick(ENCOURAGEMENTS);
  }

  // Say hello shortly after Scout's mood is known.
  useEffect(() => {
    if (stage === null || hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const t = setTimeout(() => speak(pick(GREETINGS), 4000), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Walk/idle/roam loop. A ref drives the actual motion so the interval
  // doesn't need to be torn down and rebuilt every tick; state is only
  // updated to trigger the visual re-render.
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now > behaviorUntilRef.current) {
        const goWalk = Math.random() < 0.65;
        walkingRef.current = goWalk;
        setIsWalking(goWalk);
        behaviorUntilRef.current =
          now + (goWalk ? 4000 + Math.random() * 6000 : 3000 + Math.random() * 5000);
        if (!goWalk && Math.random() < 0.55) {
          speak(ambientMessage());
        }
      }
      if (walkingRef.current) {
        let next = xRef.current + dirRef.current * 0.6;
        if (next >= MAX_X) {
          next = MAX_X;
          dirRef.current = -1;
          setFacing(-1);
        } else if (next <= MIN_X) {
          next = MIN_X;
          dirRef.current = 1;
          setFacing(1);
        } else if (Math.random() < 0.006) {
          dirRef.current = dirRef.current === 1 ? -1 : 1;
          setFacing(dirRef.current);
        }
        xRef.current = next;
        setX(next);
        setLegFrame((f) => (f === 0 ? 1 : 0));
      }
    }, 150);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  function onClickDog() {
    speak(pick(GREETINGS), 3200);
  }

  const mood = stage ? MOOD_BY_STAGE[stage] : "neutral";

  return (
    <div className="fixed inset-x-0 bottom-0 h-0 pointer-events-none z-40">
      <div
        className="absolute bottom-2 transition-[left] duration-150 ease-linear"
        style={{ left: `${x}%`, transform: "translateX(-50%)" }}
      >
        {bubble && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] pointer-events-none animate-pop-in">
            <div className="bg-white border border-[#ece9f7] shadow-[0_6px_20px_rgba(26,26,46,0.12)] rounded-xl px-3 py-2 text-xs text-ink leading-snug text-center">
              {bubble}
            </div>
            <div className="w-2.5 h-2.5 bg-white border-r border-b border-[#ece9f7] rotate-45 mx-auto -mt-[7px]" />
          </div>
        )}
        <button
          onClick={onClickDog}
          aria-label="Scout, your study companion"
          className="pointer-events-auto block cursor-pointer bg-transparent border-none p-0"
          style={{
            transform: isWalking && legFrame === 1 ? "translateY(-2px)" : undefined,
          }}
        >
          <PixelDog size={44} mood={mood} dead={stage === "dead"} legFrame={isWalking ? legFrame : 0} facing={facing} />
        </button>
      </div>
    </div>
  );
}
