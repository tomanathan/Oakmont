"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PET_NAME, SECOND_PET_NAME } from "@/lib/pet";
import { PetAvatar } from "@/components/PetAvatar";
import { BrandMark } from "@/components/BrandMark";

export function WelcomeClient({ email }: { email: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "goals">("intro");
  const [submitting, setSubmitting] = useState(false);
  const [baseline, setBaseline] = useState("");
  const [testDate, setTestDate] = useState("");
  const [error, setError] = useState("");

  // Shared by both the goals form's submit and its "skip" link -- marks
  // welcome as seen (so a fresh account only lands here once) and moves on.
  // patchBody is omitted entirely on skip, not sent as nulls, since the
  // fields are already null on a brand-new account -- there's nothing to
  // write, just nothing to wait on before leaving.
  async function finishOnboarding(patchBody?: { baselineScore?: number; targetTestDate?: string }) {
    setError("");
    setSubmitting(true);
    try {
      if (patchBody && Object.keys(patchBody).length > 0) {
        const res = await fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't save. Please try again.");
          setSubmitting(false);
          return;
        }
      }
      await fetch("/api/welcome/seen", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  function submitGoals(e: React.FormEvent) {
    e.preventDefault();
    const patchBody: { baselineScore?: number; targetTestDate?: string } = {};
    if (baseline) patchBody.baselineScore = Number(baseline);
    if (testDate) patchBody.targetTestDate = testDate;
    finishOnboarding(patchBody);
  }

  if (step === "goals") {
    const todayStr = new Date().toISOString().slice(0, 10);
    return (
      <div className="max-w-[640px] mx-auto px-6 py-12 font-sans">
        <div className="text-center mb-10">
          <BrandMark size={64} className="mx-auto mb-4" />
          <div className="font-display font-semibold text-[24px] text-ink mb-1.5">When's your test?</div>
          <div className="text-sm text-gray-500">
            This shapes your study plan. Don't know yet? Skip it and we'll start you on the default
            6-month plan — you can always set it later in Settings.
          </div>
        </div>

        <form
          onSubmit={submitGoals}
          className="bg-white border border-[#ece9f7] rounded-xl p-6 mb-5 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_8px_24px_rgba(26,26,46,0.06)]"
        >
          <label className="block text-sm text-gray-700 mb-1">Baseline score (400-1600), if you have one</label>
          <div className="text-xs text-gray-400 mb-2">A PSAT score works great here.</div>
          <input
            type="number"
            min={400}
            max={1600}
            value={baseline}
            onChange={(e) => setBaseline(e.target.value)}
            placeholder="e.g. 1120"
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-4 text-sm focus:outline-none focus:border-[#6d7fd6]"
          />

          <label className="block text-sm text-gray-700 mb-1">Target SAT test date</label>
          <input
            type="date"
            min={todayStr}
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] mb-4 text-sm focus:outline-none focus:border-[#6d7fd6]"
          />

          {error && <div className="text-red-700 text-sm mb-3">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-ink text-white font-semibold text-sm disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Continue →"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => finishOnboarding()}
            disabled={submitting}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 disabled:opacity-60"
          >
            I don't know yet — skip for now
          </button>
        </div>
      </div>
    );
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
          title="Every official subskill"
          body="Lessons are organized by the exact subskills and domains College Board tests, each with worked examples, common traps, and a practice quiz."
        />
        <FeatureCard
          title="A day-by-day plan"
          body="Your 6-month plan breaks every week down by day. Set your test date in Settings and the whole timeline resizes to fit."
        />
        <FeatureCard
          title="8 full-length practice tests"
          body="All 8 official practice tests are spaced across your plan, not bunched at the end, so you get real feedback the whole way through."
        />
        <FeatureCard
          title="Score analysis"
          body="Log each practice test's results on your Study plan page to see your subject-by-subject trend over time — and watch your schedule adjust to focus on it."
        />
      </div>

      <MeetOzho />

      <button
        onClick={() => setStep("goals")}
        className="w-full py-3 rounded-lg bg-ink text-white font-semibold text-sm"
      >
        Get started →
      </button>
    </div>
  );
}

// The first proper introduction to Ozho: what feeds him, what he earns,
// and the one real stake -- said plainly, not as a threat. "Say hi" sends
// the roaming Ozho (already wandering this page) over to the card.
function MeetOzho() {
  const ref = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(false);
  function sayHi() {
    const r = ref.current?.getBoundingClientRect();
    const near = r ? { x: r.right + window.scrollX - 60, y: r.top + window.scrollY - 10 } : undefined;
    window.dispatchEvent(
      new CustomEvent(greeted ? "ozho:say" : "ozho:celebrate", {
        detail: {
          message: greeted ? "Still here! Still excited!" : "Hi hi hi! I'm Ozho. We're going to be a great team.",
          tier: "small",
          near,
        },
      })
    );
    setGreeted(true);
  }
  const facts = [
    { title: "Feed him", body: "Every quiz you finish is a meal. One a day keeps him thriving." },
    { title: "Dress him up", body: "Streaks and mastered domains unlock outfits for his wardrobe." },
    { title: "Make a friend", body: `Hit a 30-day streak and ${SECOND_PET_NAME} comes to stay.` },
  ];
  return (
    <div ref={ref} className="mb-8 rounded-xl border border-[#f0d0b3] bg-[#fef8f2] p-6">
      <div className="flex items-center gap-5">
        <div className="flex h-[92px] w-[92px] flex-shrink-0 items-end justify-center rounded-2xl bg-white/70 pb-2">
          <PetAvatar stage="thriving" size={76} />
        </div>
        <div className="min-w-0">
          <div className="font-display text-[20px] font-semibold text-ink">Meet {PET_NAME}</div>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Your study buddy. He&apos;ll wander around while you work, cheer when you nail something, and
            nudge you when it&apos;s been a while.
          </p>
          <button
            onClick={sayHi}
            className="mt-2.5 rounded-lg border border-[#f0d0b3] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#9a5a1c] transition-colors hover:border-[#e6b98f]"
          >
            {greeted ? "Say hi again" : `Say hi to ${PET_NAME}`}
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.title} className="rounded-lg bg-white/70 px-3.5 py-3">
            <div className="text-[13px] font-semibold text-ink">{f.title}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-gray-500">{f.body}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        One honest warning: he depends on you. After a few days without practice he gets hungry, and a
        full week without any means starting over with a new pet.
      </p>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-[#f8f8fb] border border-[#ece9f7] rounded-xl p-4">
      <div className="text-sm font-semibold text-ink mb-1.5">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{body}</div>
    </div>
  );
}
