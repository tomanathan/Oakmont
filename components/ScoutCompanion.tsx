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
const TIPS = [
  "You can retake any quiz from its subskill page to reinforce it.",
  "Set your target test date in Settings and your whole plan resizes to fit.",
  "Missed a question? Read the explanation before moving on — it sticks better.",
  "All 8 practice tests are spaced through your plan, not just at the end.",
  "Check Practice exam analysis to see your score trend by subject.",
  "A few minutes a day beats one long cram session.",
  "Click a week on the 6-month plan to see it broken down day by day.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Stays roughly within this ring of wherever the mouse has been, but never
// closer than MIN_DIST to the live cursor -- near enough to feel like it's
// keeping you company, far enough to never sit on top of what you're doing.
const MIN_DIST = 100;
const WANDER_MIN = 130;
const WANDER_MAX = 280;
const TOP_MARGIN = 100;
const SIDE_MARGIN = 24;
const BOTTOM_MARGIN = 24;
const SPEED = 5; // px per tick
const TICK_MS = 120;

export function ScoutCompanion() {
  const [stage, setStage] = useState<PetStage | null>(null);
  const [pos, setPos] = useState({ x: 80, y: 400 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [isWalking, setIsWalking] = useState(true);
  const [bubble, setBubble] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const posRef = useRef({ x: 80, y: 400 });
  const targetRef = useRef({ x: 80, y: 400 });
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const walkingRef = useRef(true);
  const facingRef = useRef<1 | -1>(1);
  const behaviorUntilRef = useRef(0);
  const speakAtRef = useRef(0);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<PetStage | null>(null);
  const streakRef = useRef(0);
  const hasGreetedRef = useRef(false);

  useEffect(() => {
    const startX = window.innerWidth / 2;
    const startY = Math.min(window.innerHeight - 100, window.innerHeight * 0.6);
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };
    setPos({ x: startX, y: startY });
    speakAtRef.current = Date.now() + 6000;
    setMounted(true);
  }, []);

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

  useEffect(() => {
    function onMove(e: PointerEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  function speak(text: string, ms = 4500) {
    setBubble(text);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => setBubble(null), ms);
  }

  function pickMessage(): string {
    const s = stageRef.current;
    const roll = Math.random();
    if ((s === "hungry" || s === "critical") && roll < 0.3) return pick(NUDGES);
    if (streakRef.current >= 2 && (s === "thriving" || s === "content") && roll < 0.25) {
      return pick([
        `${streakRef.current}-day streak! Keep it going.`,
        `Loving this ${streakRef.current}-day streak.`,
      ]);
    }
    if (roll < 0.6) return pick(TIPS);
    return pick(ENCOURAGEMENTS);
  }

  // Say hello shortly after Scout's mood is known.
  useEffect(() => {
    if (stage === null || hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const t = setTimeout(() => speak(pick(GREETINGS), 4000), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function pickNewTarget() {
    const anchor = mouseRef.current ?? posRef.current;
    const angle = Math.random() * Math.PI * 2;
    const radius = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
    const maxX = window.innerWidth - SIDE_MARGIN;
    const maxY = window.innerHeight - BOTTOM_MARGIN;
    targetRef.current = {
      x: Math.min(maxX, Math.max(SIDE_MARGIN, anchor.x + Math.cos(angle) * radius)),
      y: Math.min(maxY, Math.max(TOP_MARGIN, anchor.y + Math.sin(angle) * radius)),
    };
  }

  // Roam near wherever the mouse has been, keep clear of the cursor itself,
  // and speak up often -- a companion that's around, not one that hides.
  useEffect(() => {
    if (reducedMotion || !mounted) return;
    const interval = setInterval(() => {
      const now = Date.now();

      if (now > speakAtRef.current) {
        speakAtRef.current = now + 5000 + Math.random() * 5000;
        speak(pickMessage());
      }

      if (now > behaviorUntilRef.current) {
        const goWalk = Math.random() < 0.75;
        walkingRef.current = goWalk;
        setIsWalking(goWalk);
        behaviorUntilRef.current =
          now + (goWalk ? 2200 + Math.random() * 2600 : 1400 + Math.random() * 2200);
        if (goWalk) pickNewTarget();
      }

      if (mouseRef.current) {
        const dx = posRef.current.x - mouseRef.current.x;
        const dy = posRef.current.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < MIN_DIST) {
          const push = (MIN_DIST - dist) * 0.5;
          posRef.current = {
            x: posRef.current.x + (dx / dist) * push,
            y: posRef.current.y + (dy / dist) * push,
          };
          if (Math.abs(dx) > 1) {
            facingRef.current = dx > 0 ? 1 : -1;
            setFacing(facingRef.current);
          }
          walkingRef.current = true;
          setIsWalking(true);
          setLegFrame((f) => (f === 0 ? 1 : 0));
          pickNewTarget();
          behaviorUntilRef.current = now + 2200 + Math.random() * 2600;
        }
      }

      if (walkingRef.current) {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 4) {
          const step = Math.min(dist, SPEED);
          posRef.current = {
            x: posRef.current.x + (dx / dist) * step,
            y: posRef.current.y + (dy / dist) * step,
          };
          if (Math.abs(dx) > 1) {
            facingRef.current = dx > 0 ? 1 : -1;
            setFacing(facingRef.current);
          }
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }
        const maxX = window.innerWidth - SIDE_MARGIN;
        const maxY = window.innerHeight - BOTTOM_MARGIN;
        posRef.current = {
          x: Math.min(maxX, Math.max(SIDE_MARGIN, posRef.current.x)),
          y: Math.min(maxY, Math.max(TOP_MARGIN, posRef.current.y)),
        };
      }
      setPos({ ...posRef.current });
    }, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, mounted]);

  function onClickDog() {
    speak(pick(GREETINGS), 3200);
  }

  const mood = stage ? MOOD_BY_STAGE[stage] : "neutral";

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div
        className="absolute"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          transition: `left ${TICK_MS}ms linear, top ${TICK_MS}ms linear`,
        }}
      >
        {bubble && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] pointer-events-none animate-pop-in">
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
