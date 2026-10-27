"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { PixelDog } from "@/components/PixelDog";
import { PawPrint } from "@/components/paper/dog";
import { C, Tape, Tick } from "./art";

// The top bar's menus. One index card serves every menu: hover "The
// course" and it drops in under it; slide over to "For parents" and the
// same card glides across and reshapes to fit, its contents swapping in
// from the side you moved toward. In "The course", each item you point at
// shuffles its own little Polaroid onto the pile beside the list.
// Styles: .nb-mega* in notebook.css.

type MenuId = "course" | "parents";

const COURSE = [
  { id: "lessons", title: "Lessons with Ozho", blurb: "Short videos and worked examples for every SAT skill.", href: "#the-course" },
  { id: "quizzes", title: "Practice quizzes", blurb: "Real-format questions, marked as you go.", href: "#try-a-question" },
  { id: "review", title: "Mixed review", blurb: "Everything you've studied, shuffled the way the test asks it.", href: "#the-course" },
  { id: "plan", title: "A plan to test day", blurb: "Six months recommended, sized to fit your date.", href: "#the-course" },
] as const;
type CourseId = (typeof COURSE)[number]["id"];

// ---------- the little pictures ----------

function LessonArt() {
  return (
    <div className="nb-mega-art nb-mega-art--lesson">
      <PixelDog size={74} mood="happy" tailFrame={3} shadow={false} />
      <span className="nb-mega-play" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M3 1.5 12 7 3 12.5Z" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}
function QuizArt() {
  return (
    <div className="nb-mega-art nb-mega-art--quiz">
      <span className="nb-mega-q" />
      <span className="nb-mega-q nb-mega-q--short" />
      {["A", "B", "C"].map((l) => (
        <span key={l} className={`nb-mega-choice ${l === "B" ? "is-picked" : ""}`}>
          <b>{l}</b>
          <i />
        </span>
      ))}
    </div>
  );
}
function ReviewArt() {
  return (
    <div className="nb-mega-art nb-mega-art--review">
      {[C.cyan, C.lilac, C.butter].map((c, i) => (
        <span key={i} className="nb-mega-cardlet" style={{ background: c, transform: `rotate(${(i - 1) * 9}deg) translate(${(i - 1) * 16}px, ${i === 1 ? -4 : 2}px)` }}>
          <i />
          <i />
        </span>
      ))}
    </div>
  );
}
function PlanArt() {
  return (
    <div className="nb-mega-art nb-mega-art--plan">
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <span key={i} className={`nb-mega-day ${i < 4 ? "is-done" : ""} ${i === 4 ? "is-today" : ""}`}>
          {d}
          {i < 4 && <Tick />}
        </span>
      ))}
    </div>
  );
}
const ART: Record<CourseId, () => JSX.Element> = { lessons: LessonArt, quizzes: QuizArt, review: ReviewArt, plan: PlanArt };

function DashboardArt() {
  return (
    <div className="nb-mega-photo nb-mega-photo--dash" aria-hidden>
      {[0.82, 0.55, 0.68, 0.34].map((w, i) => (
        <span key={i} className="nb-mega-bar">
          <i style={{ transform: `scaleX(${w})` }} />
        </span>
      ))}
      <span className="nb-mega-dash-dog">
        <PixelDog size={40} mood="happy" shadow={false} />
      </span>
    </div>
  );
}
function EmailArt() {
  return (
    <div className="nb-mega-photo nb-mega-photo--mail" aria-hidden>
      <span className="nb-mega-envelope">
        <span className="nb-mega-flap" />
        <span className="nb-mega-stampette">
          <PawPrint size={14} />
        </span>
      </span>
    </div>
  );
}

// ---------- the menus ----------

function CourseMenu({ onGo }: { onGo: () => void }) {
  const [shown, setShown] = useState<CourseId>("lessons");
  const [under, setUnder] = useState<CourseId | null>(null);
  const show = (id: CourseId) => {
    if (id === shown) return;
    setUnder(shown);
    setShown(id);
  };
  const Pic = ART[shown];
  const Under = under ? ART[under] : null;
  return (
    <div className="nb-mega-course">
      <ul className="nb-mega-list">
        {COURSE.map((it) => (
          <li key={it.id}>
            <a href={it.href} onClick={onGo} onMouseEnter={() => show(it.id)} onFocus={() => show(it.id)} className={`nb-mega-item ${it.id === shown ? "is-on" : ""}`}>
              <span className="nb-mega-item-t">{it.title}</span>
              <span className="nb-mega-item-b">{it.blurb}</span>
            </a>
          </li>
        ))}
      </ul>
      {/* the pile: the last picture stays underneath as the new one lands */}
      <div className="nb-mega-pile" aria-hidden>
        {Under && (
          <span key={`u-${under}`} className="nb-mega-polaroid is-under">
            <Under />
          </span>
        )}
        <span key={shown} className="nb-mega-polaroid is-top">
          <Pic />
        </span>
      </div>
    </div>
  );
}

