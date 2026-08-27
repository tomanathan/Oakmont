"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PET_NAME } from "@/lib/pet";
import { PetAvatar } from "@/components/PetAvatar";
import { BrandMark } from "@/components/BrandMark";

export function WelcomeClient({ email }: { email: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function getStarted() {
    setSubmitting(true);
    try {
      await fetch("/api/welcome/seen", { method: "POST" });
    } finally {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-6 py-12 font-sans">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          Skip to dashboard →
        </button>
      </div>
      <div className="text-center mb-10">
        <BrandMark size={64} className="mx-auto mb-4" />
        <div className="font-display font-semibold text-[28px] text-ink mb-1.5">Welcome to Oakmont Study Center</div>
        <div className="text-sm text-gray-500">{email}</div>
      </div>

      <div className="bg-white border border-[#ece9f7] rounded-xl p-6 mb-5 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_8px_24px_rgba(26,26,46,0.06)]">
        <div className="text-[15px] font-bold text-ink mb-2">What is the SAT?</div>
        <p className="text-sm text-gray-600 leading-relaxed mb-2.5">
          The SAT is a standardized test most U.S. colleges use as part of admissions. The current
          digital SAT takes about 2 hours and 14 minutes and has two sections:{" "}
          <strong className="text-ink">Reading and Writing</strong> and{" "}
          <strong className="text-ink">Math</strong>. Each section is split into two modules — how
          you do on the first module determines the difficulty of the second, so consistent
          performance throughout matters more than getting lucky on any one question.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          You'll get a composite score from <strong className="text-ink">400 to 1600</strong>{" "}
          (each section scored 200–800), plus subscores that break performance down by domain —
          which is exactly how this app organizes your studying.
        </p>
      </div>

      <div className="text-[15px] font-bold text-ink mb-3">How Oakmont works</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <FeatureCard
          emoji="📚"
          title="Every official subskill"
          body="Lessons are organized by the exact subskills and domains College Board tests, each with worked examples, common traps, and a practice quiz."
        />
        <FeatureCard
          emoji="🗓️"
          title="A day-by-day plan"
          body="Your 6-month plan breaks every week down by day. Set your test date in Settings and the whole timeline resizes to fit."
        />
        <FeatureCard
          emoji="📝"
          title="8 full-length practice tests"
          body="All 8 official practice tests are spaced across your plan, not bunched at the end, so you get real feedback the whole way through."
        />
        <FeatureCard
          emoji="📈"
          title="Score analysis"
          body="Log each practice test's results on the Analysis page to see your subject-by-subject trend over time."
        />
      </div>

      <div className="bg-[#fef8f2] border border-[#f0d0b3] rounded-xl p-6 mb-8 flex items-center gap-5">
        <PetAvatar stage="thriving" size={72} />
        <div>
          <div className="text-[15px] font-bold text-ink mb-1">Meet {PET_NAME}</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {PET_NAME} is your study buddy — it stays happy as long as you complete at least one
            quiz every few days. Go a full week without practicing, though, and {PET_NAME} won't
            make it. Keep your streak up to keep {PET_NAME} around.
          </p>
        </div>
      </div>

      <button
        onClick={getStarted}
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-ink text-white font-semibold text-sm disabled:opacity-60"
      >
        {submitting ? "Loading..." : "Get started →"}
      </button>
    </div>
  );
}

function FeatureCard({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="bg-[#f8f8fb] border border-[#ece9f7] rounded-xl p-4">
      <div className="text-lg mb-1.5 leading-none">{emoji}</div>
      <div className="text-sm font-semibold text-ink mb-1">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{body}</div>
    </div>
  );
}
