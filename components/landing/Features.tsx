import { PixelDog } from "@/components/PixelDog";
import { SubskillMap } from "./SubskillMap";

const card = "rounded-2xl border border-[#ece9f7] bg-white p-6 sm:p-7";
const eyebrow = "mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]";
const title = "mb-2 font-display text-[21px] font-semibold leading-snug";
const body = "text-[14px] leading-relaxed text-gray-600";

export function Features({ subskillCount }: { subskillCount: number }) {
  return (
    <section id="inside" className="scroll-mt-16 bg-[#faf8f4] px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-12 max-w-[620px]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">What&apos;s inside</div>
          <h2 className="text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            Everything the test covers, and a reason to show up every day.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Why the hero has dogs: they're the study companion. */}
          <div className={`${card} relative overflow-hidden lg:col-span-2`}>
            <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1.1fr_1fr]">
              <div>
                <div className={eyebrow}>Meet Ozho</div>
                <h3 className={title}>A study buddy who notices when you show up.</h3>
                <p className={body}>
                  Practice keeps Ozho happy and fed — skip too many days and he gets hungry. Streaks and mastered
                  sections unlock costumes for his wardrobe, and a 30-day streak brings home a second pup, Mochi.
                </p>
              </div>
              <div className="relative rounded-xl bg-[linear-gradient(180deg,#f5f4fc_0%,#faf8f4_100%)] px-4 pt-8 pb-4" aria-hidden="true">
                <div className="flex flex-wrap items-end justify-center gap-3">
                  <PixelDog size={92} mood="happy" costume="bowtie" tailFrame={2} />
                  <PixelDog size={80} variant="mochi" mood="happy" sitting facing={-1} />
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-center gap-2 border-t border-[#ece9f7] pt-3">
                  {["cap", "explorer-hat", "cape", "crown"].map((c) => (
                    <div key={c} className="rounded-lg bg-white px-1.5 pt-1 ring-1 ring-[#ece9f7]">
                      <PixelDog size={44} sitting costume={c} shadow={false} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center text-[11px] text-gray-400">Costumes earned by studying</div>
              </div>
            </div>
          </div>

          <div className={card}>
            <div className={eyebrow}>Explanations</div>
            <h3 className={title}>The pattern, not just the answer.</h3>
            <p className={`${body} mb-5`}>
              Every question names the move that solves its whole type, so practice compounds instead of repeating.
            </p>
            <div className="rounded-xl bg-[#faf8f4] p-4 text-[13px] leading-relaxed text-gray-700">
              <span className="font-semibold text-ink">The pattern: </span>
              a contrast between two sentences calls for a contrast transition — “However,” not “Similarly.”
            </div>
          </div>

          <div className={card}>
            <div className={eyebrow}>Practice tests</div>
            <h3 className={title}>8 full-length tests, on schedule.</h3>
            <p className={`${body} mb-5`}>
              Built into your timeline so you rehearse the real thing — then log your results and review them.
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 flex-1 rounded-md ${i < 3 ? "bg-ink" : "bg-[#ece9f7]"}`}
                  style={{ opacity: i < 3 ? 1 - i * 0.2 : 1 }}
                />
              ))}
            </div>
          </div>

          <div className={`${card} lg:col-span-2`}>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className={eyebrow}>Full coverage</div>
                <h3 className={title}>All {subskillCount} official subskills, mapped.</h3>
              </div>
              <p className="text-xs text-gray-400">Lessons, worked examples and a quiz for each — nothing skipped.</p>
            </div>
            <SubskillMap />
          </div>

          <div className={`${card} lg:col-span-3`}>
            <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3f2fc]" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a5bb0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-[18px] font-semibold">For parents: a clear view, no nagging.</h3>
                <p className={body}>
                  Once your student invites you from their Settings, you get a read-only view of their pace, subject
                  mastery and practice-test history — without logging into their account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
