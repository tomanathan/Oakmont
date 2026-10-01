"use client";

import { useId, useMemo, useRef } from "react";
import type { LessonVideoScript, SceneMove, SceneObj, ScenePt, SceneSet, SceneSpec } from "@/lib/lessonVideos/types";
import { compileExpr } from "./expr";
import { BOARD, COLOR } from "./colors";
import { useBox } from "./useBox";

// The animated figure. Every object is built on cue (lines draw
// themselves, angles sweep open, points drop in with a flash), the step
// being talked about is lit while the rest steps back, and pieces can
// slide, turn and re-shape to show why a step is true. A pure function of t.

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const outBack = (p: number) => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const DRAW: Record<SceneObj["kind"], number> = { axes: 0.8, numline: 0.8, point: 0.4, seg: 0.7, line: 0.8, fn: 1.4, poly: 1.0, circle: 1.0, angle: 0.6, text: 0.4 };
const PAD = 16;

export interface StepTime {
  at: number;
  until: number;
}

interface Cue {
  drawAt: Map<string, number>;
  hideAt: Map<string, number>;
  focus: { id: string; at: number; until: number }[];
  moves: { m: SceneMove; at: number }[];
  sets: { s: SceneSet; at: number }[];
}

/** When everything in the scene happens. */
export function sceneCues(script: LessonVideoScript, steps: StepTime[], qAt: number): Cue {
  const scene = script.scene!;
  const drawAt = new Map<string, number>();
  const hideAt = new Map<string, number>();
  const focus: Cue["focus"] = [];
  const moves: Cue["moves"] = [];
  const sets: Cue["sets"] = [];
  script.steps.forEach((s, i) => {
    const { at, until } = steps[i];
    (s.draw ?? []).forEach((id, k) => drawAt.set(id, at + k * 0.5));
    (s.hide ?? []).forEach((id) => hideAt.set(id, at));
    (s.focus ?? []).forEach((id) => focus.push({ id, at, until }));
    // A move waits for its object to finish drawing if it's new this step.
    (s.move ?? []).forEach((m, k) => {
      const o = scene.objects.find((x) => x.id === m.id);
      const built = (s.draw ?? []).includes(m.id) && o ? drawAt.get(m.id)! + DRAW[o.kind] + 0.2 : 0;
      moves.push({ m, at: Math.max(at + 0.2 + k * 0.15, built) });
    });
    (s.set ?? []).forEach((st) => sets.push({ s: st, at: at + 0.2 }));
  });
  // The givens are built while the question is read.
  let k = 0;
  for (const o of scene.objects) if (!drawAt.has(o.id)) drawAt.set(o.id, qAt + 0.5 + k++ * 0.4);
  return { drawAt, hideAt, focus, moves, sets };
}

type XY = [number, number];

