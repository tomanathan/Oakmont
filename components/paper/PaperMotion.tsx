"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE, routeChanged, setNavigator, turnTo } from "./turn";

// Mounted once in the root layout. Three things, all about the page being
// paper:
//   - links between notebook screens turn the page (see turn.ts);
//   - anything you click presses down into the desk, its shadow
//     tucking under it, and springs back up;
//   - the SVG filter that gives a rubber stamp its worn ink.

const PRESSABLE = 'button, a[href], [role="radio"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"], summary, label[for], label:has(input)';

// Ozho's paw, as markup (stamped straight onto the page, outside React).
const PAW =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16.2" rx="5.6" ry="4.6"/><ellipse cx="5.2" cy="10.4" rx="2.2" ry="2.8" transform="rotate(-18 5.2 10.4)"/><ellipse cx="9.4" cy="6.2" rx="2.3" ry="3" transform="rotate(-6 9.4 6.2)"/><ellipse cx="14.6" cy="6.2" rx="2.3" ry="3" transform="rotate(6 14.6 6.2)"/><ellipse cx="18.8" cy="10.4" rx="2.2" ry="2.8" transform="rotate(18 18.8 10.4)"/></svg>';

/** A dark, inky button (the blue and navy ones): worth a paw print. */
function isInky(bg: string): boolean {
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(bg);
  if (!m) return false;
  const [r, g, b, a] = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  return a > 0.6 && b > r + 40 && 0.2126 * r + 0.7152 * g + 0.0722 * b < 130;
}

/** Press Ozho's paw onto the page at (x, y); it dries away on its own. */
function inkPaw(x: number, y: number) {
  const s = document.createElement("span");
  s.className = "paw-ink";
  s.style.setProperty("--x", `${x}px`);
  s.style.setProperty("--y", `${y}px`);
  s.style.setProperty("--r", `${Math.round(Math.random() * 50 - 25)}deg`);
  s.innerHTML = PAW;
  document.body.append(s);
  window.setTimeout(() => s.remove(), 800);
}

/** The same shadow, pressed `d` px closer to the desk. */
function pressedShadow(shadow: string, d: number): string | null {
  if (!shadow || shadow === "none") return null;
  let changed = false;
  const parts = shadow.split(/,(?![^(]*\))/).map((part) => {
    if (/inset/.test(part)) return part;
    let i = 0;
    return part.replace(/(-?[\d.]+)px/g, (m, n) => {
      i++;
      if (i > 2) return m;
      const v = parseFloat(n);
      if (v <= 0) return m;
      changed = true;
      return `${Math.max(0, v - d)}px`;
    });
  });
  return changed ? parts.join(",") : null;
}

function usePress() {
  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest?.(PRESSABLE) as HTMLElement | null;
      if (!el || el.closest("[data-no-press]")) return;
      if (el.matches(":disabled, [aria-disabled='true']")) return;
      const cs = getComputedStyle(el);
      if (cs.display === "inline") return;
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      // Whole-screen panels aren't buttons you press.
      if (area > window.innerWidth * window.innerHeight * 0.35) return;
      // The big blue buttons get a paw print where you pressed.
      if (el.tagName !== "A" || el.className.includes("rounded")) {
        if (isInky(cs.backgroundColor)) inkPaw(e.clientX, e.clientY);
      }
      const shadow = cs.boxShadow;
      // Offset (paper) shadows: press it the full way onto its shadow.
      // Everything else just gives a little.
      const m = /(-?[\d.]+)px (-?[\d.]+)px/.exec(shadow === "none" ? "" : shadow);
      const off = m ? Math.min(parseFloat(m[1]), parseFloat(m[2])) : 0;
      const d = off > 0 ? Math.min(off, 3) : 1;
      // Moving a shadow repaints the element each frame: fine for a button,
      // not for a big card, which just moves (still on the compositor).
      const pressed = off > 0 && area < 60000 ? pressedShadow(shadow, d) : null;
      const down: Keyframe = { translate: `${d}px ${d}px`, ...(pressed ? { boxShadow: pressed } : {}) };
      const up: Keyframe = { translate: "0px 0px", ...(pressed ? { boxShadow: shadow } : {}) };
      const press = el.animate([up, down], { duration: 70, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" });
      const release = () => {
        window.removeEventListener("pointerup", release, true);
        window.removeEventListener("pointercancel", release, true);
        // Springs back up, a hair past where it started, then settles.
        const over: Keyframe = { translate: `${-d * 0.25}px ${-d * 0.25}px` };
        el.animate([down, over, up], { duration: 260, easing: "cubic-bezier(.2,.8,.3,1)" });
        press.cancel();
      };
      window.addEventListener("pointerup", release, true);
      window.addEventListener("pointercancel", release, true);
    }
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, []);
}

function useTurns() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    setNavigator((href) => router.push(href));
    return () => setNavigator(null);
  }, [router]);
  useEffect(() => {
    routeChanged();
  }, [pathname, search]);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.closest("[data-no-turn]")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return;
      // Same screen (a #section link): nothing to turn.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      // Only from a notebook page (anywhere on it, or its top bar).
      if (!document.querySelector(PAGE)) return;
      e.preventDefault();
      turnTo(url.pathname + url.search + url.hash);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}

export function PaperMotion() {
  usePress();
  useTurns();
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        {/* A rubber stamp's impression: ink that didn't quite take in
            places, and a soft, uneven edge. */}
        <filter id="paper-stamp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="11" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.65" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" result="worn" />
          <feDisplacementMap in="worn" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
