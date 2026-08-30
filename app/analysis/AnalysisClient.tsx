"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sectionTheme } from "@/lib/sectionTheme";
import { StarRating } from "@/components/StarRating";
import type { DomainMastery } from "@/lib/mastery";

interface Test {
  id: string;
  takenAt: string;
  compositeScore: number;
  rwScore: number;
  mathScore: number;
  domainScores: Record<string, number>;
}

interface DomainInfo {
  domain: string;
  section: string;
}

export function AnalysisClient({
  domains,
  domainMastery,
  tests,
}: {
  domains: DomainInfo[];
  domainMastery: DomainMastery[];
  tests: Test[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(tests.length === 0);
  const latest = tests[0] ?? null;
  const previous = tests[1] ?? null;

  // Opening the form inserts a large block above whatever's currently in
  // view, which otherwise leaves the page stranded mid-scroll against
  // unrelated content further down.
  useEffect(() => {
    if (formOpen) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [formOpen]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
        <div className="text-xl font-bold text-ink">Practice exam analysis</div>
        {tests.length > 0 && (
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="px-3.5 py-2 rounded-lg border border-[#e0defa] bg-[#f0eff9] text-gray-700 text-sm font-medium hover:border-[#c9c6ee]"
          >
            {formOpen ? "Cancel" : "+ Log a practice test"}
          </button>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-6">
        Log your full-length practice test results here and see how each subject is trending.
      </div>

      {formOpen && (
        <SubmitTestForm
          domains={domains}
          onSaved={() => {
            setFormOpen(false);
            router.refresh();
          }}
        />
      )}

      {latest ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <ScoreCard
              label="Composite"
              value={latest.compositeScore}
              delta={previous ? latest.compositeScore - previous.compositeScore : null}
              accent="text-ink"
            />
            <ScoreCard
              label="Reading & Writing"
              value={latest.rwScore}
              delta={previous ? latest.rwScore - previous.rwScore : null}
              accent="text-[#6d7fd6]"
            />
            <ScoreCard
              label="Math"
              value={latest.mathScore}
              delta={previous ? latest.mathScore - previous.mathScore : null}
              accent="text-accent"
            />
          </div>

          <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
            <div className="text-sm font-semibold text-ink">Subject breakdown</div>
            <div className="text-xs text-gray-400">
              Stars track quiz mastery &mdash; the same rating shown on the{" "}
              <button onClick={() => router.push("/dashboard")} className="underline hover:text-ink">
                dashboard
              </button>
              . Your practice test score is shown separately below.
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {domains.map((d) => {
              const theme = sectionTheme(d.section);
              const testPct = latest.domainScores[d.domain];
              const prevTestPct = previous?.domainScores[d.domain];
              const mastery = domainMastery.find((m) => m.domain === d.domain);
              return (
                <div key={d.domain} className={`border rounded-[10px] p-4 ${theme.cardBg} ${theme.cardBorder}`}>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${theme.dot}`} />
                      <span className="text-sm font-medium text-ink truncate">{d.domain}</span>
                    </div>
                    <StarRating stars={mastery?.stars ?? 0} />
                  </div>
                  <DomainBar
                    label="Latest practice test"
                    pct={testPct ?? null}
                    delta={
                      testPct !== undefined && prevTestPct !== undefined
                        ? testPct - prevTestPct
                        : null
                    }
                    barClass={theme.bar}
                  />
                  <DomainBar label="Quiz mastery" pct={mastery?.quizPct ?? null} barClass="bg-gray-400" />
                </div>
              );
            })}
          </div>

          {tests.length > 1 && (
            <div>
              <div className="text-sm font-semibold text-ink mb-3">History</div>
              <div className="flex flex-col gap-1.5">
                {tests.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-3.5 py-2.5 border border-[#ece9f7] bg-white rounded-[10px] text-sm"
                  >
                    <span className="text-gray-500">
                      {new Date(t.takenAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-ink font-semibold">
                      {t.compositeScore}{" "}
                      <span className="text-gray-400 font-normal">
                        ({t.rwScore} R&amp;W · {t.mathScore} Math)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : !formOpen ? (
        <div className="text-sm text-gray-500">No practice tests logged yet.</div>
      ) : null}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: number;
  delta: number | null;
  accent: string;
}) {
  return (
    <div className="border border-[#ece9f7] bg-white rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>
        {value}
        {delta !== null && delta !== 0 && (
          <span className={`ml-2 text-sm font-semibold ${delta > 0 ? "text-accent" : "text-red-500"}`}>
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function DomainBar({
  label,
  pct,
  delta,
  barClass,
}: {
  label: string;
  pct: number | null | undefined;
  delta?: number | null;
  barClass: string;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] text-gray-500">{label}</span>
        <span className="text-[11px] text-gray-500">
          {pct === null || pct === undefined ? (
            "not reported"
          ) : (
            <>
              {pct}%
              {delta !== null && delta !== undefined && delta !== 0 && (
                <span className={delta > 0 ? "text-accent" : "text-red-500"}>
                  {" "}
                  ({delta > 0 ? "+" : ""}
                  {delta})
                </span>
              )}
            </>
          )}
        </span>
      </div>
      <div className="h-1.5 bg-white/70 rounded-md overflow-hidden">
        <div
          className={`h-full ${barClass} transition-all duration-500 ease-out`}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
    </div>
  );
}

function SubmitTestForm({
  domains,
  onSaved,
}: {
  domains: DomainInfo[];
  onSaved: () => void;
}) {
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [composite, setComposite] = useState("");
  const [rw, setRw] = useState("");
  const [math, setMath] = useState("");
  const [domainScores, setDomainScores] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const cleanDomainScores: Record<string, number> = {};
      for (const [domain, val] of Object.entries(domainScores)) {
        if (val.trim() !== "") cleanDomainScores[domain] = Number(val);
      }
      const res = await fetch("/api/practice-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          takenAt,
          compositeScore: Number(composite),
          rwScore: Number(rw),
          mathScore: Number(math),
          domainScores: cleanDomainScores,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save. Please try again.");
        return;
      }
      onSaved();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-[#ece9f7] rounded-xl p-6 mb-8">
      <div className="text-[15px] font-semibold text-ink mb-4">Log a practice test</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Test date</label>
          <input
            type="date"
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] text-sm focus:outline-none focus:border-[#6d7fd6]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Composite (400-1600)</label>
          <input
            type="number"
            min={400}
            max={1600}
            value={composite}
            onChange={(e) => setComposite(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] text-sm focus:outline-none focus:border-[#6d7fd6]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Reading & Writing (200-800)</label>
          <input
            type="number"
            min={200}
            max={800}
            value={rw}
            onChange={(e) => setRw(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] text-sm focus:outline-none focus:border-[#6d7fd6]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Math (200-800)</label>
          <input
            type="number"
            min={200}
            max={800}
            value={math}
            onChange={(e) => setMath(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-[#e0defa] text-sm focus:outline-none focus:border-[#6d7fd6]"
          />
        </div>
      </div>

      <div className="text-sm text-gray-700 mb-2">
        Domain subscores <span className="text-gray-400">(optional, 0-100 estimated % correct)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {domains.map((d) => (
          <div key={d.domain} className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex-1">{d.domain}</label>
            <input
              type="number"
              min={0}
              max={100}
              value={domainScores[d.domain] ?? ""}
              onChange={(e) =>
                setDomainScores((prev) => ({ ...prev, [d.domain]: e.target.value }))
              }
              className="w-20 px-2.5 py-1.5 rounded-lg border border-[#e0defa] text-sm focus:outline-none focus:border-[#6d7fd6]"
            />
          </div>
        ))}
      </div>

      {error && <div className="text-red-700 text-sm mb-3">{error}</div>}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2.5 rounded-lg bg-ink text-white font-semibold text-sm disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save results"}
      </button>
    </form>
  );
}
