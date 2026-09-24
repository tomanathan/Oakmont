import { sampleParentReport } from "@/lib/parentDemo";
import { parentWeeklyEmail } from "@/lib/parentReportEmail";
import { ParentReportView } from "@/components/parent/ParentReportView";
import { TrackedLink } from "./TrackedLink";

// The parent pitch: the real parent report (the same component parents
// get), filled with an invented sample student and clearly labeled as a
// sample, scrollable in place, plus the Sunday email it sends.

const WHAT_YOU_KNOW = [
  {
    title: "A clear verdict, every week",
    body: "On track, worth watching, or needs a push, with the numbers behind it: study days, minutes, questions and accuracy against last week.",
  },
  {
    title: "Every study session",
    body: "When they studied, for how long, which lessons they read and which quizzes they took, with the score for each.",
  },
  {
    title: "All 29 skills, one by one",
    body: "Not started, in progress, passed or truly mastered, with accuracy and when each was last practiced.",
  },
  {
    title: "What's actually sticking",
    body: "Mastery counts only when a skill is answered right again later, mixed in with others. Cramming can't fake it.",
  },
  {
    title: "Habits you'd never see",
    body: "Whether they're guessing, whether they're confidently wrong, and whether they rush compared with the real SAT's pace.",
  },
  {
    title: "The mistakes that repeat",
    body: "Every wrong answer is linked to the trap behind it, so you see the exact misunderstanding that keeps costing points.",
  },
  {
    title: "Scores against the goal",
    body: "Practice test scores plotted against their starting point and target, and whether the study plan is on pace for test day.",
  },
  {
    title: "What to say",
    body: "Specific, data-based suggestions each week: what to celebrate, what to ask about, and when a nudge would help.",
  },
];

const STEPS = [
  { n: "1", title: "Create a free parent account", body: "Takes a minute. No payment, no student details needed." },
  { n: "2", title: "Send your student a link", body: "Or enter the code from their Settings if they already use Oakmont." },
  { n: "3", title: "They approve, you follow along", body: "Your report fills in as they study, and a summary arrives every Sunday." },
];

export function ParentsSection() {
  const now = new Date();
  const report = sampleParentReport(now);
  const email = parentWeeklyEmail([{ id: "sample", report }]);

  return (
    <section id="parents" className="scroll-mt-16 overflow-hidden bg-ink px-4 py-20 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-10 max-w-[760px] text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#b7bdea]">For parents</div>
          <h2 className="text-balance font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.01em] sm:text-[46px]">
            Know exactly how SAT prep is going, without having to ask.
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[16px] leading-relaxed text-white/70">
            Your own dashboard shows every study session, every skill and every score, updated each time your student practices. Here is
            the real thing, filled in with a sample student. Scroll inside it.
          </p>
        </div>

        {/* The report itself, in a browser frame. */}
        <div className="overflow-hidden rounded-2xl bg-white text-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          <div className="flex items-center gap-3 border-b border-[#ece9f7] bg-[#f7f6fb] px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#e5e3ee]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e5e3ee]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e5e3ee]" />
            </div>
            <div className="flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-[12px] text-gray-500 ring-1 ring-[#ece9f7]">
              oakmontsat.com/parent/dashboard
            </div>
            <span className="whitespace-nowrap rounded-full bg-[#fbf1df] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#9a6a12]">
              Sample data
            </span>
          </div>
          <div className="max-h-[720px] overflow-y-auto overscroll-contain bg-[#fbfaff] px-4 py-6 sm:px-8" tabIndex={0} aria-label="Sample parent report">
            <ParentReportView
              report={report}
              frozen
              footer={
                <p className="text-center text-[12px] text-gray-400">
                  Sample report. &ldquo;Maya&rdquo; is invented, and her numbers are generated to show what a real report looks like.
                </p>
              }
            />
          </div>
        </div>

        {/* What you'll know + the Sunday email. */}
        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <h3 className="font-display text-[26px] font-semibold leading-snug sm:text-[30px]">What you&apos;ll know</h3>
            <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {WHAT_YOU_KNOW.map((f) => (
                <div key={f.title}>
                  <div className="flex items-center gap-2 text-[15px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9cc8ae]" aria-hidden />
                    {f.title}
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-white/65">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-[26px] font-semibold leading-snug sm:text-[30px]">Every Sunday, in your inbox</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/65">The week&apos;s summary, what changed, and what to say. This is the email the sample above would send:</p>
            <div className="mt-5 overflow-hidden rounded-2xl bg-[#faf8f4] ring-1 ring-white/10">
              <div className="border-b border-[#ece9f7] bg-white px-4 py-2.5 text-[12px] text-gray-500">
                <span className="font-semibold text-ink">Oakmont</span> &middot; {email.subject}
              </div>
              <iframe title="Sample weekly email" srcDoc={email.html} className="block h-[560px] w-full border-0" loading="lazy" />
            </div>
          </div>
        </div>

        {/* How connecting works. */}
        <div className="mt-16 rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <h3 className="font-display text-[26px] font-semibold leading-snug sm:text-[30px]">Set up in two minutes</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/65">
                Parent accounts are free and separate from your student&apos;s. Your student approves the connection and can see it&apos;s
                on in their Settings. You can&apos;t change anything or answer for them, and they can remove access at any time.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <TrackedLink
                  href="/parent/login?mode=signup"
                  event="parent_signup_started"
                  className="rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                >
                  Create a parent account
                </TrackedLink>
                <a href="/parent/login" className="rounded-xl px-6 py-3.5 text-center text-sm font-semibold text-white/80 ring-1 ring-white/20 transition-colors hover:text-white">
                  Parent log in
                </a>
              </div>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-2xl bg-white/[0.06] p-5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] font-bold text-ink">{s.n}</div>
                  <div className="mt-3 text-[15px] font-semibold leading-snug">{s.title}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
