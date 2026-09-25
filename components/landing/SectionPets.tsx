"use client";

import { useEffect, useRef, useState } from "react";
import { PixelDog, type DogMood } from "@/components/PixelDog";

// The pets beyond the title page, one small cameo per section, each doing
// something different so they never read as the same sticker repeated:
//   PerchPet   -- sits on top of the parent dashboard card, wags, looks
//                 around, perks up when the card is hovered.
//   QuizBuddy  -- sits on the showcase question card and reacts to it:
//                 watches the choice you hover, worries at a wrong answer,
//                 celebrates a right one.
//   Runners    -- the two dogs chase a ball across the bottom of the
//                 pricing section now and then, in varying ways.
//   NapPet     -- naps beside the FAQ heading; opening a question wakes him.
// All decorative (aria-hidden, no pointer events except the hover target
// they sit on), and all driven by timers rather than per-frame React
// renders, same as the title page's pets.

type Tail = 0 | 1 | 2 | 3 | 4 | 5;

// A tail wag: ping-pong through PixelDog's six drawn positions.
function useWag(ms = 70, on = true) {
  const [tail, setTail] = useState<Tail>(0);
  useEffect(() => {
    if (!on) return;
    let dir = 1;
    const id = setInterval(() => {
      setTail((t) => {
        let n = t + dir;
        if (n >= 5 || n <= 0) dir = -dir;
        n = Math.max(0, Math.min(5, n));
        return n as Tail;
      });
    }, ms);
    return () => clearInterval(id);
  }, [ms, on]);
  return tail;
}

