"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import type { SceneColor } from "@/lib/lessonVideos/types";
import { noteOp, planMorph, tokenize, type MorphPlan, type Tok } from "./eq";
import { COLOR } from "./colors";
import { useBox } from "./useBox";

// The work, written as one derivation where each line grows out of the one
// above: the move is written under both sides in pink, then every token
// that survives glides down to its new place, terms that cancel are struck
// out, and terms that combine fly together into what they make. Equals
// signs line up down the page. Everything is a function of t.

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const ROW_GAP = 10;
const OP_GAP = 26; // room for the move written under a line
const MORPH = 0.95; // seconds tokens spend travelling
const CUE = 26; // room under the work for the current move's note

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Layout {
  rows: { toks: Box[]; w: number; h: number; x: number; y: number }[];
  ops: ({ toks: Box[]; w: number; h: number } | null)[];
  width: number;
  height: number;
}

export interface WorkRow {
  line: string;
  note?: string;
  at: number;
}

function tex(latex: string) {
  return katex.renderToString(latex, { throwOnError: false, output: "html" });
}

export function EqMorph({ rows, t, ansAt, tint }: { rows: WorkRow[]; t: number; ansAt: number; tint: Record<string, SceneColor> }) {
  const toks = useMemo(() => rows.map((r) => tokenize(r.line)), [rows]);
  const ops = useMemo(() => rows.map((r, i) => (i > 0 ? noteOp(r.note) : null)), [rows]);
  const plans = useMemo(() => rows.map((_, i) => (i > 0 ? planMorph(toks[i - 1], toks[i], ops[i]) : null)), [rows, toks, ops]);
  const html = useMemo(() => {
    const cache = new Map<string, string>();
    const get = (l: string) => cache.get(l) ?? (cache.set(l, tex(l)), cache.get(l)!);
    return { row: toks.map((r) => r.map((k) => get(k.latex))), op: ops.map((o) => o?.map((k) => get(k.latex)) ?? null) };
  }, [toks, ops]);

  // Measure every line once (fonts loaded), then lay them out: rows stacked
  // with room for the move under a line, equals signs in one column.
  const measureRef = useRef<HTMLDivElement>(null);
  const [lay, setLay] = useState<Layout | null>(null);
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const read = () => {
      const rowEls = Array.from(root.querySelectorAll<HTMLElement>("[data-row]"));
      const opEls = Array.from(root.querySelectorAll<HTMLElement>("[data-op]"));
      const boxes = (el: HTMLElement) => Array.from(el.children).map((c) => {
        const e = c as HTMLElement;
        return { x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight };
      });
      const measured = rowEls.map((el) => ({ toks: boxes(el), w: el.offsetWidth, h: el.offsetHeight }));
      const relX = measured.map((m, i) => {
        const k = toks[i].findIndex((tk) => tk.kind === "rel");
        return k >= 0 ? m.toks[k].x + m.toks[k].w / 2 : null;
      });
      const anchor = Math.max(0, ...relX.map((x) => x ?? 0));
      let y = 0;
      const placed = measured.map((m, i) => {
        if (i > 0) y += ROW_GAP + (ops[i] ? OP_GAP : 0);
        const row = { ...m, x: relX[i] === null ? 0 : anchor - relX[i]!, y };
        y += m.h;
        return row;
      });
      const opBoxes = ops.map((o, i) => {
        if (!o) return null;
        const el = opEls.find((e) => e.dataset.op === String(i))!;
        return { toks: boxes(el), w: el.offsetWidth, h: el.offsetHeight };
      });
      setLay({ rows: placed, ops: opBoxes, width: Math.max(1, ...placed.map((r) => r.x + r.w)), height: y });
    };
    read();
    // KaTeX's fonts may still be arriving: measure again once they're in.
    let live = true;
    void document.fonts?.ready.then(() => live && read());
    return () => {
      live = false;
    };
  }, [toks, ops]);

  const boxRef = useRef<HTMLDivElement>(null);
  const box = useBox(boxRef);

  const colorOf = (k: Tok): string | undefined => {
    if (k.kind === "rel" || k.kind === "op" || k.kind === "open" || k.kind === "close" || k.kind === "punct") return undefined;
    const exact = tint[k.text];
    if (exact) return COLOR[exact];
    if (k.kind === "term") for (const [name, c] of Object.entries(tint)) if (/^[a-zA-Z]$/.test(name) && k.text.includes(name)) return COLOR[c];
    return undefined;
  };

  // What's drawn: each shown row's tokens, the moves, and the tokens in
  // flight between rows.
  const items: JSX.Element[] = [];
  const last = rows.length - 1;
  const answered = t >= ansAt;
  if (lay) {
    const shown = rows.filter((r) => t >= r.at).length;
    const newest = shown - 1;
    rows.forEach((r, i) => {
      if (t < r.at) return;
      const row = lay.rows[i];
      const plan = plans[i];
      const op = ops[i];
      const prev = i > 0 ? lay.rows[i - 1] : null;
      const opBox = lay.ops[i];
      const m0 = r.at + (op ? 0.7 : 0.12);
      const m1 = m0 + MORPH;
      // Rows step back once a newer one is written.
      const next = rows[i + 1];
      const fade = next && t >= next.at ? 0.4 + 0.6 * (1 - prog(t, next.at + (ops[i + 1] ? 0.7 : 0.12), next.at + 1.4)) : 1;
      const isNewest = i === newest && !answered;

      // The move, written under each side of the line above.
      if (op && opBox && prev) {
        const relK = toks[i - 1].findIndex((k) => k.kind === "rel");
        const sides: [number, number][] = relK >= 0
          ? [
              [prev.x, prev.x + prev.toks[relK].x],
              [prev.x + prev.toks[relK].x + prev.toks[relK].w, prev.x + prev.w],
            ]
          : [[prev.x, prev.x + prev.w]];
        const opIn = ease(prog(t, r.at, r.at + 0.4));
        sides.forEach(([a, b], side) => {
          const ox = (a + b) / 2 - opBox.w / 2;
          const oy = prev.y + prev.h + 2;
          op.forEach((k, j) => {
            const b0 = opBox.toks[j];
            const cancelled = plan?.opCancel.some(([s, q]) => s === side && q === j);
            const fed = plan?.into.some((x) => x.how === "from" && x.ops.some(([s, q]) => s === side && q === j));
            const leave = fed ? prog(t, m0, m0 + 0.25) : 0;
            items.push(
              <span
                key={`op${i}-${side}-${j}`}
                className={`lv-tok lv-tok--move ${cancelled ? "is-cancel" : ""}`}
                style={{
                  transform: `translate(${ox + b0.x}px, ${oy + b0.y + (1 - opIn) * 8}px)`,
                  opacity: opIn * (1 - leave * 0.7) * (next && t >= next.at ? 0.5 : 1),
                  ["--strike" as string]: cancelled ? prog(t, m0 - 0.35, m0) : 0,
                }}
                dangerouslySetInnerHTML={{ __html: html.op[i]![j] }}
              />,
            );
          });
        });
      }

      toks[i].forEach((k, j) => {
        const b = row.toks[j];
        const x = row.x + b.x;
        const y = row.y + b.y;
        const how = plan?.into[j];
        let opacity = 1;
        let tx = x;
        let ty = y;
        let scale = 1;
        if (!plan) {
          // The first line is written in, left to right.
          const w = prog(t, r.at + j * 0.05, r.at + j * 0.05 + 0.3);
          opacity = w;
          ty = y + (1 - w) * 8;
        } else if (how?.how === "stay") {
          const a = prev!.toks[how.a];
          const p = ease(prog(t, m0, m1));
          if (t < m0) opacity = 0;
          tx = lerp(prev!.x + a.x, x, p);
          ty = lerp(prev!.y + a.y, y, p);
        } else {
          // Built here (from parts, or from nothing): grows in as the
          // parts arrive.
          const p = prog(t, m0 + MORPH * 0.5, m1);
          opacity = p;
          scale = 0.6 + 0.4 * ease(p) + Math.sin(p * Math.PI) * 0.18;
        }
        const fresh = !!plan && how?.how !== "stay";
        const c = colorOf(k) ?? (fresh && isNewest && k.kind !== "rel" ? COLOR.yellow : undefined);
        items.push(
          <span
            key={`r${i}-${j}`}
            className={`lv-tok lv-tok--${k.kind}`}
            style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, opacity: opacity * fade, color: c }}
            dangerouslySetInnerHTML={{ __html: html.row[i][j] }}
          />,
        );
      });

      // Tokens in flight: old ones flying into what they make, and old ones
      // that cancel getting struck out on the line above.
      if (plan && prev && t < m1 + 0.05) {
        plan.into.forEach((how, j) => {
          if (how.how !== "from") return;
          const dest = row.toks[j];
          const dx = row.x + dest.x + dest.w / 2;
          const dy = row.y + dest.y + dest.h / 2;
          const p = ease(prog(t, m0, m1));
          if (t < m0) return;
          const fly = (key: string, sx: number, sy: number, w: number, h: number, inner: string, cls: string) =>
            items.push(
              <span
                key={key}
                className={`lv-tok ${cls}`}
                style={{
                  transform: `translate(${lerp(sx, dx - w / 2, p)}px, ${lerp(sy, dy - h / 2, p)}px) scale(${1 - 0.3 * p})`,
                  opacity: 1 - prog(p, 0.55, 1),
                }}
                dangerouslySetInnerHTML={{ __html: inner }}
              />,
            );
          how.a.forEach((k) => {
            const s = prev.toks[k];
            fly(`f${i}-${j}-${k}`, prev.x + s.x, prev.y + s.y, s.w, s.h, html.row[i - 1][k], "lv-tok--ghost");
          });
          if (op && lay.ops[i]) {
            const relK = toks[i - 1].findIndex((tk) => tk.kind === "rel");
            how.ops.forEach(([side, q]) => {
              const ob = lay.ops[i]!;
              const [a, b] = relK >= 0 ? (side === 0 ? [prev.x, prev.x + prev.toks[relK].x] : [prev.x + prev.toks[relK].x + prev.toks[relK].w, prev.x + prev.w]) : [prev.x, prev.x + prev.w];
              const s = ob.toks[q];
              fly(`fo${i}-${j}-${side}-${q}`, (a + b) / 2 - ob.w / 2 + s.x, prev.y + prev.h + 2 + s.y, s.w, s.h, html.op[i]![q], "lv-tok--move");
            });
          }
        });
      }
      if (plan && prev && op && t >= r.at) {
        // Strike what cancels under a both-sides move, on the line above (it stays struck).
        plan.cancel.forEach((k) => {
          const s = prev.toks[k];
          if (toks[i - 1][k].kind === "open" || toks[i - 1][k].kind === "close" || toks[i - 1][k].kind === "op") return;
          const p = prog(t, m0 - 0.35, m0);
          if (p <= 0) return;
          items.push(<span key={`x${i}-${k}`} className="lv-eq-strike" style={{ left: prev.x + s.x - 2, top: prev.y + s.y + s.h * 0.52, width: (s.w + 4) * p, opacity: next && t >= next.at ? 0.5 : 1 }} />);
        });
      }

      // The answer, boxed.
      if (i === last && answered) {
        const p = prog(t, ansAt, ansAt + 0.5);
        items.push(
          <svg key="box" className="lv-eq-box" style={{ left: row.x - 8, top: row.y - 5, width: row.w + 16, height: row.h + 10 }} viewBox={`0 0 ${row.w + 16} ${row.h + 10}`}>
            <rect x={1.5} y={1.5} width={row.w + 13} height={row.h + 7} rx={7} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - p }} />
          </svg>,
        );
      }

    });
  }

  const noteRoom = 0;
  // A camera on the last three lines: it pans down as each line is written,
  // and pulls back to the whole derivation when the answer lands.
  let camY = 0;
  let winH = 0;
  let scale = 1;
  if (lay && box.w) {
    const top = (i: number) => lay.rows[Math.max(0, i - 2)].y;
    const win = Math.max(...lay.rows.map((r, i) => r.y + r.h - top(i)));
    rows.forEach((r, i) => {
      if (i === 0) camY = top(0);
      else if (t >= r.at) camY = lerp(top(i - 1), top(i), ease(prog(t, r.at, r.at + 0.8)));
    });
    const fitW = box.w / (lay.width + noteRoom + 24);
    const near = Math.min(1.3, fitW, (box.h - CUE) / (win + 24));
    const far = Math.min(1.3, fitW, box.h / (lay.height + 16));
    const z = ease(prog(t, ansAt + 0.6, ansAt + 1.6));
    camY = lerp(camY, 0, z);
    winH = lerp(win, lay.height, z);
    scale = lerp(near, far, z);
  }

  return (
    <div className="lv-eq" ref={boxRef}>
      <div className="lv-eq-measure" ref={measureRef} aria-hidden>
        {toks.map((r, i) => (
          <div key={i} data-row={i} className="lv-eq-row">
            {r.map((k, j) => (
              <span key={j} className={`lv-tok-m lv-tok--${k.kind} ${k.unary ? "is-u" : ""}`} dangerouslySetInnerHTML={{ __html: html.row[i][j] }} />
            ))}
          </div>
        ))}
        {ops.map((o, i) =>
          o ? (
            <div key={`o${i}`} data-op={i} className="lv-eq-row lv-eq-row--op">
              {o.map((k, j) => (
                <span key={j} className={`lv-tok-m lv-tok--${k.kind} ${k.unary ? "is-u" : ""}`} dangerouslySetInnerHTML={{ __html: html.op[i]![j] }} />
              ))}
            </div>
          ) : null,
        )}
      </div>
      {rows.map((r, i) => {
        if (!r.note || t < r.at) return null;
        const next = rows[i + 1];
        const o = prog(t, r.at + 0.2, r.at + 0.6) * (next ? 1 - prog(t, next.at, next.at + 0.3) : 1 - prog(t, ansAt, ansAt + 0.4));
        return o > 0 ? (
          <span key={`n${i}`} className="lv-eq-cue" style={{ opacity: o, transform: `translate(-50%, ${(1 - o) * 6}px)` }}>
            {r.note}
          </span>
        ) : null;
      })}
      {lay && (
        <div
          className="lv-eq-stage"
          style={{
            width: lay.width + noteRoom,
            height: lay.height,
            transform: `translate(${-((lay.width + noteRoom) * scale) / 2}px, ${(box.h - CUE - winH * scale) / 2 - camY * scale}px) scale(${scale})`,
          }}
        >
          {items}
        </div>
      )}
    </div>
  );
}

export type { MorphPlan };