function ParentsMenu({ onGo }: { onGo: () => void }) {
  return (
    <div className="nb-mega-parents">
      <div className="nb-mega-cards">
        <Link href="/parents/sample" onClick={onGo} className="nb-mega-tile">
          <DashboardArt />
          <span className="nb-mega-item-t">The parent dashboard</span>
          <span className="nb-mega-item-b">Every session, score and skill, on a free account of your own.</span>
        </Link>
        <a href="#parents" onClick={onGo} className="nb-mega-tile">
          <EmailArt />
          <span className="nb-mega-item-t">The Sunday email</span>
          <span className="nb-mega-item-b">A short summary of the week, in your inbox every Sunday.</span>
        </a>
      </div>
      <Link href="/parent/login?mode=signup" onClick={onGo} className="nb-mega-foot">
        Create a free parent account <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

const MENUS: { id: MenuId; label: string }[] = [
  { id: "course", label: "The course" },
  { id: "parents", label: "For parents" },
];

export function MegaNav() {
  const [open, setOpen] = useState<MenuId | null>(null);
  const [prev, setPrev] = useState<MenuId | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [fresh, setFresh] = useState(true); // first menu since closed: drop in
  const [geo, setGeo] = useState<Record<MenuId, { w: number; h: number }> | null>(null);
  const [x, setX] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trig = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const panes = useRef<Partial<Record<MenuId, HTMLDivElement | null>>>({});
  const closeT = useRef<number | null>(null);

  // Each menu's natural size, measured once its fonts are in.
  const measure = useCallback(() => {
    const g = {} as Record<MenuId, { w: number; h: number }>;
    for (const m of MENUS) {
      const el = panes.current[m.id];
      if (!el) return;
      // (+4: the card's 2px border on each side)
      g[m.id] = { w: el.offsetWidth + 4, h: el.offsetHeight + 4 };
    }
    setGeo(g);
  }, []);
  useLayoutEffect(() => {
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // Under its trigger, kept on screen.
  const place = useCallback(
    (id: MenuId) => {
      const t = trig.current[id];
      const w = wrap.current;
      if (!t || !w || !geo) return;
      const tr = t.getBoundingClientRect();
      const wr = w.getBoundingClientRect();
      const width = geo[id].w;
      const left = tr.left + tr.width / 2 - width / 2;
      const min = 12;
      const max = window.innerWidth - width - 12;
      setX(Math.min(Math.max(left, min), max) - wr.left);
    },
    [geo],
  );

  const show = (id: MenuId) => {
    if (closeT.current) window.clearTimeout(closeT.current);
    closeT.current = null;
    if (id === open) return;
    const order = MENUS.findIndex((m) => m.id === id);
    const from = open ? MENUS.findIndex((m) => m.id === open) : -1;
    setFresh(open === null);
    setDir(from === -1 || order > from ? 1 : -1);
    setPrev(open);
    setOpen(id);
    place(id);
  };
  const hide = (delay = 160) => {
    if (closeT.current) window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => {
      setPrev(null);
      setOpen(null);
    }, delay);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = trig.current[open];
      hide(0);
      t?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) hide(0);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const size = open && geo ? geo[open] : null;
  const go = () => hide(0);

  return (
    <div className="nb-navlinks nb-mega-wrap" ref={wrap} onMouseLeave={() => hide()}>
      {MENUS.map((m) => (
        <button
          key={m.id}
          ref={(el) => {
            trig.current[m.id] = el;
          }}
          type="button"
          className={`nb-navlink nb-navtrig ${open === m.id ? "is-open" : ""}`}
          aria-expanded={open === m.id}
          aria-controls={`nb-mega-${m.id}`}
          onMouseEnter={() => show(m.id)}
          onFocus={() => show(m.id)}
          onClick={() => (open === m.id ? hide(0) : show(m.id))}
        >
          {m.label}
          <svg className="nb-navtrig-chev" width="11" height="11" viewBox="0 0 12 12" aria-hidden>
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
      <a href="#pricing" className="nb-navlink" onMouseEnter={() => hide()}>
        Pricing
      </a>
      <a href="#faq" className="nb-navlink" onMouseEnter={() => hide()}>
        FAQ
      </a>

      {/* One card for every menu: it glides to the menu you're on and
          takes that menu's shape. */}
      <div
        className={`nb-mega ${open ? "is-open" : ""} ${open && fresh ? "is-fresh" : ""}`}
        style={{ transform: `translateX(${x}px)` }}
        onMouseEnter={() => open && show(open)}
      >
        <div className="nb-mega-card" style={size ? { width: size.w, height: size.h } : undefined}>
          <Tape color={C.butter} pattern="stripe" className="nb-mega-tape" />
          <div className="nb-mega-clip" style={{ ["--d" as string]: dir }}>
          {MENUS.map((m) => {
            const state = m.id === open ? "is-in" : m.id === prev ? "is-out" : "is-off";
            return (
              <div
                key={m.id}
                id={`nb-mega-${m.id}`}
                ref={(el) => {
                  panes.current[m.id] = el;
                }}
                className={`nb-mega-pane ${state}`}
                // React 18 has no boolean `inert`; an empty string sets it.
                {...(m.id !== open ? { inert: "" as unknown as boolean } : {})}
                aria-hidden={m.id !== open}
              >
                {m.id === "course" ? <CourseMenu onGo={go} /> : <ParentsMenu onGo={go} />}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
