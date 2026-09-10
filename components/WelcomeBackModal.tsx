"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import { PET_NAME, type PetStage } from "@/lib/pet";

// Only the stages worth interrupting for -- there's no point telling
// someone their pet is fine. Styling and label escalate with severity.
const PET_ALERT: Partial<Record<PetStage, { box: string; label: string; labelClass: string }>> = {
  hungry: {
    box: "bg-[#fbf1df] border-[#f0ddb8]",
    label: `${PET_NAME} is getting hungry`,
    labelClass: "text-[#9a6a12]",
  },
  critical: {
    box: "bg-[#fbeaea] border-[#f0d0d0]",
    label: `⚠️ ${PET_NAME} needs you today`,
    labelClass: "text-[#b23b3b]",
  },
  dead: {
    box: "bg-[#f0eff2] border-[#e0dee6]",
    label: `${PET_NAME} didn't make it`,
    labelClass: "text-gray-500",
  },
};

export function WelcomeBackModal({
  sessionKey,
  previousLoginAt,
  quizzesLastSession,
  masteredLastSession,
  currentStreak,
  petStage,
  petMessage,
}: {
  sessionKey: string;
  previousLoginAt: string;
  quizzesLastSession: number;
  masteredLastSession: number;
  currentStreak: number;
  petStage: PetStage;
  petMessage: string;
}) {
  const [open, setOpen] = useState(false);

  // Keyed off the timestamp of this specific login (not the calendar day),
  // so it fires every time someone actually logs in -- including more than
  // once in the same day -- but doesn't re-fire on every page load/refresh
  // within that same login, since lastLoginAt only changes when a new
  // login happens.
  useEffect(() => {
    try {
      const seenKey = window.localStorage.getItem("welcome-back-seen");
      setOpen(seenKey !== sessionKey);
    } catch {
      setOpen(true);
    }
  }, [sessionKey]);

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
      window.localStorage.setItem("welcome-back-seen", sessionKey);
    } catch {
      // Private browsing or storage disabled -- fine, it just reappears next reload.
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
        <BrandMark size={48} className="mx-auto mb-4" />
        <div className="font-display font-semibold text-xl text-ink mb-1.5">Welcome back!</div>
        <div className="text-sm text-gray-500 mb-5">Last time you were here was {lastDate}.</div>
        <div className="bg-[#eef0fc] border border-[#d7dbf3] rounded-xl p-4 mb-4 text-sm text-[#41436b] leading-relaxed">
          {summary}
          {currentStreak > 0 && ` You're on a ${currentStreak}-day streak — keep it going.`}
        </div>

        {PET_ALERT[petStage] && (
          <div
            className={`flex items-center gap-3 rounded-xl border p-3.5 mb-6 text-left ${PET_ALERT[petStage]!.box}`}
          >
            <PixelDog
              size={40}
              mood={MOOD_BY_STAGE[petStage]}
              dead={petStage === "dead"}
              className={`flex-shrink-0 ${petStage === "critical" ? "animate-worried" : ""}`}
            />
            <div className="min-w-0">
              <div className={`text-xs font-bold mb-0.5 ${PET_ALERT[petStage]!.labelClass}`}>
                {PET_ALERT[petStage]!.label}
              </div>
              <div className="text-[13px] text-gray-700 leading-snug">{petMessage}</div>
            </div>
          </div>
        )}

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
