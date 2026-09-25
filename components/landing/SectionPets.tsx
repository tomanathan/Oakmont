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
//   Runners    -- the two dogs gambol across the bottom of the pricing
//                 section now and then: hops, play bows, chasing, a ball.
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
// Two dogs gamboling across the bottom of a section, like dogs in a meadow:
// the pair drifts across the screen, but each dog has a mind of its own on
// the way -- bounding hops of different heights, surges and slow-downs that
// swap who's in front, a play bow and pounce, a quick wheel-around to chase
// back at the other, and now and then the ball gets tossed ahead and both
// race for it. Every run is different. Runs only while the section is on
// screen, every several seconds. Positions are written straight to the DOM;
// React only hears about pose changes (legs, facing, bow, ball).

type RunAct = "run" | "bow" | "wheel";
interface Runner {
  x: number;
  h: number; // height above the ground
  vh: number;
  speed: number; // current multiplier on the pair's pace
  target: number; // speed it's easing toward
  act: RunAct;
  actUntil: number;
  nextThink: number;
  facing: 1 | -1;
  stride: number;
  leg: 0 | 1;
  hasBall: boolean;
}
interface Pose {
  leg: 0 | 1;
  facing: 1 | -1;
  bow: boolean;
  air: boolean;
  ball: boolean;
}

const GRAVITY = 1500; // px/s^2
const PACE = 150; // the pair's average speed, px/s