export function Scene({ script, steps, qAt, t }: { script: LessonVideoScript; steps: StepTime[]; qAt: number; t: number }) {
  const scene = script.scene as SceneSpec;
  const cues = useMemo(() => sceneCues(script, steps, qAt), [script, steps, qAt]);
  const fns = useMemo(() => {
    const out = new Map<string, ReturnType<typeof compileExpr>>();
    for (const o of scene.objects) if (o.kind === "fn") out.set(o.id, compileExpr(o.y));
    return out;
  }, [scene]);
  const ref = useRef<HTMLDivElement>(null);
  const box = useBox(ref);
  const clipId = `lvclip${useId().replace(/:/g, "")}`;

  // Tweened state: the camera, functions' params, points' positions.
  let vx = scene.x;
  let vy = scene.y;
  const params = new Map<string, Record<string, number>>();
  const pos = new Map<string, XY>();
  for (const o of scene.objects) {
    if (o.kind === "fn") params.set(o.id, { ...(o.params ?? {}) });
    if (o.kind === "point") pos.set(o.id, resolveRaw(scene, o.at));
  }
  for (const { s, at } of cues.sets) {
    const p = ease(prog(t, at, at + 1.0));
    if (p <= 0) continue;
    if (s.id === "view") {
      if (s.x) vx = [lerp(vx[0], s.x[0], p), lerp(vx[1], s.x[1], p)];
      if (s.y) vy = [lerp(vy[0], s.y[0], p), lerp(vy[1], s.y[1], p)];
      continue;
    }
    if (s.params) {
      const cur = params.get(s.id) ?? {};
      for (const [k, v] of Object.entries(s.params)) cur[k] = lerp(cur[k] ?? v, v, p);
      params.set(s.id, cur);
    }
    if (s.at) {
      const cur = pos.get(s.id) ?? s.at;
      pos.set(s.id, [lerp(cur[0], s.at[0], p), lerp(cur[1], s.at[1], p)]);
    }
  }

  const W = Math.max(40, box.w);
  const H = Math.max(40, box.h);
  const graph = scene.objects.some((o) => o.kind === "axes" || o.kind === "numline");
  let sx = (W - 2 * PAD) / (vx[1] - vx[0]);
  let sy = (H - 2 * PAD) / (vy[1] - vy[0]);
  if (!graph) sx = sy = Math.min(sx, sy);
  const ox = (W - sx * (vx[1] - vx[0])) / 2;
  const oy = (H - sy * (vy[1] - vy[0])) / 2;
  const X = (x: number) => ox + (x - vx[0]) * sx;
  const Y = (y: number) => oy + (vy[1] - y) * sy;
  const P = (p: ScenePt): XY => {
    const [x, y] = typeof p === "string" ? pos.get(p) ?? resolveRaw(scene, p) : p;
    return [X(x), Y(y)];
  };

  const anyFocus = cues.focus.some((f) => t >= f.at && t < f.until);
  const focusOf = (id: string) => Math.max(0, ...cues.focus.filter((f) => f.id === id).map((f) => prog(t, f.at, f.at + 0.3) * (1 - prog(t, f.until - 0.3, f.until))));

  const els = scene.objects.map((o) => {
    const drawAt = cues.drawAt.get(o.id)!;
    if (t < drawAt) return null;
    const d = prog(t, drawAt, drawAt + DRAW[o.kind]);
    const hideAt = cues.hideAt.get(o.id);
    const gone = hideAt !== undefined ? prog(t, hideAt, hideAt + 0.4) : 0;
    if (gone >= 1) return null;
    const f = focusOf(o.id);
    const dim = anyFocus ? lerp(0.32, 1, f) : 1;
    const color = COLOR[o.color ?? (o.kind === "axes" || o.kind === "numline" ? "gray" : "white")];
    const sw = (o.kind === "seg" && o.width ? o.width : 2.4) * (1 + 0.6 * f);
    const glow = f > 0 ? `drop-shadow(0 0 ${5 * f}px ${color})` : undefined;
    const reveal = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - ease(d) } as const;

    // Moves: slide/turn about the object's anchor (in screen space).
    let tf = "";
    let anchor = anchorOf(o, P);
    for (const { m, at } of cues.moves) {
      if (m.id !== o.id) continue;
      const p = ease(prog(t, at, at + 1.1));
      if (p <= 0) continue;
      const piv = m.about ? P(m.about) : anchor;
      const dx = (m.by?.[0] ?? 0) * sx * p;
      const dy = -(m.by?.[1] ?? 0) * sy * p;
      tf = `translate(${dx} ${dy}) rotate(${-(m.turn ?? 0) * p} ${piv[0]} ${piv[1]}) ${tf}`;
      anchor = [anchor[0] + dx, anchor[1] + dy];
    }

    let body: JSX.Element | null = null;
    let label: { at: XY; anchor?: "start" | "middle" | "end" } | null = null;
    switch (o.kind) {
      case "axes": {
        const x0 = clamp(0, vx[0], vx[1]);
        const y0 = clamp(0, vy[0], vy[1]);
        const xs = o.xStep ? ticks(vx, o.xStep) : [];
        const ys = o.yStep ? ticks(vy, o.yStep) : [];
        const fadeIn = prog(d, 0.4, 1);
        body = (
          <g>
            {o.grid !== false && (
              <g opacity={0.16 * fadeIn} stroke={COLOR.blue} strokeWidth={1}>
                {xs.map((v) => <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={Y(vy[0])} y2={Y(vy[1])} />)}
                {ys.map((v) => <line key={`gy${v}`} y1={Y(v)} y2={Y(v)} x1={X(vx[0])} x2={X(vx[1])} />)}
              </g>
            )}
            <line x1={X(vx[0])} x2={X(vx[1])} y1={Y(y0)} y2={Y(y0)} stroke={color} strokeWidth={1.6} {...reveal} />
            <line y1={Y(vy[0])} y2={Y(vy[1])} x1={X(x0)} x2={X(x0)} stroke={color} strokeWidth={1.6} {...reveal} />
            {o.numbers !== false && (
              <g className="lv-sc-num" opacity={fadeIn}>
                {xs.filter((v) => v !== x0).map((v) => <text key={`nx${v}`} x={X(v)} y={Y(y0) + 13} textAnchor="middle">{fmt(v)}</text>)}
                {ys.filter((v) => v !== y0).map((v) => <text key={`ny${v}`} x={X(x0) - 5} y={Y(v) + 3.5} textAnchor="end">{fmt(v)}</text>)}
              </g>
            )}
          </g>
        );
        break;
      }
      case "numline": {
        const y = Y(o.y ?? 0);
        const vs = ticks([o.min, o.max], o.step);
        const fadeIn = prog(d, 0.4, 1);
        body = (
          <g>
            <line x1={X(o.min) - 10} x2={X(o.max) + 10} y1={y} y2={y} stroke={color} strokeWidth={2} {...reveal} />
            <g opacity={fadeIn} stroke={color} strokeWidth={1.5}>
              {vs.map((v) => <line key={v} x1={X(v)} x2={X(v)} y1={y - 5} y2={y + 5} />)}
            </g>
            {o.numbers !== false && (
              <g className="lv-sc-num" opacity={fadeIn}>
                {vs.map((v) => <text key={v} x={X(v)} y={y + 19} textAnchor="middle">{fmt(v)}</text>)}
              </g>
            )}
          </g>
        );
        break;
      }
      case "point": {
        const [x, y] = P(o.id);
        const pop = outBack(clamp(d));
        const flash = prog(t, drawAt, drawAt + 0.6);
        body = (
          <g>
            {flash < 1 && <circle cx={x} cy={y} r={5 + 16 * flash} fill="none" stroke={color} strokeWidth={2} opacity={1 - flash} />}
            <circle cx={x} cy={y} r={(4.6 + 1.6 * f) * pop} fill={o.open ? BOARD : color} stroke={color} strokeWidth={2.2} />
          </g>
        );
        label = { at: [x + 8, y - 9], anchor: "start" };
        break;
      }
      case "seg": {
        const [a, b] = [P(o.from), P(o.to)];
        body = (
          <g>
            <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" {...(o.dash ? { strokeDasharray: "6 6", opacity: ease(d) } : reveal)} />
            {o.arrow && d > 0.9 && <polygon points={arrowHead(a, b)} fill={color} />}
          </g>
        );
        label = segLabel(a, b);
        break;
      }
      case "line": {
        const [a, b] = o.through.map(P) as [XY, XY];
        const [p, q] = extend(a, b, W, H);
        body = <path d={`M${p[0]} ${p[1]} L${q[0]} ${q[1]}`} stroke={color} strokeWidth={sw} fill="none" {...(o.dash ? { strokeDasharray: "6 6", opacity: ease(d) } : reveal)} />;
        label = { at: [q[0] - 6, q[1] - 8], anchor: "end" };
        break;
      }
      case "fn": {
        const fn = fns.get(o.id)!;
        const pr = params.get(o.id)!;
        const lo = Math.max(vx[0], o.domain?.[0] ?? -Infinity);
        const hi = Math.min(vx[1], o.domain?.[1] ?? Infinity);
        const pts: (XY | null)[] = [];
        const N = 160;
        const span = vy[1] - vy[0];
        for (let k = 0; k <= N; k++) {
          const x = lo + ((hi - lo) * k) / N;
          const y = fn(x, pr);
          pts.push(Number.isFinite(y) && y > vy[0] - span && y < vy[1] + span ? [X(x), Y(y)] : null);
        }
        let dd = "";
        let pen = false;
        let end: XY | null = null;
        for (const p of pts) {
          if (!p) {
            pen = false;
            continue;
          }
          dd += `${pen ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
          pen = true;
          if (p[1] >= PAD - 4 && p[1] <= H - PAD + 4) end = p;
        }
        body = <path clipPath={`url(#${clipId})`} d={dd} stroke={color} strokeWidth={sw} fill="none" strokeLinejoin="round" {...(o.dash ? { strokeDasharray: "6 6", opacity: ease(d) } : reveal)} />;
        if (end) label = { at: [end[0] - 6, end[1] - 10], anchor: "end" };
        break;
      }
      case "poly": {
        const ps = o.pts.map(P);
        const path = `M${ps.map((p) => `${p[0]} ${p[1]}`).join(" L")}${o.open ? "" : " Z"}`;
        body = (
          <g>
            {o.fill && <path d={path} fill={color} opacity={0.22 * prog(d, 0.6, 1)} stroke="none" />}
            <path d={path} stroke={color} strokeWidth={sw} fill="none" strokeLinejoin="round" {...(o.dash ? { strokeDasharray: "6 6", opacity: ease(d) } : reveal)} />
          </g>
        );
        const c = centroid(ps);
        label = { at: [c[0], c[1] + 4], anchor: "middle" };
        break;
      }
      case "circle": {
        const [cx, cy] = P(o.c);
        const r = o.r * sx;
        const path = `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy}`;
        body = (
          <g>
            {o.fill && <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.18 * prog(d, 0.6, 1)} />}
            <path d={path} stroke={color} strokeWidth={sw} fill="none" {...reveal} />
          </g>
        );
        label = { at: [cx + r * 0.72 + 6, cy - r * 0.72 - 6], anchor: "start" };
        break;
      }
      case "angle": {
        const v = P(o.at);
        const a = P(o.from);
        const b = P(o.to);
        let a1 = Math.atan2(a[1] - v[1], a[0] - v[0]);
        let a2 = Math.atan2(b[1] - v[1], b[0] - v[0]);
        let sweep = a2 - a1;
        while (sweep > Math.PI) sweep -= 2 * Math.PI;
        while (sweep < -Math.PI) sweep += 2 * Math.PI;
        const r = o.r ?? (o.right ? 12 : 24);
        const mid = a1 + sweep / 2;
        if (o.right) {
          const u: XY = [Math.cos(a1) * r, Math.sin(a1) * r];
          const w: XY = [Math.cos(a2) * r, Math.sin(a2) * r];
          body = <path d={`M${v[0] + u[0]} ${v[1] + u[1]} L${v[0] + u[0] + w[0]} ${v[1] + u[1] + w[1]} L${v[0] + w[0]} ${v[1] + w[1]}`} stroke={color} strokeWidth={2} fill="none" {...reveal} />;
        } else {
          const sw2 = sweep * ease(d);
          a2 = a1 + sw2;
          const p1: XY = [v[0] + Math.cos(a1) * r, v[1] + Math.sin(a1) * r];
          const p2: XY = [v[0] + Math.cos(a2) * r, v[1] + Math.sin(a2) * r];
          const large = Math.abs(sw2) > Math.PI ? 1 : 0;
          const dir = sw2 > 0 ? 1 : 0;
          body = (
            <g>
              {o.fill !== false && <path d={`M${v[0]} ${v[1]} L${p1[0]} ${p1[1]} A${r} ${r} 0 ${large} ${dir} ${p2[0]} ${p2[1]} Z`} fill={color} opacity={0.28} />}
              <path d={`M${p1[0]} ${p1[1]} A${r} ${r} 0 ${large} ${dir} ${p2[0]} ${p2[1]}`} stroke={color} strokeWidth={sw} fill="none" />
            </g>
          );
        }
        const lr = r + 14;
        label = { at: [v[0] + Math.cos(mid) * lr, v[1] + Math.sin(mid) * lr + 4], anchor: "middle" };
        break;
      }
      case "text": {
        const [x, y] = P(o.at);
        body = (
          <text x={x} y={y} className="lv-sc-label" fill={color} textAnchor="middle" fontSize={o.size ?? 15} opacity={ease(d)}>
            {o.text}
          </text>
        );
        break;
      }
    }
    const text = o.label;
    const lp = prog(d, 0.55, 1);
    return (
      <g key={o.id} opacity={dim * (1 - gone)} style={{ filter: glow }} transform={tf || undefined}>
        {body}
        {text && label && lp > 0 && (
          <text
            className={`lv-sc-label ${/^[a-zA-Z]$/.test(text) ? "is-var" : ""}`}
            x={label.at[0] + (o.labelOffset?.[0] ?? 0)}
            y={label.at[1] + (o.labelOffset?.[1] ?? 0)}
            textAnchor={label.anchor ?? "middle"}
            fill={color}
            opacity={lp}
            fontSize={15 * (1 + 0.15 * f)}
          >
            {text}
          </text>
        )}
      </g>
    );
  });

  return (
    <div className="lv-scene" ref={ref}>
      {box.w > 0 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <clipPath id={clipId}>
              <rect x={PAD / 2} y={PAD / 2} width={W - PAD} height={H - PAD} />
            </clipPath>
          </defs>
          {els}
        </svg>
      )}
    </div>
  );
}

