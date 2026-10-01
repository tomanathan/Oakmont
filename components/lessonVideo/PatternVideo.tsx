"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Pattern } from "@/data/curriculum";
import { PixelDog } from "@/components/PixelDog";
import { lessonVideoFor } from "@/lib/lessonVideos";
import { voiceFor } from "@/lib/lessonVideos/voice";
import { LessonVideo } from "./LessonVideo";
import { buildTimeline, ozhoAtEdge } from "./timeline";

// The lesson page's way in: a small "Watch Ozho explain it" card under a
// question type's name. Opening it stamps the video's Polaroid down over
// the page, and the Ozho wandering the page runs over and hops into it
// (the video holds until he's in), so the dog in the video is him. Closing
// it lets him hop back out. `pattern` must be
// the curriculum's own (unshuffled) pattern: the video's cross-outs refer
// to the worked example's original choice order.
export function PatternVideo({ subskillId, skillName, pattern }: { subskillId: string; skillName: string; pattern: Pattern }) {
  const script = lessonVideoFor(subskillId, pattern.name);
  const [open, setOpen] = useState(false);
  const example = script ? pattern.examples[script.example] : undefined;
  const voice = script ? voiceFor(script) : undefined;
  const minutes = useMemo(() => {
    if (!script || !example) return "";
    const d = Math.round(buildTimeline(script, example, voice).duration);
    return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`;
  }, [script, example, voice]);
  if (!script || !example) return null;

  if (!open)
    return (
      <button type="button" className="lv-open" onClick={() => setOpen(true)}>
        <span className="lv-open-dog" aria-hidden>
          <PixelDog size={46} mood="happy" shadow={false} />
        </span>
        <span className="lv-open-t">
          <b>Watch Ozho explain it</b>
          <small>
            {minutes} · the idea, then this worked example step by step{voice ? "" : " (captions)"}
          </small>
        </span>
        <span className="lv-open-play" aria-hidden>
          ▶
        </span>
      </button>
    );

  return (
    <PinnedVideo
      script={script}
      example={example}
      skillName={skillName}
      voice={voice}
      onClose={() => setOpen(false)}
      patternName={pattern.name}
      entryAt={ozhoAtEdge(buildTimeline(script, example, voice))}
    />
  );
}

// The page's Ozho is a 44px-wide sprite; the video's is the same drawing,
// bigger. These give the in-video Ozho's centre (page coordinates) and its
// size relative to the page's, so the hop in and out can match exactly.
const PAGE_OZHO_W = 44;
function videoOzho(root: HTMLElement | null, at: "entry" | "now") {
  const stage = root?.querySelector(".lv-stage") as HTMLElement | null;
  const walker = root?.querySelector(".lv-ozho") as HTMLElement | null;
  const watcher = root?.querySelector(".lv-watch") as HTMLElement | null;
  if (!stage || !walker) return null;
  const s = stage.getBoundingClientRect().width / 800;
  // Down in the caption strip watching? Then that's where he is.
  const el = at === "now" && watcher && Number(getComputedStyle(watcher).opacity) > 0.5 ? watcher : walker;
  const svg = el.querySelector("svg");
  if (!svg) return null;
  const r = svg.getBoundingClientRect();
  // At entry: where he'll be when he's exactly at the photo's edge (x = 0),
  // undoing however far along his walk-in transform currently has him.
  // The Polaroid rests at a slight tilt, so walking along its floor
  // changes his height a little too.
  const dx = at === "entry" ? -Number(/translate\(([-\d.]+)px/.exec(walker.style.transform)?.[1] ?? 0) * s : 0;
  const pol = root?.querySelector(".lv-pol") as HTMLElement | null;
  const tilt = (Number(/rotate\(([-\d.]+)deg/.exec(pol?.style.transform ?? "")?.[1] ?? 0) * Math.PI) / 180;
  return { x: r.left + r.width / 2 + dx + window.scrollX, y: r.top + r.height / 2 + dx * Math.tan(tilt) + window.scrollY, scale: r.width / PAGE_OZHO_W };
}

function PinnedVideo({
  script,
  example,
  skillName,
  voice,
  onClose,
  patternName,
  entryAt,
}: {
  script: NonNullable<ReturnType<typeof lessonVideoFor>>;
  example: Pattern["examples"][number];
  skillName: string;
  voice: ReturnType<typeof voiceFor>;
  onClose: () => void;
  patternName: string;
  entryAt: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Hold the video where its Ozho reaches the photo's edge (hidden until
  // then) while the page's Ozho runs over and hops into exactly that spot
  // at exactly that size; then they swap in one frame.
  const [hold, setHold] = useState<number | null>(entryAt);
  useEffect(() => setMounted(true), []);
  // Swap once both are true: he's hopped into place, and the video has
  // reached that moment.
  const boarded = useRef(false);
  const atEntry = useRef(false);
  const swapped = useRef(false);
  const swap = useCallback(() => {
    if (swapped.current) return;
    swapped.current = true;
    setHold(null);
    window.dispatchEvent(new CustomEvent("ozho:swap"));
  }, []);
  const onHold = useCallback(() => {
    atEntry.current = true;
    if (boarded.current) swap();
  }, [swap]);
  useEffect(() => {
    if (!mounted) return;
    const onBoarded = () => {
      boarded.current = true;
      if (atEntry.current) swap();
    };
    window.addEventListener("ozho:boarded", onBoarded);
    // Once the Polaroid has landed and settled, call him over. If he's not on this
    // page (or never answers), start anyway.
    const call = setTimeout(() => {
      const to = videoOzho(ref.current, "entry");
      if (to) window.dispatchEvent(new CustomEvent("ozho:board", { detail: to }));
    }, 650);
    const fallback = setTimeout(swap, 4000);
    return () => {
      window.removeEventListener("ozho:boarded", onBoarded);
      clearTimeout(call);
      clearTimeout(fallback);
    };
  }, [mounted, swap]);
  // Closing: Ozho hops back out, and the Polaroid lifts off the page.
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => {
    if (closing) return;
    window.dispatchEvent(new CustomEvent("ozho:unboard", { detail: videoOzho(ref.current, "now") ?? undefined }));
    setClosing(true);
    setTimeout(onClose, 220);
  }, [onClose, closing]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);
  // Whatever happens, never leave him stuck inside a closed video.
  useEffect(() => () => void window.dispatchEvent(new CustomEvent("ozho:unboard")), []);

  if (!mounted) return null;
  return createPortal(
    <div className={`lv-pin ${closing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={`Video: ${script.pattern}`}>
      <div className="lv-pin-back" onClick={close} />
      <div className="lv-pin-card" ref={ref}>
        <LessonVideo key={patternName} script={script} example={example} skillName={skillName} voice={voice} autoPlay floating hold={hold} ozhoAway={hold !== null} onHold={onHold} />
        <button type="button" className="lv-pin-close" onClick={close} aria-label="Close video">
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
