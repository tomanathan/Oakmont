"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ChecklistItem {
  id: string;
  title: string;
  body: string;
  href: string;
  done: boolean;
}

// The dashboard's "Getting started" list: the features a new student
// should try once, each checked off from real activity. Hidden when
// everything's done or the student dismisses it.
export function GettingStarted({ items }: { items: ChecklistItem[] }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const done = items.filter((i) => i.done).length;
  if (hidden || done === items.length) return null;
  const nextUp = items.find((i) => !i.done);

  async function dismiss() {
    setHidden(true);
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissChecklist: true }),
    }).catch(() => {});
    router.refresh();
  }

  return (
    <section className="mb-4 rounded-2xl border border-[#e2d7c1] bg-white p-5 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_6px_20px_rgba(38,34,24,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[18px] font-semibold text-ink">Getting started</h2>
          <p className="text-[13px] text-stone-500">
            {done} of {items.length} done. A quick way to try everything Oakmont does.
          </p>
        </div>
        <button onClick={dismiss} className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-600">
          Hide this
        </button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e6dcc8]">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`flex h-full items-start gap-3 rounded-xl px-3.5 py-3 ring-1 transition-colors ${
                item.done
                  ? "bg-[#f7faf8] ring-[#e3efe8]"
                  : item === nextUp
                  ? "bg-[#f6f1e6] ring-[#c9d8c2] hover:ring-[#b7cbb0]"
                  : "bg-white ring-[#e2d7c1] hover:ring-[#c9d8c2]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  item.done ? "bg-accent text-white" : "ring-1 ring-[#c9d8c2]"
                }`}
                aria-hidden
              >
                {item.done ? "✓" : ""}
              </span>
              <span className="min-w-0">
                <span className={`block text-[14px] font-semibold ${item.done ? "text-stone-500 line-through decoration-gray-300" : "text-ink"}`}>
                  {item.title}
                </span>
                {!item.done && <span className="mt-0.5 block text-[12.5px] leading-snug text-stone-500">{item.body}</span>}
              </span>
              <span className="sr-only">{item.done ? "(done)" : "(not done yet)"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
