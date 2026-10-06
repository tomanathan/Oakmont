"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FEEDBACK_KINDS, FEEDBACK_MAX, type FeedbackKind } from "@/lib/feedback";
import { PixelDog } from "./PixelDog";

// The way to tell us anything about the app, on every signed-in page
// (students' via AppShell, parents' via ParentShell): a
// sticky-note tab on the right edge of the screen that opens a short form.
// Also opens on a window "oakmont:feedback" event (the account menu's
// "Give feedback" uses it), so there's one form however it's reached.

export function FeedbackTab({ audience = "student" }: { audience?: "student" | "parent" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("oakmont:feedback", onOpen);
    return () => window.removeEventListener("oakmont:feedback", onOpen);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    // A sent note clears the form; a half-written one is kept for next time.
    if (state === "sent") {
      setKind(null);
      setRating(null);
      setMessage("");
      setState("idle");
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3) {
      setError("Tell us a little more.");
      setState("error");
      box.current?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: kind ?? "other", rating, message, path: pathname, as: audience }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "That didn't send. Please try again.");
      }
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't send. Please try again.");
      setState("error");
    }
  }

  const prompt = FEEDBACK_KINDS.find((k) => k.id === kind)?.prompt ?? "Anything at all: what's working, what isn't, what you wish it did.";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="fixed right-0 top-[46%] z-30 flex origin-bottom-right -rotate-90 items-center gap-1.5 rounded-t-lg border-2 border-b-0 border-[#3461c1] bg-[#fbe7a3] px-3 py-1 text-[11.5px] font-bold sm:px-3.5 sm:py-1.5 sm:text-[13px] text-[#1f2f5a] shadow-[-2px_-2px_0_rgba(52,97,193,0.25)] transition-[padding] hover:pb-2.5"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" className="rotate-90">
          <path d="M2 2.5h12v8.5H7l-3.5 3V11H2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1f2f5a]/35 p-3 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            onClick={(e) => e.stopPropagation()}
            className="nbk-taped nbk-taped--butter w-full max-w-[460px] rounded-2xl border-2 border-[#3461c1] bg-white p-6 shadow-[6px_6px_0_#3461c1]"
          >
            {state === "sent" ? (
              <div className="py-4 text-center">
                <div className="mb-3 inline-block">
                  <PixelDog size={84} mood="happy" tailFrame={3} />
                </div>
                <h2 id="feedback-title" className="font-display text-xl font-semibold text-ink">
                  Got it. Thank you.
                </h2>
                <p className="mx-auto mt-1.5 max-w-[320px] text-sm leading-relaxed text-stone-600">A real person reads every one of these. If it needs a reply, we&apos;ll email you.</p>
                <button type="button" onClick={close} className="mt-5 rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                  {audience === "parent" ? "Back to the report" : "Back to studying"}
                </button>
              </div>
            ) : (
              <form onSubmit={send}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 id="feedback-title" className="font-display text-xl font-semibold text-ink">
                      Tell us what you think
                    </h2>
                    <p className="mt-0.5 text-[13px] text-stone-600">It goes straight to the people who build Oakmont.</p>
                  </div>
                  <button type="button" onClick={close} aria-label="Close" className="-mr-1 -mt-1 grid h-8 w-8 flex-none place-items-center rounded-full text-lg text-stone-500 hover:bg-[#e9effb] hover:text-ink">
                    ×
                  </button>
                </div>

                <fieldset className="mb-4">
                  <legend className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-500">What&apos;s it about?</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {FEEDBACK_KINDS.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        aria-pressed={kind === k.id}
                        onClick={() => setKind(kind === k.id ? null : k.id)}
                        className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${kind === k.id ? "border-[#3461c1] bg-forest text-white" : "border-[#b4c5e6] bg-white text-ink hover:bg-[#e9effb]"}`}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label htmlFor="feedback-message" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-500">
                  Your note
                </label>
                <textarea
                  id="feedback-message"
                  ref={box}
                  autoFocus
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value.slice(0, FEEDBACK_MAX));
                    if (state === "error") setState("idle");
                  }}
                  rows={4}
                  placeholder={prompt}
                  className="w-full resize-y rounded-lg border border-[#b4c5e6] bg-white px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none placeholder:text-stone-400 focus:border-[#3461c1]"
                />

                <fieldset className="mt-3">
                  <legend className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-500">
                    How&apos;s Oakmont overall? <span className="font-normal normal-case tracking-normal">(optional)</span>
                  </legend>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={rating === n}
                        aria-label={`${n} out of 5`}
                        onClick={() => setRating(rating === n ? null : n)}
                        className={`h-9 w-9 rounded-lg border text-[14px] font-bold transition-colors ${rating === n ? "border-[#3461c1] bg-forest text-white" : "border-[#b4c5e6] bg-white text-ink hover:bg-[#e9effb]"}`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="ml-1 self-center text-[12px] text-stone-500">1 = rough, 5 = great</span>
                  </div>
                </fieldset>

                {state === "error" && (
                  <p role="alert" className="mt-3 text-[13px] font-medium text-[#b23b2e]">
                    {error}
                  </p>
                )}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-[12px] leading-snug text-stone-500">We&apos;ll see which page you were on.</span>
                  <button type="submit" disabled={state === "sending"} className="flex-none whitespace-nowrap rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                    {state === "sending" ? "Sending…" : "Send feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