function useInView<T extends HTMLElement>(ref: React.RefObject<T>, margin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Plays a one-shot CSS animation class by keying it, so repeats restart.
function useOneShot() {
  const [shot, setShot] = useState<{ cls: string; key: number } | null>(null);
  const play = (cls: string, ms: number) => {
    const key = Date.now();
    setShot({ cls, key });
    setTimeout(() => setShot((s) => (s && s.key === key ? null : s)), ms);
  };
  return [shot?.cls ?? "", shot?.key ?? 0, play] as const;
}

// ---- PerchPet ------------------------------------------------------------------

export function PerchPet({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tail = useWag(80);
  const [facing, setFacing] = useState<1 | -1>(-1);
  const [cls, key, play] = useOneShot();
  const inView = useInView(ref);

  // Idle life: glance the other way, tilt, a little hop -- at irregular
  // intervals, only while on screen.
  useEffect(() => {
    if (!inView) return;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        const r = Math.random();
        if (r < 0.4) setFacing((f) => (f === 1 ? -1 : 1));
        else if (r < 0.75) play("animate-ozho-tilt", 1100);
        else play("animate-ozho-hops", 720);
        next();
      }, rand(2200, 5200));
    };
    next();
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Hovering the card she's sitting on gets a happy hop and a look.
  useEffect(() => {
    const card = ref.current?.parentElement;
    if (!card) return;
    const onEnter = () => {
      setFacing(-1);
      play("animate-ozho-hops", 720);
    };
    card.addEventListener("pointerenter", onEnter);
    return () => card.removeEventListener("pointerenter", onEnter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={`pointer-events-none absolute z-20 ${className}`} aria-hidden>
      <div key={key} className={cls} style={{ ["--face" as string]: facing }}>
        <PixelDog size={46} variant="mochi" mood="happy" sitting tailFrame={tail} facing={facing} />
      </div>
    </div>
  );
}

// ---- QuizBuddy -----------------------------------------------------------------
// Listens for the showcase's own events: "landing:hover-choice" (detail:
// -1 left, 1 right), "landing:correct", "landing:wrong", "landing:reset".

export function QuizBuddy({ className = "" }: { className?: string }) {
  const [facing, setFacing] = useState<1 | -1>(1);
  const [mood, setMood] = useState<DogMood>("neutral");
  const [cls, key, play] = useOneShot();
  const [hearts, setHearts] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const tail = useWag(mood === "happy" ? 55 : 110);
  const settledRef = useRef(false);

  useEffect(() => {
    let bubbleT: ReturnType<typeof setTimeout>;
    const say = (s: string, ms = 2200) => {
      setBubble(s);
      clearTimeout(bubbleT);
      bubbleT = setTimeout(() => setBubble(null), ms);
    };
    const onHover = (e: Event) => {
      if (settledRef.current) return;
      const dir = (e as CustomEvent<number>).detail;
      setFacing(dir < 0 ? -1 : 1);
    };
    const onCorrect = () => {
      settledRef.current = true;
      setMood("happy");
      play("animate-trick", 900);
      setHearts((h) => h + 1);
      say("Nailed it!");
    };
    const onWrong = () => {
      settledRef.current = true;
      setMood("sad");
      play("animate-worried", 900);
      setTimeout(() => {
        setMood("happy");
        play("animate-ozho-hops", 720);
        say("Close! Read the steps.");
      }, 1300);
    };
    const onReset = () => {
      settledRef.current = false;
      setMood("neutral");
      play("animate-ozho-tilt", 1100);
    };
    window.addEventListener("landing:hover-choice", onHover);
    window.addEventListener("landing:correct", onCorrect);
    window.addEventListener("landing:wrong", onWrong);
    window.addEventListener("landing:reset", onReset);
    return () => {
      clearTimeout(bubbleT);
      window.removeEventListener("landing:hover-choice", onHover);
      window.removeEventListener("landing:correct", onCorrect);
      window.removeEventListener("landing:wrong", onWrong);
      window.removeEventListener("landing:reset", onReset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While he's waiting for an answer, a thinking tilt now and then.
  useEffect(() => {
    const id = setInterval(() => {
      if (!settledRef.current && Math.random() < 0.5) play("animate-ozho-tilt", 1100);
    }, 3800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`pointer-events-none absolute z-20 ${className}`} aria-hidden>
      {bubble && (
        // Centered by the outer box; the fade-up animation sets its own
        // transform, so it lives on the inner one.
        <div className="absolute bottom-full left-1/2 mb-1 w-max -translate-x-1/2">
          <div className="rounded-lg bg-white px-2.5 py-1 text-[11.5px] font-semibold text-ink shadow-[0_4px_14px_rgba(38,34,24,0.15)] ring-1 ring-[#e2d7c1] animate-fade-up">
            {bubble}
          </div>
        </div>
      )}
      {hearts > 0 && (
        <div key={hearts} className="absolute left-1/2 top-0">
          {[
            { d: "0s", x: "-14px" },
            { d: "0.12s", x: "4px" },
            { d: "0.24s", x: "16px" },
          ].map((h, i) => (
            <span
              key={i}
              className="absolute text-sm text-[#d3805f] animate-ozho-heart"
              style={{ animationDelay: h.d, ["--hx" as string]: h.x }}
            >
              ♥
            </span>
          ))}
        </div>
      )}
      <div key={key} className={cls} style={{ ["--face" as string]: facing }}>
        <PixelDog size={48} mood={mood} sitting tailFrame={tail} facing={facing} />
      </div>
    </div>
  );
}

// ---- Runners -------------------------------------------------------------------
// A chase across the bottom of a section: the one with the ball in front,
// the other a few steps behind. Each run varies -- direction, who has the
// ball, speed, and sometimes a mid-run stop for a play bow -- and runs only
// while the section is on screen.

export function Runners({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const chaseRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, "-80px");
  const [leg, setLeg] = useState<0 | 1>(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [running, setRunning] = useState(false);
  const [ballOnOzho, setBallOnOzho] = useState(true);
  const [bow, setBow] = useState(false);
  const tail = useWag(60);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let raf: ReturnType<typeof setInterval> | null = null;
    let legT: ReturnType<typeof setInterval> | null = null;
    let waitT: ReturnType<typeof setTimeout>;

    const run = () => {
      const wrap = wrapRef.current;
      if (!wrap || cancelled) return;
      const w = wrap.clientWidth;
      const d: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      setDir(d);
      setBallOnOzho(Math.random() < 0.6);
      setRunning(true);
      const speed = rand(170, 250); // px/s
      const gap = rand(46, 70);
      const stopAt = Math.random() < 0.35 ? rand(0.35, 0.6) * w : null;
      let x = d === 1 ? -120 : w + 120;
      // The optional mid-run play bow: when x passes stopAt, hold still
      // (legs down, bowing) until pauseUntil, once per run.
      let bowDone = stopAt === null;
      let pauseUntil = 0;
      let last = performance.now();
      const startLegs = () => {
        if (legT) clearInterval(legT);
        legT = setInterval(() => setLeg((l) => (l === 0 ? 1 : 0)), 110);
      };
      startLegs();
      raf = setInterval(() => {
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!bowDone && (d === 1 ? x >= stopAt! : x <= stopAt!)) {
          bowDone = true;
          pauseUntil = now + 1300;
          setRunning(false);
          setBow(true);
          if (legT) clearInterval(legT);
        }
        if (pauseUntil) {
          if (now < pauseUntil) return;
          pauseUntil = 0;
          setBow(false);
          setRunning(true);
          startLegs();
        }
        x += d * speed * dt;
        if (leadRef.current) leadRef.current.style.transform = `translateX(${x}px)`;
        if (chaseRef.current) chaseRef.current.style.transform = `translateX(${x - d * gap}px)`;
        if (d === 1 ? x > w + 140 : x < -140) {
          if (raf) clearInterval(raf);
          if (legT) clearInterval(legT);
          setRunning(false);
          waitT = setTimeout(run, rand(5000, 11000));
        }
      }, 16);
    };
    waitT = setTimeout(run, rand(800, 2000));
    return () => {
      cancelled = true;
      clearTimeout(waitT);
      if (raf) clearInterval(raf);
      if (legT) clearInterval(legT);
    };
  }, [inView]);

  const lead = ballOnOzho ? "ozho" : "mochi";
  return (
    <div ref={wrapRef} className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`} style={{ height: 52 }} aria-hidden>
      <div ref={leadRef} className="absolute bottom-0 left-0" style={{ transform: "translateX(-200px)" }}>
        <div className={bow ? "animate-ozho-bow" : ""}>
          <PixelDog
            size={44}
            variant={lead}
            mood="happy"
            legFrame={running ? leg : 0}
            tailFrame={tail}
            facing={dir}
            carryingBall
          />
        </div>
      </div>
      <div ref={chaseRef} className="absolute bottom-0 left-0" style={{ transform: "translateX(-260px)" }}>
        <PixelDog
          size={40}
          variant={lead === "ozho" ? "mochi" : "ozho"}
          mood="happy"
          legFrame={running ? ((1 - leg) as 0 | 1) : 0}
          tailFrame={tail}
          facing={dir}
        />
      </div>
    </div>
  );
}

// ---- NapPet --------------------------------------------------------------------
// Asleep until someone opens a question in the section he's in; then up,
// wagging, watching, and back to sleep after a while of quiet.

export function NapPet({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [awake, setAwake] = useState(false);
  const [cls, key, play] = useOneShot();
  const tail = useWag(70, awake);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    let sleepT: ReturnType<typeof setTimeout>;
    const onClick = (e: Event) => {
      if (!(e.target as Element).closest?.("button")) return;
      setAwake((was) => {
        if (!was) play("animate-wake-up", 700);
        else play("animate-ozho-hops", 720);
        return true;
      });
      clearTimeout(sleepT);
      sleepT = setTimeout(() => {
        play("animate-fall-asleep", 700);
        setTimeout(() => setAwake(false), 450);
      }, 7000);
    };
    section.addEventListener("click", onClick);
    return () => {
      clearTimeout(sleepT);
      section.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={`pointer-events-none relative inline-block ${className}`} aria-hidden>
      {!awake && (
        <div className="absolute bottom-full left-1/2 mb-0.5" style={{ transform: "translateX(-20%)" }}>
          <div className="relative h-7 w-9">
            <span className="absolute bottom-0 left-0 text-[10px] font-bold text-[#9a9384] animate-zzz">z</span>
            <span className="absolute bottom-0 left-2.5 text-xs font-bold text-[#9a9384] animate-zzz" style={{ animationDelay: "0.55s" }}>
              Z
            </span>
            <span className="absolute bottom-0 left-5 text-sm font-bold text-[#9a9384] animate-zzz" style={{ animationDelay: "1.1s" }}>
              Z
            </span>
          </div>
        </div>
      )}
      <div key={key} className={cls}>
        <PixelDog size={52} mood={awake ? "happy" : "tired"} asleep={!awake} sitting={awake} tailFrame={tail} facing={1} />
      </div>
    </div>
  );
}
