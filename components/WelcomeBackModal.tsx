"use client";

import { useEffect, useState } from "react";

export function WelcomeBackModal({
  previousLoginAt,
  quizzesLastSession,
  masteredLastSession,
  currentStreak,
}: {
  previousLoginAt: string;
  quizzesLastSession: number;
  masteredLastSession: number;
  currentStreak: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const todayKey = new Date().toDateString();
    try {
      const seenDate = window.localStorage.getItem("welcome-back-seen-date");
      setOpen(seenDate !== todayKey);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem("welcome-back-seen-date", new Date().toDateString());
    } catch {
      // Private browsing or storage disabled -- fine, it just reappears next login today.
    }
  }

  if (!open) return null;

  const lastDate = new Date(previousLoginAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  let summary: string;
  if (quizzesLastSession === 0) {
    summary = "You didn't complete any quizzes last time — ready to pick back up?";
  } else {
    const parts = [`completed ${quizzesLastSession} quiz${quizzesLastSession === 1 ? "" : "zes"}`];
    if (masteredLastSession > 0) {
      parts.push(`mastered ${masteredLastSession} subskill${masteredLastSession === 1 ? "" : "s"}`);
    }
    summary = `You ${parts.join(" and ")}.`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-4"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(26,26,46,0.25)] max-w-[440px] w-full p-7 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d7fd6] to-accent flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
          O
        </div>
        <div className="text-xl font-bold text-ink mb-1.5">Welcome back!</div>
        <div className="text-sm text-gray-500 mb-5">Last time you were here was {lastDate}.</div>
        <div className="bg-[#eef0fc] border border-[#d7dbf3] rounded-xl p-4 mb-6 text-sm text-[#41436b] leading-relaxed">
          {summary}
          {currentStreak > 0 && ` You're on a ${currentStreak}-day streak — keep it going.`}
        </div>
        <button
          onClick={dismiss}
          className="w-full py-3 rounded-lg bg-ink text-white font-semibold text-sm hover:opacity-90"
        >
          Let's go →
        </button>
      </div>
    </div>
  );
}
