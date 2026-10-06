"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ParentRow } from "./data";
import { ago, fmtDate } from "./format";

// Every parent account: whether they finished setting it up, which students
// they're connected to, and whether the weekly report is reaching them.

export function ParentsTable({ parents, now }: { parents: ParentRow[]; now: Date }) {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"all" | "setup" | "notsetup" | "nokids" | "reportoff">("all");
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return parents.filter((p) => {
      if (needle && !`${p.email} ${p.kids.map((k) => `${k.name ?? ""} ${k.email} ${k.nickname ?? ""}`).join(" ")}`.toLowerCase().includes(needle)) return false;
      if (only === "setup") return p.setUp !== "Not set up";
      if (only === "notsetup") return p.setUp === "Not set up";
      if (only === "nokids") return p.kids.length === 0;
      if (only === "reportoff") return !p.weeklyReport;
      return true;
    });
  }, [parents, q, only]);

  return (
    <section className="rounded-xl border border-[#c9d6ee] bg-white">
      <div className="flex flex-wrap items-center gap-3 px-5 pb-3 pt-5">
        <h2 className="mr-auto text-[15px] font-semibold">
          Parents <span className="font-normal text-stone-500">· {rows.length} of {parents.length}</span>
        </h2>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search parent or student"
          aria-label="Search parents"
          className="h-9 w-[240px] rounded-lg border border-[#bfcde9] bg-white px-3 text-[13px] outline-none focus:border-forest"
        />
        <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)} aria-label="Filter parents" className="h-9 rounded-lg border border-[#bfcde9] bg-white px-2 text-[13px] outline-none focus:border-forest">
          <option value="all">Everyone</option>
          <option value="setup">Account set up</option>
          <option value="notsetup">Not set up yet</option>
          <option value="nokids">No student connected</option>
          <option value="reportoff">Weekly report off</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-[#e1e9f7] bg-[#f3f6fc] text-[11px] uppercase tracking-[0.06em] text-stone-500">
              <th className="px-5 py-2 font-semibold">Parent</th>
              <th className="px-3 py-2 font-semibold">Added</th>
              <th className="px-3 py-2 font-semibold">Account</th>
              <th className="px-3 py-2 font-semibold">Students</th>
              <th className="px-3 py-2 font-semibold">Weekly report</th>
              <th className="px-3 py-2 font-semibold">Last report sent</th>
              <th className="px-3 py-2 font-semibold">Time zone</th>
              <th className="px-5 py-2 text-right font-semibold">Open invites</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-[#e8eef9] align-top last:border-0">
                <td className="px-5 py-2.5 font-medium">{p.email}</td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-stone-600">{fmtDate(p.createdAt)}</td>
                <td className="px-3 py-2.5">
                  {p.setUp === "Not set up" ? (
                    <>
                      <span className="text-[#8a5d0f]">Not set up</span>
                      <div className="text-[11px] text-stone-500">{p.setupEmailSentAt ? `setup email ${ago(p.setupEmailSentAt, now).toLowerCase()}` : "no setup email sent"}</div>
                    </>
                  ) : (
                    <span className="text-stone-600">{p.setUp === "Both" ? "Google + password" : p.setUp}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {p.kids.length === 0 ? (
                    <span className="text-stone-400">None</span>
                  ) : (
                    p.kids.map((k) => (
                      <div key={k.id} className="whitespace-nowrap">
                        <Link href={`/admin/student/${k.id}`} className="font-medium text-forest underline-offset-2 hover:underline">
                          {k.nickname || k.name || k.email}
                        </Link>
                        <span className="text-[12px] text-stone-500"> · {k.email} · linked {fmtDate(k.linkedAt)}</span>
                      </div>
                    ))
                  )}
                </td>
                <td className="px-3 py-2.5 text-stone-600">{p.weeklyReport ? "On" : <span className="text-[#8a5d0f]">Off</span>}</td>
                <td className="px-3 py-2.5 text-stone-600">{ago(p.lastReportSentAt, now)}</td>
                <td className="px-3 py-2.5 text-stone-600">{p.timeZone ?? "—"}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{p.openInvites || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-stone-500">
                  No parents match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
