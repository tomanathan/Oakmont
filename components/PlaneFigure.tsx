import type { GeometryFigure, SolidFigure } from "@/lib/figureTypes";

// To-scale geometry for practice questions (see lib/figureTypes.ts). Points
// are real coordinates; this only fits them into the frame (one uniform
// scale, y flipped), so lengths and angles on screen are the true ones.
const INK = "#383a30";
const MUTED = "#8f887a";
const GRID = "#e9e6f3";
const SHADE = "#dfe3f8";
const GROUND = "#f8f4eb"; // matches the figure panel, for "blank" regions and label halos
const ACCENT = "#b5602f";

const W = 360;
const MAX_H = 270;
const PAD = 30;

type Pt = [number, number];

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const len = (v: Pt) => Math.hypot(v[0], v[1]);
const unit = (v: Pt): Pt => {
  const l = len(v) || 1;
  return [v[0] / l, v[1] / l];
};

function Label({ x, y, text, color = INK, size = 13 }: { x: number; y: number; text: string; color?: string; size?: number }) {
  return (
    <text
      x={x}
      y={y + size * 0.35}
      fontSize={size}
      textAnchor="middle"
      fill={color}
      fontWeight={600}
      stroke={GROUND}
      strokeWidth={4}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {text}
    </text>
  );
}

