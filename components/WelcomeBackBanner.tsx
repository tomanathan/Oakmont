"use client";

import { useEffect, useState } from "react";

export function WelcomeBackBanner({
  sessionKey,
  previousLoginAt,
  quizzesLastSession,
  masteredLastSession,
  currentStreak,
}: {
  sessionKey: string;
  previousLoginAt: string;
  quizzesLastSession: number;
  masteredLastSession: number;
  currentStreak: number;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const seenKey = window.localStorage.getItem("welcome-back-seen");
      setDismissed(seenKey === sessionKey);
    } catch {
      setDismissed(false);
    }
  }, [sessionKey]);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem("welcome-back-seen", sessionKey);
    } catch {
      // Private browsing or storage disabled -- fine, it just reappears next reload.
    }
  }

  if (dismissed) return null;

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
    <div className="bg-[#eef0fc] border border-[#d7dbf3] rounded-xl p-4 mb-5 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-ink mb-0.5">Welcome back!</div>
        <div className="text-xs text-[#6b6f8e]">
          Last time you were here was {lastDate}. {summary}
          {currentStreak > 0 && ` You're on a ${currentStreak}-day streak — keep it going.`}
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0 leading-none"
      >
        ✕
      </button>
    </div>
  );
}
