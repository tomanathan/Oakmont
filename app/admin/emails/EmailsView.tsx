"use client";

import { useMemo, useState } from "react";
import { sampleEmails } from "@/lib/encourage/samples";

// Display for /admin/emails (kept apart from the page that checks access
// and counts recipients, so it can be previewed with made-up numbers).

export function EmailsView({
  on,
  counts,
  rules,
}: {
  on: boolean;
  counts: { morning: { students: number; parents: number }; nudge: { students: number; parents: number } };
  rules: { dailyUntil: number; stopAfter: number; nudgeWithin: number };
}) {
  const samples = useMemo(() => sampleEmails(), []);
  const [active, setActive] = useState(samples[0].id);
  const [sending, setSending] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [sentTo, setSentTo] = useState("");
  const current = samples.find((s) => s.id === active)!;

  async function sendSamples() {
    setSending("busy");
    try {
      const res = await fetch("/api/admin/email-test", { method: "POST" });
      const data = (await res.json()) as { sent?: number; to?: string };
      if (!res.ok || !data.sent) throw new Error();
      setSentTo(`${data.sent} sample emails sent to ${data.to}.`);
      setSending("done");
    } catch {
      setSending("failed");
    }
  }

  return (
    <>
      <header className="mb-6 mt-3 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="font-display text-[26px] font-semibold leading-tight">Daily emails</h1>
          <p className="text-[13px] text-stone-500">One or two short emails a day to students and to parents, encouraging a session.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ring-1 ${on ? "bg-[#eaf6ef] text-[#2f6f4f] ring-[#cde8d9]" : "bg-[#fbf1df] text-[#8a5d0f] ring-[#f0ddb8]"}`}>{on ? "On: sending daily" : "Off: nothing is being sent"}</span>
      </header>

      <section className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#c9d6ee] bg-white p-5">
          <h2 className="text-[15px] font-semibold">Morning, 8am Central</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-600">Students get today&apos;s piece of their plan. Parents get what their student did in the last day, what&apos;s next, and one way to help.</p>
          <p className="mt-3 text-[13px] tabular-nums">
            If sent right now: <b>{counts.morning.students}</b> students, <b>{counts.morning.parents}</b> parents.
          </p>
        </div>
        <div className="rounded-xl border border-[#c9d6ee] bg-white p-5">
          <h2 className="text-[15px] font-semibold">Afternoon, 4pm Central</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-600">Only where the student hasn&apos;t studied yet that day. Skipped entirely for anyone who already has.</p>
          <p className="mt-3 text-[13px] tabular-nums">
            If sent right now: <b>{counts.nudge.students}</b> students, <b>{counts.nudge.parents}</b> parents.
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-[#c9d6ee] bg-white p-5 text-[13px] leading-relaxed text-stone-600">
        <h2 className="mb-2 text-[15px] font-semibold text-ink">Who gets them</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Students with access (free trial or paying). Parents who have set up their account and are connected to one of those students.</li>
          <li>Every day while the student has studied in the last {rules.dailyUntil} days. Mondays and Thursdays only after that. Nothing after {rules.stopAfter} days without study.</li>
          <li>The afternoon reminder only goes to students who studied in the last {rules.nudgeWithin} days and haven&apos;t yet today.</li>
          <li>Every email has a one-click &quot;Turn these emails off&quot; link, and there&apos;s a switch in each person&apos;s settings.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#c9d6ee] bg-white">
        <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-5">
          <h2 className="mr-auto text-[15px] font-semibold">What they say</h2>
          <span className="text-[13px] text-stone-500" role="status">
            {sending === "done" ? sentTo : sending === "failed" ? "Couldn't send. Is email set up on this deployment?" : "Samples use a made-up student named Maya."}
          </span>
          <button type="button" onClick={sendSamples} disabled={sending === "busy"} className="h-9 rounded-lg bg-forest px-3 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {sending === "busy" ? "Sending…" : "Send these samples to me"}
          </button>
        </div>
        <div className="grid border-t border-[#e1e9f7] md:grid-cols-[280px_1fr]">
          <ul className="border-b border-[#e1e9f7] md:border-b-0 md:border-r">
            {samples.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => setActive(s.id)} aria-current={s.id === active} className={`block w-full border-b border-[#e8eef9] px-5 py-3 text-left text-[13px] last:border-0 ${s.id === active ? "bg-[#e9effb]" : "hover:bg-[#f8fafe]"}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500">
                    {s.to} · {s.when}
                  </div>
                  <div className="font-medium">{s.label}</div>
                </button>
              </li>
            ))}
          </ul>
          <div className="p-5">
            <div className="mb-3 text-[13px]">
              <span className="text-stone-500">Subject: </span>
              <span className="font-semibold">{current.email.subject}</span>
            </div>
            <iframe title={`${current.to} email: ${current.label}`} srcDoc={current.email.html} sandbox="" className="h-[620px] w-full rounded-lg border border-[#c9d6ee] bg-[#f3f6fc]" />
          </div>
        </div>
      </section>
    </>
  );
}