export function PlaneFigure({ spec }: { spec: GeometryFigure }) {
  const P = spec.points;
  // Bounds in problem units: every point, circle, arc, and the axes.
  const xs: number[] = [];
  const ys: number[] = [];
  Object.values(P).forEach(([x, y]) => {
    xs.push(x);
    ys.push(y);
  });
  (spec.circles ?? []).concat(spec.arcs ?? []).forEach((c) => {
    const [cx, cy] = P[c.center];
    xs.push(cx - c.radius, cx + c.radius);
    ys.push(cy - c.radius, cy + c.radius);
  });
  if (spec.axes) {
    xs.push(...spec.axes.x);
    ys.push(...spec.axes.y);
  } else {
    (spec.paths ?? []).forEach((pa) => pa.points.forEach(([x, y]) => (xs.push(x), ys.push(y))));
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const k = Math.min((W - 2 * PAD) / (maxX - minX || 1), (MAX_H - 2 * PAD) / (maxY - minY || 1));
  const H = Math.round((maxY - minY) * k + 2 * PAD);
  const offX = (W - (maxX - minX) * k) / 2;
  const tx = (x: number) => offX + (x - minX) * k;
  const ty = (y: number) => H - PAD - (y - minY) * k;
  const S = (name: string): Pt => [tx(P[name][0]), ty(P[name][1])];
  const T = (p: [number, number]): Pt => [tx(p[0]), ty(p[1])];
  // Unique per figure: several figures share a page, and a clip id reused
  // across them would clip one graph to another graph's window.
  const clipId = `geo-clip-${hash(JSON.stringify(spec))}`;

  // Screen-space center of the named points, for pushing labels outward.
  const shown = spec.names ?? [];
  const basis = shown.length ? shown : Object.keys(P);
  const cx = basis.reduce((s, n) => s + S(n)[0], 0) / basis.length;
  const cy = basis.reduce((s, n) => s + S(n)[1], 0) / basis.length;

  const axes = spec.axes;
  const step = axes?.step ?? 1;
  const every = axes?.labelEvery ?? step;
  const labeled = (v: number) => Math.abs(v / every - Math.round(v / every)) < 1e-6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[400px]" role="img" aria-label={describePlane(spec)}>
      <defs>
        {axes && (
          <clipPath id={clipId}>
            <rect x={tx(axes.x[0])} y={ty(axes.y[1])} width={tx(axes.x[1]) - tx(axes.x[0])} height={ty(axes.y[0]) - ty(axes.y[1])} />
          </clipPath>
        )}
        <marker id="geo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill={INK} />
        </marker>
      </defs>

      {spec.regions && (
        <g clipPath={axes ? `url(#${clipId})` : undefined}>
          {spec.regions.map((rg, i) => (
            <polygon key={`rg${i}`} points={rg.map((p) => T(p).join(",")).join(" ")} fill={SHADE} stroke="none" />
          ))}
        </g>
      )}

      {axes && (
        <g>
          {range(Math.ceil(axes.x[0] / step) * step, axes.x[1], step).map((v) => (
            <line key={`gx${v}`} x1={tx(v)} x2={tx(v)} y1={ty(axes.y[0])} y2={ty(axes.y[1])} stroke={GRID} />
          ))}
          {range(Math.ceil(axes.y[0] / step) * step, axes.y[1], step).map((v) => (
            <line key={`gy${v}`} x1={tx(axes.x[0])} x2={tx(axes.x[1])} y1={ty(v)} y2={ty(v)} stroke={GRID} />
          ))}
          <line x1={tx(axes.x[0])} x2={tx(axes.x[1])} y1={ty(0)} y2={ty(0)} stroke={INK} strokeWidth={1.2} markerEnd="url(#geo-arrow)" markerStart="url(#geo-arrow)" />
          <line x1={tx(0)} x2={tx(0)} y1={ty(axes.y[0])} y2={ty(axes.y[1])} stroke={INK} strokeWidth={1.2} markerEnd="url(#geo-arrow)" markerStart="url(#geo-arrow)" />
          <text x={tx(axes.x[1]) - 2} y={ty(0) - 7} fontSize={12} fontStyle="italic" fill={INK} textAnchor="end">x</text>
          <text x={tx(0) + 7} y={ty(axes.y[1]) + 10} fontSize={12} fontStyle="italic" fill={INK}>y</text>
          {range(Math.ceil(axes.x[0] / step) * step, axes.x[1], step)
            .filter((v) => v !== 0 && v !== axes.x[1] && v !== axes.x[0] && labeled(v))
            .map((v) => (
              <text key={`lx${v}`} x={tx(v)} y={ty(0) + 13} fontSize={9.5} fill={MUTED} textAnchor="middle">{v}</text>
            ))}
          {range(Math.ceil(axes.y[0] / step) * step, axes.y[1], step)
            .filter((v) => v !== 0 && v !== axes.y[1] && v !== axes.y[0] && labeled(v))
            .map((v) => (
              <text key={`ly${v}`} x={tx(0) - 5} y={ty(v) + 3.5} fontSize={9.5} fill={MUTED} textAnchor="end">{v}</text>
            ))}
          <text x={tx(0) - 5} y={ty(0) + 13} fontSize={9.5} fill={MUTED} textAnchor="end">0</text>
        </g>
      )}

      <g clipPath={axes ? `url(#${clipId})` : undefined}>
        {(spec.paths ?? []).map((pa, i) => (
          <polyline
            key={`pa${i}`}
            points={pa.points.map((p) => T(p).join(",")).join(" ")}
            fill="none"
            stroke={INK}
            strokeWidth={1.8}
            strokeLinejoin="round"
            strokeDasharray={pa.dashed ? "6 4" : undefined}
            markerStart={pa.arrows ? "url(#geo-arrow)" : undefined}
            markerEnd={pa.arrows ? "url(#geo-arrow)" : undefined}
          />
        ))}
      </g>
      {(spec.notes ?? []).map((nt, i) => (
        <Label key={`nt${i}`} x={T(nt.at)[0]} y={T(nt.at)[1]} text={nt.text} size={12.5} />
      ))}

      {(spec.polygons ?? []).map((pg, i) => (
        <polygon
          key={`pg${i}`}
          points={pg.points.map((n) => S(n).join(",")).join(" ")}
          fill={pg.shade ? SHADE : "none"}
          stroke={INK}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}
      {(spec.circles ?? []).map((c, i) => (
        <circle
          key={`c${i}`}
          cx={S(c.center)[0]}
          cy={S(c.center)[1]}
          r={c.radius * k}
          fill={c.shade ? SHADE : c.blank ? GROUND : "none"}
          stroke={INK}
          strokeWidth={1.6}
        />
      ))}
      {(spec.arcs ?? []).map((a, i) => {
        const [ox, oy] = S(a.center);
        const r = a.radius * k;
        const p1 = [ox + r * Math.cos((a.from * Math.PI) / 180), oy - r * Math.sin((a.from * Math.PI) / 180)];
        const p2 = [ox + r * Math.cos((a.to * Math.PI) / 180), oy - r * Math.sin((a.to * Math.PI) / 180)];
        const sweep = ((a.to - a.from) % 360 + 360) % 360;
        return (
          <path
            key={`a${i}`}
            d={`M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 0 ${p2[0]} ${p2[1]}`}
            fill="none"
            stroke={INK}
            strokeWidth={1.6}
          />
        );
      })}

      {(spec.segments ?? []).map((s, i) => {
        const a = S(s.from);
        const b = S(s.to);
        const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const d = unit(sub(b, a));
        let n: Pt = [-d[1], d[0]];
        const away = (mid[0] - cx) * n[0] + (mid[1] - cy) * n[1];
        if (s.side ? s.side < 0 : away < 0) n = [-n[0], -n[1]];
        return (
          <g key={`s${i}`}>
            <line
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke={INK}
              strokeWidth={1.6}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              markerStart={s.arrows ? "url(#geo-arrow)" : undefined}
              markerEnd={s.arrows ? "url(#geo-arrow)" : undefined}
            />
            {Array.from({ length: s.ticks ?? 0 }, (_, t) => {
              const off = (t - ((s.ticks ?? 1) - 1) / 2) * 5;
              const c: Pt = [mid[0] + d[0] * off, mid[1] + d[1] * off];
              return <line key={t} x1={c[0] - n[0] * 5} y1={c[1] - n[1] * 5} x2={c[0] + n[0] * 5} y2={c[1] + n[1] * 5} stroke={INK} strokeWidth={1.4} />;
            })}
            {s.label && <Label x={mid[0] + n[0] * 13} y={mid[1] + n[1] * 13} text={s.label} />}
          </g>
        );
      })}

      {(spec.angles ?? []).map((an, i) => {
        const v = S(an.vertex);
        const u1 = unit(sub(S(an.from), v));
        const u2 = unit(sub(S(an.to), v));
        const bis = unit([u1[0] + u2[0], u1[1] + u2[1]]);
        if (an.right) {
          const s = 11;
          const p1: Pt = [v[0] + u1[0] * s, v[1] + u1[1] * s];
          const p2: Pt = [v[0] + (u1[0] + u2[0]) * s, v[1] + (u1[1] + u2[1]) * s];
          const p3: Pt = [v[0] + u2[0] * s, v[1] + u2[1] * s];
          return <path key={`an${i}`} d={`M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`} fill="none" stroke={INK} strokeWidth={1.3} />;
        }
        const theta = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
        const r = theta < 0.6 ? 24 : 17;
        const cross = u1[0] * u2[1] - u1[1] * u2[0];
        const marks = Math.max(1, an.marks ?? 1);
        return (
          <g key={`an${i}`}>
            {Array.from({ length: marks }, (_, m) => {
              const rr = r + m * 4;
              const a1: Pt = [v[0] + u1[0] * rr, v[1] + u1[1] * rr];
              const a2: Pt = [v[0] + u2[0] * rr, v[1] + u2[1] * rr];
              return <path key={m} d={`M ${a1[0]} ${a1[1]} A ${rr} ${rr} 0 0 ${cross > 0 ? 1 : 0} ${a2[0]} ${a2[1]}`} fill="none" stroke={ACCENT} strokeWidth={1.4} />;
            })}
            {an.label && (() => {
              // Push the label out along the bisector far enough that its box
              // (wide for "(4x − 10)°") clears both rays, not just its center.
              const half = an.label.length * 3.4;
              const dist = r + 9 + half * Math.abs(bis[0]) + 7 * Math.abs(bis[1]) + (theta < 0.6 ? 8 : 0);
              return <Label x={v[0] + bis[0] * dist} y={v[1] + bis[1] * dist} text={an.label} color={ACCENT} size={12.5} />;
            })()}
          </g>
        );
      })}

      {(spec.dots ?? []).map((n) => (
        <circle key={`d${n}`} cx={S(n)[0]} cy={S(n)[1]} r={3} fill={INK} />
      ))}
      {shown.map((n) => {
        const [x, y] = S(n);
        const deg = spec.namePos?.[n];
        const dir: Pt =
          deg !== undefined
            ? [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)]
            : Math.hypot(x - cx, y - cy) < 1
              ? [0.7, -0.7]
              : unit([x - cx, y - cy]);
        return <Label key={`n${n}`} x={x + dir[0] * 14} y={y + dir[1] * 14} text={n} size={13.5} />;
      })}
    </svg>
  );
}

function hash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

function describePlane(spec: GeometryFigure): string {
  const parts: string[] = [];
  (spec.segments ?? []).forEach((s) => s.label && parts.push(`${s.from}${s.to} labeled ${s.label}`));
  (spec.angles ?? []).forEach((a) => parts.push(a.right ? `right angle at ${a.vertex}` : `angle ${a.from}${a.vertex}${a.to}${a.label ? ` labeled ${a.label}` : ""}`));
  (spec.circles ?? []).forEach((c) => parts.push(`circle centered at ${c.center}`));
  return "Geometry figure: " + (parts.join("; ") || "see question");
}

// ------------------------------------------------------------ solids
export function SolidShape({ spec }: { spec: SolidFigure }) {
  // Oblique view: depth drawn at 30° and half scale; ellipses squashed to 0.35.
  const H = 250;
  const L = spec.labels;
  if (spec.shape === "prism") {
    const l = spec.length ?? 1;
    const w = spec.width ?? 1;
    const h = spec.height;
    const dx = w * 0.5 * Math.cos(Math.PI / 6);
    const dy = w * 0.5 * Math.sin(Math.PI / 6);
    const k = Math.min((W - 2 * PAD - 20) / (l + dx), (H - 2 * PAD) / (h + dy));
    const ox = (W - (l + dx) * k) / 2;
    const oy = H - PAD;
    const p = (x: number, y: number): Pt => [ox + x * k, oy - y * k];
    const A = p(0, 0), B = p(l, 0), C = p(l, h), D = p(0, h);
    const B2 = p(l + dx, dy), C2 = p(l + dx, h + dy), D2 = p(dx, h + dy), A2 = p(dx, dy);
    const poly = (pts: Pt[]) => pts.map((q) => q.join(",")).join(" ");
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[380px]" role="img" aria-label={`Rectangular prism: length ${L.length}, width ${L.width}, height ${L.height}`}>
        <line x1={A2[0]} y1={A2[1]} x2={A[0]} y2={A[1]} stroke={MUTED} strokeDasharray="4 4" />
        <line x1={A2[0]} y1={A2[1]} x2={B2[0]} y2={B2[1]} stroke={MUTED} strokeDasharray="4 4" />
        <line x1={A2[0]} y1={A2[1]} x2={D2[0]} y2={D2[1]} stroke={MUTED} strokeDasharray="4 4" />
        <polygon points={poly([A, B, C, D])} fill="none" stroke={INK} strokeWidth={1.6} />
        <polygon points={poly([B, B2, C2, C])} fill="none" stroke={INK} strokeWidth={1.6} />
        <polygon points={poly([D, C, C2, D2])} fill="none" stroke={INK} strokeWidth={1.6} />
        {L.length && <Label x={(A[0] + B[0]) / 2} y={A[1] + 15} text={L.length} />}
        {L.height && <Label x={A[0] - 14} y={(A[1] + D[1]) / 2} text={L.height} />}
        {L.width && <Label x={(B[0] + B2[0]) / 2 + 13} y={(B[1] + B2[1]) / 2 + 6} text={L.width} />}
      </svg>
    );
  }
  const r = spec.radius ?? 1;
  const h = spec.height;
  const squash = 0.35;
  const k = Math.min((W - 2 * PAD - 40) / (2 * r), (H - 2 * PAD) / (h + 2 * r * squash));
  const cx = W / 2;
  const base = H - PAD - r * squash * k;
  const top = base - h * k;
  const rx = r * k;
  const ry = r * squash * k;
  const isCone = spec.shape === "cone";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[380px]" role="img" aria-label={`${spec.shape}: ${Object.entries(L).map(([a, b]) => `${a} ${b}`).join(", ")}`}>
      {/* base: front half solid, back half dashed */}
      <path d={`M ${cx - rx} ${base} A ${rx} ${ry} 0 0 0 ${cx + rx} ${base}`} fill="none" stroke={INK} strokeWidth={1.6} />
      <path d={`M ${cx - rx} ${base} A ${rx} ${ry} 0 0 1 ${cx + rx} ${base}`} fill="none" stroke={MUTED} strokeDasharray="4 4" />
      {isCone ? (
        <>
          <line x1={cx - rx} y1={base} x2={cx} y2={top} stroke={INK} strokeWidth={1.6} />
          <line x1={cx + rx} y1={base} x2={cx} y2={top} stroke={INK} strokeWidth={1.6} />
        </>
      ) : (
        <>
          <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={1.6} />
          <line x1={cx - rx} y1={base} x2={cx - rx} y2={top} stroke={INK} strokeWidth={1.6} />
          <line x1={cx + rx} y1={base} x2={cx + rx} y2={top} stroke={INK} strokeWidth={1.6} />
        </>
      )}
      {/* height: dashed axis from base center to top */}
      {L.height && (
        <>
          <line x1={cx} y1={base} x2={cx} y2={top} stroke={MUTED} strokeDasharray="4 4" />
          <path d={`M ${cx} ${base - 9} L ${cx + 9} ${base - 9} L ${cx + 9} ${base}`} fill="none" stroke={MUTED} />
          <Label x={cx - 13} y={(base + top) / 2} text={L.height} />
        </>
      )}
      {L.radius && (
        <>
          <line x1={cx} y1={base} x2={cx + rx} y2={base} stroke={INK} strokeWidth={1.3} />
          <circle cx={cx} cy={base} r={2.5} fill={INK} />
          <Label x={cx + rx / 2} y={base + 13} text={L.radius} />
        </>
      )}
      {L.diameter && (
        <>
          <line x1={cx - rx} y1={isCone ? base : top} x2={cx + rx} y2={isCone ? base : top} stroke={INK} strokeWidth={1.3} />
          <Label x={cx + rx / 2} y={(isCone ? base : top) - 11} text={L.diameter} />
        </>
      )}
      {L.slant && isCone && <Label x={cx + rx / 2 + 16} y={(base + top) / 2} text={L.slant} />}
    </svg>
  );
}
