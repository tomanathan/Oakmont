"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PET_NAME, type PetStage } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";

export type OzhoAction = "pet" | "trick" | "next" | "fetch" | "sit" | "follow" | "wardrobe";

const STAGE_PILL: Record<PetStage, { label: string; cls: string }> = {
  thriving: { label: "Thriving", cls: "bg-[#eaf6ef] text-accent" },
  content: { label: "Doing fine", cls: "bg-[#eaf1e5] text-[#2c4c3b]" },
  hungry: { label: "Hungry", cls: "bg-[#fbf1df] text-[#9a6a12]" },
  critical: { label: "In trouble", cls: "bg-[#fbeaea] text-[#b23b3b]" },
  dead: { label: "Gone", cls: "bg-[#f1ece2] text-stone-500" },
};

const PANEL_W = 292;
const EDGE = 12;
// Rough height, for choosing above/below before the real one is measured.
const PANEL_H_GUESS = 290;

function statusLine(stage: PetStage | null, fedToday: boolean, streak: number) {
  const s = streak > 0 ? ` · ${streak}-day streak` : "";
  if (stage === "dead") return "A new pet is one click away in Settings.";
  if (fedToday) return `Fed today${s}`;
  if (stage === "critical") return "Hasn't eaten in days. One quiz saves him.";
  if (stage === "hungry") return "Getting hungry. Any quiz feeds him.";
  return `Not fed yet today${s}`;
}