export function Runners({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dogRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const ballRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, "-60px");
  const [poses, setPoses] = useState<Pose[]>([
    { leg: 0, facing: 1, bow: false, air: false, ball: true },
    { leg: 0, facing: 1, bow: false, air: false, ball: false },
  ]);
  const posesRef = useRef(poses);
  const tail = useWag(55);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let tick: ReturnType<typeof setInterval> | null = null;
    let waitT: ReturnType<typeof setTimeout>;

    const push = (dogs: Runner[]) => {
      const next = dogs.map((d) => ({ leg: d.leg, facing: d.facing, bow: d.act === "bow", air: d.h > 1, ball: d.hasBall }));
      const prev = posesRef.current;
      if (next.some((n, i) => n.leg !== prev[i].leg || n.facing !== prev[i].facing || n.bow !== prev[i].bow || n.air !== prev[i].air || n.ball !== prev[i].ball)) {
        posesRef.current = next;
        setPoses(next);
      }
    };

    const run = () => {
      const wrap = wrapRef.current;
      if (!wrap || cancelled) return;
      const W = wrap.clientWidth;
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const startX = dir === 1 ? -90 : W + 90;
      const first = Math.random() < 0.5 ? 0 : 1;
      const now0 = performance.now();
      const dogs: Runner[] = [0, 1].map((i) => ({
        x: startX - dir * (i === first ? 0 : 60 + Math.random() * 40),
        h: 0,
        vh: 0,
        speed: 1,
        target: 1,
        act: "run" as RunAct,
        actUntil: 0,
        nextThink: now0 + rand(300, 900),
        facing: dir,
        stride: 0,
        leg: 0 as 0 | 1,
        hasBall: i === first,
      }));
      // The ball when it's loose: x, height, velocities.
      let ball: { x: number; h: number; vx: number; vh: number; bounces: number; at: number; by: number } | null = null;
      let tossed = false;
      let last = now0;

      tick = setInterval(() => {
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        dogs.forEach((d, i) => {
          const other = dogs[1 - i];
          const ahead = (other.x - d.x) * dir; // >0: the other dog is ahead

          // Decide what to do next, every so often.
          if (now > d.nextThink && d.act === "run" && d.h === 0) {
            d.nextThink = now + rand(450, 1200);
            const r = Math.random();
            if (d.hasBall && !tossed && Math.random() < 0.28) {
              // Toss the ball ahead; whoever gets there first has it.
              tossed = true;
              d.hasBall = false;
              ball = { x: d.x + dir * 14, h: 18, vx: dir * rand(260, 340), vh: rand(380, 470), bounces: 0, at: now, by: i };
              d.target = 1.7;
              other.target = 1.8;
            } else if (r < 0.34) {
              // A bounding hop -- sometimes a big leap.
              d.vh = Math.random() < 0.3 ? rand(520, 640) : rand(300, 440);
              d.target = rand(1.1, 1.45);
            } else if (r < 0.5 && ahead > 30) {
              d.target = rand(1.5, 1.9); // surge to catch up
            } else if (r < 0.62 && ahead < -40) {
              // Out in front: stop and play-bow at the other one.
              d.act = "bow";
              d.actUntil = now + 900;
              d.facing = (-dir) as 1 | -1;
            } else if (r < 0.72 && ahead < -60) {
              // Wheel around and dash back at the other for a moment.
              d.act = "wheel";
              d.actUntil = now + rand(350, 600);
              d.facing = (-dir) as 1 | -1;
              d.target = 1.2;
            } else {
              d.target = rand(0.75, 1.25);
            }
          }

          // Keep the pair together: nobody gets more than ~170px apart.
          if (ahead > 170) d.target = Math.max(d.target, 1.8);
          if (ahead < -190 && d.act === "run") d.target = Math.min(d.target, 0.55);

          // Acts ending.
          if (d.act === "bow" && now > d.actUntil) {
            // Pounce out of the bow, toward the other dog.
            d.act = "run";
            d.facing = dir;
            d.vh = rand(420, 520);
            d.target = 1.6;
          } else if (d.act === "wheel" && now > d.actUntil) {
            d.act = "run";
            d.facing = dir;
            d.vh = rand(260, 340);
          }

          // Move.
          d.speed += (d.target - d.speed) * Math.min(1, dt * 3);
          const moving = d.act !== "bow";
          let vx = !moving ? 0 : d.act === "wheel" ? -dir * PACE * d.speed * 0.9 : dir * PACE * d.speed;
          // A loose ball behind them: turn back and go get it.
          if (ball && moving && ball.h < 40 && (ball.x - d.x) * dir < -8) {
            vx = Math.sign(ball.x - d.x) * PACE * 1.5;
            d.facing = (Math.sign(ball.x - d.x) || dir) as 1 | -1;
          } else if (d.act === "run" && d.facing !== dir) {
            d.facing = dir;
          }
          d.x += vx * dt;
          if (d.h > 0 || d.vh > 0) {
            d.h = Math.max(0, d.h + d.vh * dt);
            d.vh -= GRAVITY * dt;
            if (d.h === 0) d.vh = 0;
          }
          // Legs cycle with distance covered; tucked mid-air.
          if (moving && d.h === 0) {
            d.stride += Math.abs(vx) * dt;
            if (d.stride > 13) {
              d.stride = 0;
              d.leg = d.leg === 0 ? 1 : 0;
            }
          }

          // Catch the loose ball.
          // Only once it's on its way down (or rolling), and not straight
          // back into the thrower's mouth.
          if (
            ball &&
            !d.hasBall &&
            ball.vh <= 0 &&
            ball.h < 22 &&
            Math.abs(ball.x - d.x) < 18 &&
            (ball.by !== i || now - ball.at > 700)
          ) {
            d.hasBall = true;
            ball = null;
            tossed = false;
            d.vh = Math.max(d.vh, 240); // a happy little bounce
          }
        });

        // The loose ball: arc, bounce, roll.
        if (ball) {
          ball.x += ball.vx * dt;
          ball.h += ball.vh * dt;
          ball.vh -= GRAVITY * 0.9 * dt;
          if (ball.h <= 0) {
            ball.h = 0;
            if (ball.bounces < 2) {
              ball.vh = -ball.vh * 0.45;
              ball.bounces += 1;
            } else {
              ball.vh = 0;
            }
            ball.vx *= 0.8;
          }
        }

        dogs.forEach((d, i) => {
          const el = dogRefs[i].current;
          if (el) el.style.transform = `translate3d(${d.x.toFixed(1)}px, ${(-d.h).toFixed(1)}px, 0)`;
        });
        if (ballRef.current) {
          ballRef.current.style.opacity = ball ? "1" : "0";
          if (ball) ballRef.current.style.transform = `translate3d(${ball.x.toFixed(1)}px, ${(-ball.h).toFixed(1)}px, 0)`;
        }
        push(dogs);

        const gone = dogs.every((d) => (dir === 1 ? d.x > W + 110 : d.x < -110));
        if (gone) {
          if (tick) clearInterval(tick);
          tick = null;
          waitT = setTimeout(run, rand(4500, 9000));
        }
      }, 16);
    };

    waitT = setTimeout(run, rand(600, 1600));
    return () => {
      cancelled = true;
      clearTimeout(waitT);
      if (tick) clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={wrapRef} className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`} style={{ height: 96 }} aria-hidden>
      <div ref={ballRef} className="absolute bottom-[3px] left-0" style={{ opacity: 0, width: 10, height: 10, marginLeft: -5 }}>
        <svg viewBox="0 0 16 16" width={10} height={10}>
          <circle cx={8} cy={8} r={7.2} fill="#cddc39" stroke="#aebb28" strokeWidth={1} />
          <path d="M 2.5 5 Q 8 9 13.5 5" stroke="#f3f8cf" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </svg>
      </div>
      {poses.map((p, i) => (
        <div key={i} ref={dogRefs[i]} className="absolute bottom-0 left-0" style={{ transform: "translate3d(-200px, 0, 0)", marginLeft: -22 }}>
          <div className={p.bow ? "animate-ozho-bow" : ""} style={{ ["--face" as string]: p.facing }}>
            <PixelDog
              size={i === 0 ? 44 : 40}
              variant={i === 0 ? "ozho" : "mochi"}
              mood="happy"
              legFrame={p.air ? 1 : p.leg}
              tailFrame={tail}
              facing={p.facing}
              carryingBall={p.ball}
            />
          </div>
        </div>
      ))}
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
