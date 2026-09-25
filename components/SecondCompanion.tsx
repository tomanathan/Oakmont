"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PixelDog } from "./PixelDog";
import { SECOND_PET_NAME } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";
import { companionBus, pointInText } from "@/lib/companionBus";

// Mochi: the second companion, earned at a long streak (see lib/pet.ts's
// SECOND_PET_UNLOCK_STREAK_DAYS) rather than mounted unconditionally like
// ScoutCompanion. Deliberately much simpler than Ozho: no dialogue, no
// speech bubble, no sleep state, no cursor reflex. Two voices talking over
// each other would undersell both, so Ozho does the talking and Mochi is
// his shadow -- she trots after him wherever he goes (reading his position
// off lib/companionBus.ts), settles a pace or two beside him, and hops
// along when he celebrates. When he isn't roaming (docked on a phone, or
// not mounted), she falls back to wandering on her own. Like Ozho she
// won't choose to stop on top of text, and fades while crossing it --
// using the text map he already keeps, rather than a second page scan.
const HIDDEN_ON = new Set(["/login"]);

const SIDE_MARGIN = 30;
const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 30;
// Slower than Ozho's 150px/s RUN_SPEED on purpose -- a visibly different
// gait is a big part of what makes two companions on screen at once read
// as two distinct animals rather than one sprite duplicated. When she's
// fallen well behind him she breaks into a trot to catch up.
const WALK_SPEED = 90;
const TROT_SPEED = 135;
const LEG_SWAP_MS = 130;
const TROT_LEG_SWAP_MS = 95;
// Slightly slower than Ozho's 45ms tail cadence -- same reasoning as the
// walk speed above, a small consistent difference in timing rather than
// identical motion.
const TAIL_SWAP_MS = 60;
const PAUSE_MIN_MS = 1200;
const PAUSE_MAX_MS = 3200;
const WANDER_MIN = 80;
const WANDER_MAX = 220;
// How far beside Ozho she settles, and how far behind counts as "fallen
// behind" (trot, short pauses). An Ozho position older than FRESH_MS means
// he's docked or gone -- wander instead.
const HEEL_OFFSET = 58;
const CATCH_UP_DIST = 170;
const RETARGET_DRIFT = 90;
const FRESH_MS = 600;
// Her body, for text checks: a 44px sprite centered on (x, y).
const BODY_HALF_W = 16;
const BODY_ABOVE = 12;
const BODY_BELOW = 14;
const BEHIND_TEXT_OPACITY = 0.4;
// Docked beside Ozho's phone badge, which (see ScoutCompanion's
// MOBILE_DOCK_*) is a 40px circle centered on his 30px sprite pinned 10px
// 10px from the right and 17px from the top -- i.e. spanning top 7 and
// right 5. Hers sits level with it, 6px further in.
const MOBILE_BREAKPOINT = 640;
const DOCK_BADGE = 40;
const DOCK_RIGHT = 5 + DOCK_BADGE + 6;
const DOCK_TOP = 7;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function SecondCompanion() {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [tailFrame, setTailFrame] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [isWalking, setIsWalking] = useState(false);
  const [perk, setPerk] = useState(false);
  const [behindText, setBehindText] = useState(false);
  const [sitting, setSitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const walkingRef = useRef(false);
  const speedRef = useRef(WALK_SPEED);
  // The Ozho position the current walk was aimed at, or null for a
  // free wander -- lets the loop re-aim if he runs off mid-walk.
  const followingRef = useRef<{ x: number; y: number } | null>(null);
  const pauseUntilRef = useRef(0);
  const legTimerRef = useRef(0);
  const tailTimerRef = useRef(0);
  const tailDirRef = useRef<1 | -1>(1);
  const lastFrameRef = useRef<number | null>(null);
  const behindTextRef = useRef(false);
  const sittingRef = useRef(false);
  const isMobileRef = useRef(false);
  const perkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Checks the same endpoint ScoutCompanion already polls for Ozho's own
  // state -- dedupedFetchJson collapses the two into one request, so
  // mounting this alongside Ozho doesn't double the network traffic.
  useEffect(() => {
    let cancelled = false;
    dedupedFetchJson<{ mochiUnlocked?: boolean }>("/api/pet/state")
      .then((data) => {
        if (!cancelled && data) setUnlocked(!!data.mochiUnlocked);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Unlocking mid-session (the quiz submission that lands the streak)
  // fires this instead of waiting on a reload -- see SubskillClient.
  useEffect(() => {
    function onUnlock() {
      setUnlocked(true);
    }
    window.addEventListener("ozho:mochi-unlocked", onUnlock);
    return () => window.removeEventListener("ozho:mochi-unlocked", onUnlock);
  }, []);

  // When Ozho celebrates, so does she -- a hop in place, a beat after his.
  useEffect(() => {
    function onCelebrate() {
      setTimeout(() => hop(), 180);
    }
    window.addEventListener("ozho:celebrate", onCelebrate);
    return () => window.removeEventListener("ozho:celebrate", onCelebrate);
  }, []);

  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    const vw0 = window.innerWidth || 800;
    const vh0 = window.innerHeight || 600;
    const startX = vw0 * 0.25;
    const startY = window.scrollY + Math.min(vh0 - 160, vh0 * 0.4);
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };
    pauseUntilRef.current = Date.now() + 500 + Math.random() * 800;

    function bounds() {
      const vw = window.innerWidth || 800;
      const vh = window.innerHeight || 600;
      const minX = window.scrollX + SIDE_MARGIN;
      const minY = window.scrollY + TOP_MARGIN;
      return {
        minX,
        maxX: Math.max(minX, window.scrollX + vw - SIDE_MARGIN),
        minY,
        maxY: Math.max(minY, window.scrollY + vh - BOTTOM_MARGIN),
      };
    }

    function onText(x: number, y: number) {
      return pointInText(x, y, BODY_HALF_W, BODY_ABOVE, BODY_BELOW);
    }

    function freshOzho() {
      const o = companionBus.ozho;
      return o && Date.now() - o.at < FRESH_MS ? o : null;
    }

    // A heel spot beside Ozho: on whichever side she's already on (so she
    // doesn't cut across him), then the other side, then lined up just
    // above or below him -- he often rests in a narrow gutter between
    // columns of text, where "beside" is always on the text but "behind"
    // stays in the gutter with him. Only if all of those are on text does
    // she settle for the nearest one (and fade, see behindText).
    function heelSpot(o: { x: number; y: number }) {
      const b = bounds();
      const pos = posRef.current;
      const side = pos.x < o.x ? -1 : 1;
      const vert = pos.y < o.y ? -1 : 1;
      const offsets: [number, number][] = [];
      for (const s of [side, -side]) for (const dy of [6, -18, 26]) offsets.push([s * (HEEL_OFFSET + Math.random() * 14), dy]);
      for (const v of [vert, -vert]) for (const dx of [side * 14, -side * 14, 0]) offsets.push([dx, v * (44 + Math.random() * 16)]);
      const candidates = offsets
        .map(([dx, dy]) => ({ x: clamp(o.x + dx, b.minX, b.maxX), y: clamp(o.y + dy, b.minY, b.maxY) }))
        // A viewport edge can clamp a candidate right back onto him.
        .filter((c) => Math.abs(c.x - o.x) > 30 || Math.abs(c.y - o.y) > 34);
      return candidates.find((c) => !onText(c.x, c.y)) ?? candidates[0] ?? wanderSpot();
    }

    function wanderSpot() {
      const b = bounds();
      const anchor = posRef.current;
      let spot = anchor;
      for (let tries = 0; tries < 10; tries++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
        spot = {
          x: clamp(anchor.x + Math.cos(angle) * radius, b.minX, b.maxX),
          y: clamp(anchor.y + Math.sin(angle) * radius, b.minY, b.maxY),
        };
        if (!onText(spot.x, spot.y)) break;
      }
      return spot;
    }

    function walkTo(target: { x: number; y: number }, following: { x: number; y: number } | null) {
      const pos = posRef.current;
      const far = Math.hypot(target.x - pos.x, target.y - pos.y) > CATCH_UP_DIST;
      targetRef.current = target;
      followingRef.current = following;
      speedRef.current = following && far ? TROT_SPEED : WALK_SPEED;
      setFacing(target.x >= pos.x ? 1 : -1);
      walkingRef.current = true;
      setIsWalking(true);
    }

    function pickNewTarget() {
      const o = freshOzho();
      // Mostly at his heel; now and then a short sniff around on her own,
      // so the pair doesn't read as one sprite dragging another.
      if (o && Math.random() < 0.85) walkTo(heelSpot(o), { x: o.x, y: o.y });
      else walkTo(wanderSpot(), null);
    }

    const intervalId = setInterval(() => {
      const now = performance.now();
      const dt = lastFrameRef.current == null ? 16 : Math.min(64, now - lastFrameRef.current);
      lastFrameRef.current = now;
      const nowMs = Date.now();

      tailTimerRef.current += dt;
      const swapMs = TAIL_SWAP_MS;
      if (tailTimerRef.current > swapMs) {
        tailTimerRef.current = 0;
        setTailFrame((f) => {
          let next = f + tailDirRef.current;
          if (next >= 5) {
            next = 5;
            tailDirRef.current = -1;
          } else if (next <= 0) {
            next = 0;
            tailDirRef.current = 1;
          }
          return next as 0 | 1 | 2 | 3 | 4 | 5;
        });
      }

      // Docked on a phone: nothing to walk, just the wag.
      if (isMobileRef.current) return;

      const o = freshOzho();
      if (!walkingRef.current) {
        // Resting, but he's wandered off -- don't wait out the whole pause.
        const pos = posRef.current;
        const leftBehind = o && Math.hypot(o.x - pos.x, o.y - pos.y) > CATCH_UP_DIST;
        // Sitting with him while he rests: she stays until he gets up.
        if (sittingRef.current && !leftBehind) {
          pauseUntilRef.current = Math.max(pauseUntilRef.current, nowMs + 600);
        } else if (nowMs > pauseUntilRef.current || (leftBehind && nowMs > pauseUntilRef.current - PAUSE_MIN_MS)) {
          pickNewTarget();
        }
      } else if (o && followingRef.current) {
        // He moved on mid-walk: re-aim at where he is now.
        const f = followingRef.current;
        if (Math.hypot(o.x - f.x, o.y - f.y) > RETARGET_DRIFT) walkTo(heelSpot(o), { x: o.x, y: o.y });
      }

      if (walkingRef.current) {
        legTimerRef.current += dt;
        if (legTimerRef.current > (speedRef.current > WALK_SPEED ? TROT_LEG_SWAP_MS : LEG_SWAP_MS)) {
          legTimerRef.current = 0;
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }

        const speed = speedRef.current;
        const pos = posRef.current;
        const target = targetRef.current;
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.hypot(dx, dy);
        const step = speed * (dt / 1000);
        if (dist <= step || dist < 1) {
          pos.x = target.x;
          pos.y = target.y;
          walkingRef.current = false;
          setIsWalking(false);
          // Settled beside Ozho: face him, like a dog waiting on its person.
          if (o && followingRef.current) setFacing(o.x >= pos.x ? 1 : -1);
          pauseUntilRef.current = nowMs + PAUSE_MIN_MS + Math.random() * (PAUSE_MAX_MS - PAUSE_MIN_MS);
        } else {
          pos.x += (dx / dist) * step;
          pos.y += (dy / dist) * step;
        }
      }

      // Settled beside him while he rests: she sits too.
      const pos = posRef.current;
      const sitNow =
        !walkingRef.current && !!o?.resting && Math.hypot(o.x - pos.x, o.y - pos.y) < CATCH_UP_DIST * 0.8;
      if (sitNow !== sittingRef.current) {
        sittingRef.current = sitNow;
        setSitting(sitNow);
      }

      const nowBehind = onText(posRef.current.x, posRef.current.y);
      if (nowBehind !== behindTextRef.current) {
        behindTextRef.current = nowBehind;
        setBehindText(nowBehind);
      }

      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${posRef.current.x}px`;
        wrapperRef.current.style.top = `${posRef.current.y}px`;
      }
    }, 16);

    return () => {
      clearInterval(intervalId);
    };
  }, [unlocked]);

  useEffect(() => {
    return () => {
      if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
    };
  }, []);

  // No dialogue, no bubble -- just a small hop of acknowledgment (the
  // same .animate-perk Ozho uses when he speaks) so clicking Mochi still
  // feels responsive rather than inert.
  function hop() {
    setPerk(true);
    if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
    perkTimeoutRef.current = setTimeout(() => setPerk(false), 300);
  }

  const hidden = HIDDEN_ON.has(pathname ?? "");
  if (!ready || !unlocked || hidden) return null;

  return (
    <div
      ref={wrapperRef}
      className={`absolute z-40 pointer-events-none transition-opacity duration-200 ${isMobile ? "flex items-center justify-center" : ""}`}
      style={
        isMobile
          ? { position: "fixed", right: DOCK_RIGHT, top: DOCK_TOP, width: DOCK_BADGE, height: DOCK_BADGE }
          : {
              left: posRef.current.x,
              top: posRef.current.y,
              transform: "translate(-50%, -50%)",
              opacity: behindText ? BEHIND_TEXT_OPACITY : 1,
            }
      }
    >
      {isMobile && (
        // Same white badge Ozho sits in when docked, so the pair reads as
        // two matching buttons in the corner rather than a sprite on text.
        <div className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(38,34,24,0.18)]" aria-hidden />
      )}
      <button
        onClick={hop}
        aria-label={`${SECOND_PET_NAME}, your second companion`}
        className={`pointer-events-auto relative block cursor-pointer bg-transparent border-none p-0 transition-transform duration-150 ease-out ${
          perk ? "animate-perk" : ""
        }`}
        style={{
          transform:
            isWalking && !isMobile
              ? `translateY(${legFrame === 1 ? -3 : 0}px) rotate(${legFrame === 1 ? (facing === 1 ? 2 : -2) : 0}deg)`
              : undefined,
        }}
      >
        <PixelDog
          size={isMobile ? 26 : 44}
          mood="happy"
          variant="mochi"
          legFrame={isWalking && !isMobile ? legFrame : 0}
          sitting={sitting && !isWalking && !isMobile}
          tailFrame={tailFrame}
          facing={isMobile ? 1 : facing}
          shadow={!isMobile}
        />
      </button>
    </div>
  );
}
