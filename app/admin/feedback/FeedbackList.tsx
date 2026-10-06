"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FEEDBACK_KINDS, kindLabel } from "@/lib/feedback";
import { ago, fmtDateTime } from "../format";

// Display for /admin/feedback (apart from the page that loads it, so it
// can be previewed with made-up notes).

export interface FeedbackRow {
  id: string;
  kind: string;
  rating: number | null;
  message: string;
  path: string | null;
  userAgent: string | null;
  createdAt: Date;
  handled: boolean;
  user: { id: string; firstName: string | null; email: string } | null;
  parent: { email: string } | null;
}

const KIND_TONE: Record<string, string> = {
  bug: "bg-[#fdf1f1] text-[#b23b2e] ring-[#f0d0d0]",
  confusing: "bg-[#fbf1df] text-[#8a5d0f] ring-[#f0ddb8]",
  idea: "bg-[#e9effb] text-[#26427e] ring-[#c2d1ee]",
  praise: "bg-[#eaf6ef] text-[#2f6f4f] ring-[#cde8d9]",
  other: "bg-[#f1f5fc] text-stone-600 ring-[#d3ddf1]",
};

const device = (ua: string | null) => (!ua ? "" : /iPhone|Android.+Mobile/.test(ua) ? "Phone" : /iPad|Android/.test(ua) ? "Tablet" : "Computer");

export function FeedbackList({ items, now }: { items: FeedbackRow[]; now: Date }) {
  const [rows, setRows] = useState(items);
  const [kind, setKind] = useState("all");
  const [show, setShow] = useState<"open" | "all">("open");
  const open = rows.filter((r) => !r.handled).length;
  const rated = rows.filter((r) => r.rating !== null);
  const avg = rated.length ? (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1) : null;
  const shown = useMemo(() => rows.filter((r) => (kind === "all" || r.kind === kind) && (show === "all" || !r.handled)), [rows, kind, show]);

  async function setHandled(id: string, handled: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, handled } : r)));
    const res = await fetch("/api/admin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, handled }) }).catch(() => null);
    if (!res || !res.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, handled: !handled } : r)));
  }

  return (
    <>
      <header className="mb-5 mt-3 flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="font-display text-[26px] font-semibold leading-tight">Feedback</h1>
          <p className="text-[13px] text-stone-500">
            {rows.length} note{rows.length === 1 ? "" : "s"} from students and parents · {open} not handled yet{avg ? ` · average rating ${avg}/5 (${rated.length} rated)` : ""}
          </p>
        </div>
        <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by kind" className="h-9 rounded-lg border border-[#b4c5e6] bg-white px-2 text-[13px]">
          <option value="all">Every kind</option>
          {FEEDBACK_KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        <select value={show} onChange={(e) => setShow(e.target.value as "open" | "all")} aria-label="Show" className="h-9 rounded-lg border border-[#b4c5e6] bg-white px-2 text-[13px]">
          <option value="open">Not handled yet</option>
          <option value="all">Everything</option>
        </select>
      </header>

      <ul className="space-y-3">
        {shown.map((r) => (
          <li key={r.id} className={`rounded-xl border border-[#c9d6ee] bg-white p-4 ${r.handled ? "opacity-60" : ""}`}>
            <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px]">
              <span className={`rounded-full px-2 py-0.5 font-semibold ring-1 ${KIND_TONE[r.kind] ?? KIND_TONE.other}`}>{kindLabel(r.kind)}</span>
              {r.rating !== null && <span className="font-semibold tabular-nums">{r.rating}/5</span>}
              {r.user ? (
                <Link href={`/admin/student/${r.user.id}`} className="font-semibold text-forest underline-offset-2 hover:underline">
                  {r.user.firstName || r.user.email}
                </Link>
              ) : r.parent ? (
                <span className="rounded-full bg-[#f1f5fc] px-2 py-0.5 font-semibold text-stone-600 ring-1 ring-[#d3ddf1]">Parent</span>
              ) : (
                <span className="text-stone-500">Deleted account</span>
              )}
              {(r.user ?? r.parent) && (
                <a href={`mailto:${(r.user ?? r.parent)!.email}?subject=${encodeURIComponent("Your Oakmont feedback")}`} className="text-stone-500 underline-offset-2 hover:underline">
                  {(r.user ?? r.parent)!.email}
                </a>
              )}
              <span className="ml-auto text-stone-500" title={fmtDateTime(r.createdAt)}>
                {ago(r.createdAt, now)} · {fmtDateTime(r.createdAt)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{r.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-stone-500">
              {r.path && <span>On {r.path}</span>}
              {device(r.userAgent) && <span>{device(r.userAgent)}</span>}
              <button type="button" onClick={() => setHandled(r.id, !r.handled)} className="ml-auto rounded-lg border border-[#b4c5e6] px-3 py-1 text-[12.5px] font-semibold text-ink hover:bg-[#e9effb]">
                {r.handled ? "Mark as not handled" : "Mark handled"}
              </button>
            </div>
          </li>
        ))}
        {shown.length === 0 && <li className="rounded-xl border border-[#c9d6ee] bg-white p-8 text-center text-[13px] text-stone-500">{rows.length === 0 ? "No feedback yet. It shows up here as soon as a student or parent sends some." : "Nothing matches."}</li>}
      </ul>
    </>
  );
}
