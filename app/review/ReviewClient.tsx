"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExamChoices } from "@/components/ExamChoices";
import { WhyWrong, FullExplanation } from "@/components/WhyWrong";
import { MathText } from "@/components/MathText";
import { PassageText } from "@/components/PassageText";
import { ScoreRing } from "@/components/ScoreRing";
import { PaceClock, formatSeconds, useElapsed } from "@/components/PaceClock";
import { CONFIDENCE_OPTIONS } from "@/components/ConfidencePicker";
import { PixelDog } from "@/components/PixelDog";
import { shuffled } from "@/lib/shuffle";
import { TrapNote, TrapToWatch, topRepeatedTrap } from "@/components/TrapNote";
import type { Confidence } from "@/lib/items";
import type { FigureSpec } from "@/lib/figureTypes";

interface ReviewItem {
  id: string;
  q: string;
  choices: string[]; // authored order
  underline: string | null;
  figure: FigureSpec | null;
  section: string;
  pace: number;
  shown: string[]; // this sitting's shuffled order
}

interface ItemResult {
  itemId: string;
  correct: boolean;
  choice: number;
  answer: number;
  explain: string;
  pattern: string | null;
  trap: string | null;
  whyWrong?: string | null; // why the choice they picked is wrong
  subskillId: string;
  subskillName: string;
  domain: string;
  section: string;
}

interface Named {
  id: string;
  name: string;
}

interface SubmitResponse {
  results: ItemResult[];
  mastered: Named[];
  refreshed: Named[];
  flagged: Named[];
  currentStreak: number;
  streakMilestone: boolean;
  justCompletedDomain: string | null;
  justCompletedSection: string | null;
  justCompletedCurriculum: boolean;
  newCostume: { id: string; name: string } | null;
  secondPetJustUnlocked: boolean;
}

type Phase = "loading" | "empty" | "error" | "intro" | "run" | "submitting" | "results";