function resolveRaw(scene: SceneSpec, p: ScenePt): XY {
  if (typeof p !== "string") return p;
  const named = scene.pts?.[p];
  if (named) return named;
  const obj = scene.objects.find((o) => o.id === p);
  if (obj && obj.kind === "point") return resolveRaw(scene, obj.at);
  return [0, 0];
}

function anchorOf(o: SceneObj, P: (p: ScenePt) => XY): XY {
  switch (o.kind) {
    case "angle":
      return P(o.at);
    case "point":
      return P(o.id);
    case "seg":
      return mid(P(o.from), P(o.to));
    case "poly":
      return centroid(o.pts.map(P));
    case "circle":
      return P(o.c);
    case "text":
      return P(o.at);
    default:
      return [0, 0];
  }
}

const mid = (a: XY, b: XY): XY => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const centroid = (ps: XY[]): XY => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];

function segLabel(a: XY, b: XY) {
  const m = mid(a, b);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  // Put the label on the outer side (up/left on screen).
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  return { at: [m[0] + nx * 14, m[1] + ny * 14 + 5] as XY, anchor: "middle" as const };
}

function extend(a: XY, b: XY, W: number, H: number): [XY, XY] {
  // The infinite line through a and b, clipped to the box (Liang-Barsky).
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const big = ((W + H) * 4) / (Math.hypot(dx, dy) || 1);
  const s: XY = [a[0] - dx * big, a[1] - dy * big];
  const d: XY = [dx * 2 * big, dy * 2 * big];
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-d[0], s[0] - PAD / 2],
    [d[0], W - PAD / 2 - s[0]],
    [-d[1], s[1] - PAD / 2],
    [d[1], H - PAD / 2 - s[1]],
  ];
  for (const [p, q] of edges) {
    if (p === 0) continue;
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
  }
  return [
    [s[0] + d[0] * t0, s[1] + d[1] * t0],
    [s[0] + d[0] * t1, s[1] + d[1] * t1],
  ];
}

function arrowHead(a: XY, b: XY) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const s = 9;
  const p1 = [b[0] - s * Math.cos(ang - 0.45), b[1] - s * Math.sin(ang - 0.45)];
  const p2 = [b[0] - s * Math.cos(ang + 0.45), b[1] - s * Math.sin(ang + 0.45)];
  return `${b[0]},${b[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`;
}

function ticks([a, b]: [number, number], step: number) {
  const out: number[] = [];
  for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

const fmt = (v: number) => (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