// Ozho's panel: what used to be a ring of seven emoji buttons around him
// (labels colliding, half of them hard to read) is now one small card --
// how he's doing, the one thing worth doing next as a real link, and his
// tricks as a tidy grid. Anchored beside him on desktop; a bottom sheet on
// phones, where he's docked in the header corner.
export function OzhoPanel({
  anchor,
  stage,
  streak,
  fedToday,
  sitting,
  following,
  docked,
  onAction,
  onGo,
  onClose,
}: {
  // Ozho's position in viewport coordinates, or null for the phone sheet.
  anchor: { x: number; y: number } | null;
  stage: PetStage | null;
  streak: number;
  fedToday: boolean;
  sitting: boolean;
  following: boolean;
  // Docked in the phone header: he doesn't walk there, so the actions
  // that are about moving (fetch, sit, follow) aren't offered.
  docked: boolean;
  onAction: (a: OzhoAction) => void;
  onGo: (href: string) => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [next, setNext] = useState<{ label: string; href: string } | null | undefined>(undefined);
  const [place, setPlace] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    dedupedFetchJson<{ recommendation: { label: string; href: string } | null }>("/api/plan/next")
      .then((d) => !cancelled && setNext(d?.recommendation ?? null))
      .catch(() => !cancelled && setNext(null));
    return () => {
      cancelled = true;
    };
  }, []);

  // Beside him: above when there's room (his bubble lives there anyway and
  // is cleared while this is open), otherwise below; clamped on screen.
  useLayoutEffect(() => {
    if (!anchor) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = ref.current?.offsetHeight ?? PANEL_H_GUESS;
    const left = Math.min(Math.max(EDGE, anchor.x - PANEL_W / 2), vw - PANEL_W - EDGE);
    const above = anchor.y - 34 - h;
    const top = above >= EDGE ? above : Math.min(anchor.y + 30, vh - h - EDGE);
    setPlace({ left, top: Math.max(EDGE, top) });
  }, [anchor, next]);

  // Ozho re-renders many times a second (his tail wag), handing this a new
  // onClose each time -- held in a ref so focus and the Escape listener are
  // set up once per opening, not re-run (and focus yanked back) constantly.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Focus lands on the first useful control once the recommendation
  // (or its absence) is known.
  const focused = useRef(false);
  useEffect(() => {
    if (focused.current || next === undefined) return;
    focused.current = true;
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
  }, [next]);

  const pill = stage ? STAGE_PILL[stage] : null;
  const onNextPage = !!next && pathname === next.href;

  const allActions: { action: OzhoAction; label: string; icon: JSX.Element }[] = [
    { action: "pet", label: "Pet", icon: <HeartIcon /> },
    { action: "fetch", label: "Fetch", icon: <BallIcon /> },
    { action: "trick", label: "Trick", icon: <SparkIcon /> },
    { action: "sit", label: sitting ? "Get up" : "Sit", icon: <SitIcon /> },
    { action: "follow", label: following ? "Roam" : "Follow me", icon: <FollowIcon /> },
    { action: "wardrobe", label: "Wardrobe", icon: <HangerIcon /> },
  ];
  const actions = docked ? allActions.filter((a) => ["pet", "trick", "wardrobe"].includes(a.action)) : allActions;

  const sheet = !anchor;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`${PET_NAME}`}
      className={`pointer-events-auto fixed z-[60] rounded-2xl border border-[#ebe3d3] bg-white p-3.5 font-sans shadow-[0_18px_48px_-12px_rgba(38,34,24,0.28)] ${
        sheet ? "inset-x-3 bottom-3 animate-ozho-sheet" : "animate-ozho-panel"
      }`}
      style={
        sheet
          ? undefined
          : { width: PANEL_W, left: place?.left ?? -9999, top: place?.top ?? -9999, visibility: place ? "visible" : "hidden" }
      }
    >
      <div className="flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-[16px] font-semibold text-ink">{PET_NAME}</span>
            {pill && <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${pill.cls}`}>{pill.label}</span>}
          </div>
          <div className="mt-0.5 text-[12px] text-stone-500">{statusLine(stage, fedToday, streak)}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-[#f5f0e5] hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-3">
        {next === undefined ? (
          <div className="h-[52px] animate-pulse rounded-xl bg-[#f5f0e5]" />
        ) : next && !onNextPage ? (
          <button
            data-autofocus
            onClick={() => onGo(next.href)}
            className="group flex w-full items-center gap-3 rounded-xl bg-forest px-3.5 py-2.5 text-left text-white transition-colors hover:bg-[#1f2a23]"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/50">Up next</div>
              <div className="line-clamp-2 text-[13.5px] font-semibold leading-snug">{next.label}</div>
            </div>
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
              &rarr;
            </span>
          </button>
        ) : (
          <div className="rounded-xl bg-[#f6f1e6] px-3.5 py-2.5 text-[12.5px] text-stone-600">
            {onNextPage ? "You're on the next thing already. Go get it." : "All caught up on your plan. Nice."}
          </div>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5" role="menu">
        {actions.map((a, i) => {
          const on = (a.action === "sit" && sitting) || (a.action === "follow" && following);
          return (
            <button
              key={a.action}
              role="menuitem"
              data-autofocus={(next === null || onNextPage) && i === 0 ? true : undefined}
              onClick={() => onAction(a.action)}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#587356] ${
                on ? "bg-[#eaf1e5] text-[#2c4c3b]" : "text-stone-600 hover:bg-[#f6f1e6] hover:text-ink"
              }`}
            >
              <span className="flex h-5 items-center">{a.icon}</span>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function HeartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 16.5s-6-3.6-6-8.1A3.4 3.4 0 0 1 10 6.3a3.4 3.4 0 0 1 6 2.1c0 4.5-6 8.1-6 8.1Z" />
    </svg>
  );
}
function BallIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M4.2 7.3c2.6.6 4.2 2.6 4.2 5.6M15.8 12.7c-2.6-.6-4.2-2.6-4.2-5.6" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 3v3M10 14v3M3 10h3M14 10h3M5.2 5.2l1.9 1.9M12.9 12.9l1.9 1.9M14.8 5.2l-1.9 1.9M7.1 12.9l-1.9 1.9" />
    </svg>
  );
}
function SitIcon() {
  // A paw print: "sit" and "stay" are the paw-down commands.
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <ellipse cx="10" cy="13.2" rx="3.6" ry="3" />
      <ellipse cx="5.2" cy="9.2" rx="1.5" ry="1.9" />
      <ellipse cx="8" cy="5.8" rx="1.5" ry="1.9" />
      <ellipse cx="12" cy="5.8" rx="1.5" ry="1.9" />
      <ellipse cx="14.8" cy="9.2" rx="1.5" ry="1.9" />
    </svg>
  );
}
function FollowIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4l5.5 12 1.8-5.2L16.5 9 4 4Z" />
    </svg>
  );
}
function HangerIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10 7.5V6.8a1.9 1.9 0 1 0-1.9-1.9M10 7.5l7 5.3a1 1 0 0 1-.6 1.8H3.6a1 1 0 0 1-.6-1.8L10 7.5Z" />
    </svg>
  );
}