// A set in progress survives a refresh or a trip to another page -- same
// day only, since tomorrow deserves a freshly chosen set.
const DRAFT_KEY = "oakmont:review-draft";
interface Draft {
  day: string;
  items: ReviewItem[];
  meta: { toConfirm: string[]; refreshers: string[] };
  answers: Record<number, number>;
  conf: Record<number, Confidence>;
  times: Record<number, number>;
  idx: number;
}
const today = () => new Date().toDateString();
function loadDraft(): Draft | null {
  try {
    const d = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || "null") as Draft | null;
    return d && d.day === today() && Array.isArray(d.items) && d.items.length ? d : null;
  } catch {
    return null;
  }
}
function saveDraft(d: Draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // storage unavailable: the set still works, it just won't survive a reload
  }
}
function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function ReviewClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [meta, setMeta] = useState<{ toConfirm: string[]; refreshers: string[] }>({ toConfirm: [], refreshers: [] });
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [conf, setConf] = useState<Record<number, Confidence>>({});
  const [times, setTimes] = useState<Record<number, number>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState("");
  const [resumed, setResumed] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (useDraft: boolean) => {
    setPhase("loading");
    setResult(null);
    const draft = useDraft ? loadDraft() : null;
    if (draft) {
      setItems(draft.items);
      setMeta(draft.meta);
      setAnswers(draft.answers);
      setConf(draft.conf);
      setTimes(draft.times);
      setIdx(draft.idx);
      setResumed(true);
      setPhase("intro");
      return;
    }
    try {
      const res = await fetch("/api/review");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        items: Omit<ReviewItem, "shown">[];
        toConfirm: string[];
        refreshers: string[];
      };
      if (!data.items.length) {
        setPhase("empty");
        return;
      }
      setItems(data.items.map((it) => ({ ...it, shown: shuffled(it.choices) })));
      setMeta({ toConfirm: data.toConfirm, refreshers: data.refreshers });
      setAnswers({});
      setConf({});
      setTimes({});
      setIdx(0);
      setResumed(false);
      setPhase("intro");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    if (phase !== "run" && phase !== "intro") return;
    if (!items.length) return;
    saveDraft({ day: today(), items, meta, answers, conf, times, idx });
  }, [phase, items, meta, answers, conf, times, idx]);

  const running = phase === "run";
  const onThis = useElapsed(startedAt, running);
  const elapsed = (times[idx] ?? 0) / 1000 + (running ? onThis : 0);

  // Banks the time spent on the current question before moving anywhere.
  function bankTime(): Record<number, number> {
    if (startedAt === null) return times;
    const next = { ...times, [idx]: (times[idx] ?? 0) + (Date.now() - startedAt) };
    setTimes(next);
    return next;
  }

  function begin() {
    setStartedAt(Date.now());
    setPhase("run");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function go(to: number) {
    bankTime();
    setIdx(to);
    setStartedAt(Date.now());
  }

  function lockIn(c: Confidence) {
    if (answers[idx] === undefined) return;
    const nextConf = { ...conf, [idx]: c };
    setConf(nextConf);
    const nextTimes = bankTime();
    if (idx < items.length - 1) {
      setIdx(idx + 1);
      setStartedAt(Date.now());
    } else {
      submit(nextConf, nextTimes);
    }
  }

  async function submit(finalConf: Record<number, Confidence>, finalTimes: Record<number, number>) {
    setPhase("submitting");
    setStartedAt(null);
    setError("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it, i) => ({
            itemId: it.id,
            choiceText: it.shown[answers[i]],
            ms: Math.round(finalTimes[i] ?? 0),
            confidence: finalConf[i],
          })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SubmitResponse;
      clearDraft();
      setResult(data);
      setPhase("results");
      router.refresh();
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    } catch {
      setError("Couldn't save your answers. Check your connection and try again.");
      setPhase("run");
      setIdx(items.length - 1);
      setStartedAt(Date.now());
    }
  }

  // Ozho reacts once the results card is on screen, so he has somewhere
  // to trot over to.
  const celebratedRef = useRef<SubmitResponse | null>(null);
  useEffect(() => {
    if (phase !== "results" || !result || celebratedRef.current === result) return;
    celebratedRef.current = result;
    const t = setTimeout(() => celebrate(result), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result]);

  function celebrate(data: SubmitResponse) {
    const right = data.results.filter((r) => r.correct).length;
    const total = data.results.length;
    const m = data.mastered;
    const message = data.secondPetJustUnlocked
      ? `${data.currentStreak} days straight, and look who showed up. Say hi to Mochi!`
      : data.justCompletedCurriculum
      ? "The WHOLE curriculum, mastered. This calls for my best trick."
      : data.justCompletedSection
      ? `All of ${data.justCompletedSection}, mastered. That's huge.`
      : data.newCostume
      ? `That just earned me the ${data.newCostume.name}. How do I look?`
      : data.justCompletedDomain
      ? `${data.justCompletedDomain}, mastered! Every skill in it.`
      : m.length
      ? `${m.length === 1 ? m[0].name : `${m.length} skills`}: mastered! You knew ${m.length === 1 ? "it" : "them"} without the label.`
      : data.streakMilestone
      ? `${data.currentStreak} days straight! Victory lap!`
      : null;
    const r = resultsRef.current?.getBoundingClientRect();
    const near = r ? { x: r.right + window.scrollX - 90, y: r.top + window.scrollY + 140 } : undefined;
    if (message) {
      window.dispatchEvent(
        new CustomEvent("ozho:celebrate", { detail: { message, tier: m.length || data.newCostume ? "big" : "small", near } })
      );
    } else {
      window.dispatchEvent(new CustomEvent("ozho:say", { detail: { message: reviewCopy(right, total).ozho, near } }));
    }
    if (data.newCostume) {
      window.dispatchEvent(new CustomEvent("ozho:costume", { detail: { costume: data.newCostume.id } }));
    }
    if (data.secondPetJustUnlocked) window.dispatchEvent(new CustomEvent("ozho:mochi-unlocked"));
  }

  // Keyboard: A-D (or 1-4) pick an answer; Enter locks it in as "Sure".
  useEffect(() => {
    if (phase !== "run") return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      const n = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
      if (n >= 0 && n < (items[idx]?.shown.length ?? 0)) {
        setAnswers((a) => ({ ...a, [idx]: n }));
      } else if (e.key === "Enter" && answers[idx] !== undefined) {
        e.preventDefault();
        lockIn("sure");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, answers, items]);

  if (phase === "loading") {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[#f3eee4]" />
        <div className="h-48 animate-pulse rounded-2xl bg-[#f6f1e6]" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <Panel>
        <h1 className="font-display text-[26px] font-semibold text-ink">Couldn&apos;t load your review</h1>
        <p className="mt-2 text-sm text-stone-500">Check your connection, then try again.</p>
        <button onClick={() => load(false)} className="mt-5 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white">
          Try again
        </button>
      </Panel>
    );
  }

  if (phase === "empty") return <EmptyState />;

  if (phase === "intro") {
    const est = items.reduce((acc, it) => acc + it.pace, 0);
    const answered = Object.keys(conf).length;
    return (
      <div>
        <Eyebrow />
        <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">Today&apos;s mixed review</h1>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-stone-600">
          {items.length} questions from everything you&apos;ve studied, in no particular order. Nothing tells you which
          skill each one tests. Spotting that is half of what the real SAT asks.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Questions" value={String(items.length)} />
          <Stat label="At SAT pace" value={`≈ ${Math.round(est / 60)} min`} />
          <Stat
            label="Sections"
            value={Array.from(new Set(items.map((i) => (i.section === "Math" ? "Math" : "R&W")))).join(" + ")}
          />
        </div>

        {(meta.toConfirm.length > 0 || meta.refreshers.length > 0) && (
          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-[#ebe3d3] bg-white p-4 text-[13.5px] text-stone-600">
            {meta.toConfirm.length > 0 && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 whitespace-nowrap rounded-full bg-[#fbf3dc] px-2 py-0.5 text-[11px] font-semibold text-[#8a5f0c]">
                  Can master
                </span>
                <span>
                  {listNames(meta.toConfirm)}: you passed the quiz. Get {meta.toConfirm.length === 1 ? "it" : "them"} right
                  here, without the label, to master {meta.toConfirm.length === 1 ? "it" : "them"}.
                </span>
              </div>
            )}
            {meta.refreshers.length > 0 && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 whitespace-nowrap rounded-full bg-[#fff4e6] px-2 py-0.5 text-[11px] font-semibold text-[#b4541a]">
                  Refresher
                </span>
                <span>{listNames(meta.refreshers)}: it&apos;s been a while. Time to make sure it stuck.</span>
              </div>
            )}
          </div>
        )}

        <ul className="mt-6 flex flex-col gap-2.5 text-[14px] text-stone-600">
          <HowStep n="1">Pick an answer, then lock it in by saying how sure you are.</HowStep>
          <HowStep n="2">A clock shows the SAT&apos;s pace. It never stops you.</HowStep>
          <HowStep n="3">At the end: what each question was testing, and how to get the ones you missed.</HowStep>
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            onClick={begin}
            className="rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {resumed && answered > 0 ? `Resume at question ${idx + 1}` : "Start"}
          </button>
          {resumed && answered > 0 && (
            <button
              onClick={() => {
                clearDraft();
                load(false);
              }}
              className="text-sm font-medium text-stone-500 hover:text-ink"
            >
              Start a fresh set instead
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "run" || phase === "submitting") {
    const it = items[idx];
    const picked = answers[idx] ?? null;
    return (
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-[13px] font-semibold text-ink">
                Question {idx + 1} <span className="font-normal text-stone-400">of {items.length}</span>
              </span>
              <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400">
                {it.section === "Math" ? "Math" : "Reading & Writing"}
              </span>
            </div>
            <div className="flex gap-1">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < idx || conf[i] ? "bg-[#587356]" : i === idx ? "bg-[#c9d8c2]" : "bg-[#eef3e9]"
                  }`}
                />
              ))}
            </div>
          </div>
          <PaceClock elapsed={elapsed} target={it.pace} label="this question" />
        </div>

        <div className="rounded-2xl border border-[#ebe3d3] bg-white p-5 shadow-[0_1px_2px_rgba(38,34,24,0.03),0_4px_14px_rgba(38,34,24,0.04)] sm:p-6">
          <div className="mb-4 text-[15px] text-ink">
            <PassageText text={it.q} highlight={it.underline ?? undefined} figure={it.figure} />
          </div>
          <ExamChoices
            choices={it.shown}
            correctIndex={-1}
            selected={picked}
            revealed={false}
            disabled={phase === "submitting"}
            onSelect={(n) => setAnswers((a) => ({ ...a, [idx]: n }))}
          />

          <div className="mt-5 border-t border-[#eef3e9] pt-4">
            <div className="mb-2 text-[12px] text-stone-400">
              {picked === null ? "Pick an answer, then lock it in:" : "Lock it in. How sure are you?"}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CONFIDENCE_OPTIONS.map((o, i) => (
                <button
                  key={o.value}
                  disabled={picked === null || phase === "submitting"}
                  onClick={() => lockIn(o.value)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    i === 0
                      ? "bg-forest text-white hover:opacity-90"
                      : "border border-[#ddd3bf] bg-white text-ink hover:border-[#c9d8c2]"
                  }`}
                >
                  {o.label}
                  {i === 0 && picked !== null && (
                    <span className="ml-1.5 hidden text-[11px] font-normal text-white/50 sm:inline">Enter</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => go(idx - 1)}
            disabled={idx === 0 || phase === "submitting"}
            className="font-medium text-stone-500 hover:text-ink disabled:invisible"
          >
            &larr; Previous
          </button>
          <span className="text-[12px] text-stone-400">
            {phase === "submitting" ? "Checking your answers…" : "Keys: A–D to pick, Enter for Sure"}
          </span>
        </div>
        {error && <div className="mt-3 text-sm text-[#b23b3b]">{error}</div>}
      </div>
    );
  }

  // results
  const res = result!;
  return (
    <ReviewResults
      cardRef={resultsRef}
      items={items}
      answers={answers}
      conf={conf}
      times={times}
      res={res}
      onAnother={() => load(false)}
    />
  );
}

function listNames(names: string[]) {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function reviewCopy(right: number, total: number) {
  const pct = total ? right / total : 0;
  if (right === total)
    return {
      headline: "Clean sweep.",
      body: "Every question right, with no labels to lean on. That's what test day feels like.",
      ozho: "Every single one, no hints! Tail at max speed.",
    };
  if (pct >= 0.75)
    return {
      headline: "Strong set.",
      body: "You spotted what almost every question was testing. The misses below are worth two minutes.",
      ozho: "Look at you, sniffing out every question type.",
    };
  if (pct >= 0.5)
    return {
      headline: "Solid work.",
      body: "Mixed sets are harder than single-skill quizzes on purpose. Go over the misses below.",
      ozho: "Mixed sets are tough. Let's dig up those misses.",
    };
  return {
    headline: "A tough mix.",
    body: "This is the hardest kind of practice: working out what's being asked. Each miss links back to its lesson.",
    ozho: "Rough one. Happens to every dog. The lessons are right there.",
  };
}

function ReviewResults({
  cardRef,
  items,
  answers,
  conf,
  times,
  res,
  onAnother,
}: {
  cardRef: React.Ref<HTMLDivElement>;
  items: ReviewItem[];
  answers: Record<number, number>;
  conf: Record<number, Confidence>;
  times: Record<number, number>;
  res: SubmitResponse;
  onAnother: () => void;
}) {
  const byId = new Map(res.results.map((r) => [r.itemId, r]));
  const right = res.results.filter((r) => r.correct).length;
  const total = res.results.length;
  const copy = reviewCopy(right, total);
  const spent = items.reduce((acc, _, i) => acc + (times[i] ?? 0), 0) / 1000;
  const target = items.reduce((acc, it) => acc + it.pace, 0);
  const shaky = items.filter((it, i) => byId.get(it.id)?.correct && conf[i] && conf[i] !== "sure");
  const firstMiss = items.findIndex((it) => !byId.get(it.id)?.correct);
  const repeatedTrap = topRepeatedTrap(res.results.map((r) => r.trap));
  const listRef = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div>
      <div
        ref={cardRef}
        className="mb-6 overflow-hidden rounded-2xl border border-[#ebe3d3] bg-white shadow-[0_1px_2px_rgba(38,34,24,0.04),0_12px_32px_-12px_rgba(38,34,24,0.14)]"
      >
        <div className="flex flex-wrap items-center gap-5 p-5 sm:p-6">
          <ScoreRing score={right} total={total} />
          <div className="min-w-[200px] flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400">Mixed review</div>
            <div className="mt-1 font-display text-[26px] font-semibold leading-tight text-ink">{copy.headline}</div>
            <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-stone-600">{copy.body}</p>
          </div>
        </div>

        <div className="grid gap-px border-t border-[#eef3e9] bg-[#eef3e9] sm:grid-cols-2">
          <div className="bg-white px-5 py-3.5 sm:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">Your pace</div>
            <div className="mt-1 text-[14px] text-ink">
              <span className="font-semibold tabular-nums">{formatSeconds(spent / Math.max(1, total))}</span> per question
              <span className="text-stone-400"> · SAT pace {formatSeconds(target / Math.max(1, total))}</span>
            </div>
            <div className="mt-0.5 text-[12.5px] text-stone-500">
              {spent <= target * 1.05
                ? "On pace for test day."
                : spent <= target * 1.4
                ? "A little slower than test pace. Accuracy first, speed comes with reps."
                : "Well over test pace for now. That's normal early on; watch it shrink."}
            </div>
          </div>
          <div className="bg-white px-5 py-3.5 sm:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">Right, but not sure</div>
            <div className="mt-1 text-[14px] text-ink">
              <span className="font-semibold tabular-nums">{shaky.length}</span>{" "}
              {shaky.length === 1 ? "question" : "questions"}
            </div>
            <div className="mt-0.5 text-[12.5px] text-stone-500">
              {shaky.length
                ? "Right answers you weren't sure of come back in later reviews until they're solid."
                : "Everything you got right, you knew. That's the goal."}
            </div>
          </div>
        </div>

        {repeatedTrap && <TrapToWatch trap={repeatedTrap.trap} count={repeatedTrap.count} />}

        {(res.mastered.length > 0 || res.refreshed.length > 0 || res.flagged.length > 0 || res.newCostume || res.currentStreak > 0) && (
          <div className="flex flex-wrap gap-2 border-t border-[#eef3e9] px-5 py-3 sm:px-6">
            {res.mastered.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-[#fbf3dc] px-3 py-1 text-[12.5px] font-semibold text-[#8a5f0c]">
                ★ Mastered: {m.name}
              </span>
            ))}
            {res.refreshed.map((m) => (
              <span key={m.id} className="rounded-full bg-[#eaf6ef] px-3 py-1 text-[12.5px] font-semibold text-accent">
                Refreshed: {m.name}
              </span>
            ))}
            {res.flagged.map((m) => (
              <span key={m.id} className="rounded-full bg-[#fff4e6] px-3 py-1 text-[12.5px] font-semibold text-[#b4541a]">
                Needs a refresher: {m.name}
              </span>
            ))}
            {res.currentStreak > 0 && (
              <span className="rounded-full bg-[#fff4e6] px-3 py-1 text-[12.5px] font-semibold text-[#b4541a]">
                {res.currentStreak}-day streak
              </span>
            )}
            {res.newCostume && (
              <Link
                href="/settings#wardrobe"
                className="inline-flex items-center gap-2 rounded-full bg-[#fbf3dc] py-0.5 pl-1 pr-3 text-[12.5px] font-semibold text-[#8a5f0c] hover:bg-[#f7eac6]"
              >
                <span className="-my-1">
                  <PixelDog size={26} costume={res.newCostume.id} shadow={false} />
                </span>
                New outfit: {res.newCostume.name} · see wardrobe →
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[#eef3e9] bg-[#faf7f0] px-5 py-3.5 sm:px-6">
          {firstMiss >= 0 && (
            <button
              onClick={() => listRef.current[firstMiss]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Review {total - right} {total - right === 1 ? "miss" : "misses"} ↓
            </button>
          )}
          <Link
            href="/dashboard"
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              firstMiss < 0 ? "bg-forest text-white hover:opacity-90" : "border border-[#ddd3bf] bg-white text-ink hover:border-[#c9d8c2]"
            }`}
          >
            Back to dashboard
          </Link>
          <button
            onClick={onAnother}
            className="rounded-lg border border-[#ddd3bf] bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:border-[#c9d8c2] hover:text-ink"
          >
            Another set
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {items.map((it, i) => {
          const r = byId.get(it.id);
          if (!r) return null;
          const correctShown = it.shown.indexOf(it.choices[r.answer]);
          const c = conf[i];
          return (
            <div
              key={it.id}
              ref={(el) => {
                listRef.current[i] = el;
              }}
              className={`scroll-mt-[72px] rounded-xl border p-5 shadow-[0_1px_2px_rgba(38,34,24,0.03),0_4px_14px_rgba(38,34,24,0.04)] ${
                r.correct ? "border-[#cde8d9] bg-[#fbfefc]" : "border-[#f0d0d0] bg-[#fefbfb]"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                    r.correct ? "bg-[#eaf6ef] text-accent" : "bg-[#fbeaea] text-[#b23b3b]"
                  }`}
                >
                  {r.correct ? "✓ Correct" : "✕ Incorrect"}
                </span>
                <span className="text-[12px] text-stone-500">
                  Question {i + 1} tested <span className="font-semibold text-ink">{r.subskillName}</span>
                  <span className="text-stone-400"> · {r.domain}</span>
                </span>
                {c && (
                  <span className="ml-auto text-[11.5px] text-stone-400">
                    You said: {CONFIDENCE_OPTIONS.find((o) => o.value === c)?.label}
                    {times[i] ? ` · ${formatSeconds((times[i] ?? 0) / 1000)}` : ""}
                  </span>
                )}
              </div>
              <div className="mb-3 text-sm text-ink">
                <PassageText text={it.q} highlight={it.underline ?? undefined} figure={it.figure} />
              </div>
              <ExamChoices
                choices={it.shown}
                correctIndex={correctShown}
                selected={answers[i] ?? null}
                revealed
                disabled
                onSelect={() => {}}
              />
              {!r.correct && r.whyWrong && answers[i] !== undefined ? (
                <WhyWrong letter={String.fromCharCode(65 + (answers[i] as number))} note={r.whyWrong} trap={r.trap}>
                  <FullExplanation letter={String.fromCharCode(65 + correctShown)} text={r.explain} />
                </WhyWrong>
              ) : (
                <>
                  <div className="mt-2.5 text-[13px] leading-relaxed text-stone-500">
                    <strong className="text-ink">Explanation: </strong>
                    <MathText text={r.explain} />
                  </div>
                  {!r.correct && r.trap && <TrapNote trap={r.trap} />}
                </>
              )}
              {!r.correct && (
                <Link
                  href={`/subskill/${r.subskillId}${r.pattern ? `?pattern=${encodeURIComponent(r.pattern)}` : ""}`}
                  className="mt-3 inline-block text-[13px] font-semibold text-accent hover:underline"
                >
                  {r.pattern ? `Review “${r.pattern}” in the ${r.subskillName} lesson →` : `Review the ${r.subskillName} lesson →`}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Eyebrow() {
  return <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2c4c3b]">Mixed review</div>;
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#ebe3d3] bg-white p-6 sm:p-8">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ebe3d3] bg-white px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">{label}</div>
      <div className="mt-1 font-display text-[22px] font-semibold text-ink">{value}</div>
    </div>
  );
}

function HowStep({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf1e5] text-[11px] font-bold text-[#2c4c3b]">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function EmptyState() {
  return (
    <div>
      <Eyebrow />
      <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">Mixed review opens after your second skill</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-stone-600">
        It mixes questions from different skills without saying which is which, so it needs at least two to mix. Take the
        quiz for your next lesson and it&apos;ll be ready.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
