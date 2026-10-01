"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Pattern } from "@/data/curriculum";
import { PixelDog } from "@/components/PixelDog";
import { lessonVideoFor } from "@/lib/lessonVideos";
import { voiceFor } from "@/lib/lessonVideos/voice";
import { LessonVideo } from "./LessonVideo";
import { buildTimeline } from "./timeline";

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

  return <PinnedVideo script={script} example={example} skillName={skillName} voice={voice} onClose={() => setOpen(false)} patternName={pattern.name} />;
}

// Where the video's Ozho walks in: the photo's left edge, on its floor,
// in page coordinates (what the page companion uses).
function entryPoint(root: HTMLElement | null) {
  const photo = root?.querySelector(".lv-photo");
  const stage = root?.querySelector(".lv-stage") as HTMLElement | null;
  if (!photo || !stage) return null;
  const r = photo.getBoundingClientRect();
  const scale = stage.getBoundingClientRect().width / 800;
  return { x: r.left + window.scrollX - 10 * scale, y: r.bottom + window.scrollY - 62 * scale };
}

function PinnedVideo({
  script,
  example,
  skillName,
  voice,
  onClose,
  patternName,
}: {
  script: NonNullable<ReturnType<typeof lessonVideoFor>>;
  example: Pattern["examples"][number];
  skillName: string;
  voice: ReturnType<typeof voiceFor>;
  onClose: () => void;
  patternName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Hold just before Ozho's walk-in until the page's Ozho has hopped in.
  const [hold, setHold] = useState<number | null>(0.6);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const release = () => setHold(null);
    window.addEventListener("ozho:boarded", release);
    // Once the Polaroid has landed, call him over. If he's not on this
    // page (or never answers), start anyway.
    const call = setTimeout(() => {
      const to = entryPoint(ref.current);
      if (to) window.dispatchEvent(new CustomEvent("ozho:board", { detail: to }));
    }, 380);
    const fallback = setTimeout(release, 2600);
    return () => {
      window.removeEventListener("ozho:boarded", release);
      clearTimeout(call);
      clearTimeout(fallback);
    };
  }, [mounted]);
  // Closing: Ozho hops back out, and the Polaroid lifts off the page.
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => {
    if (closing) return;
    window.dispatchEvent(new CustomEvent("ozho:unboard", { detail: entryPoint(ref.current) ?? undefined }));
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
        <LessonVideo key={patternName} script={script} example={example} skillName={skillName} voice={voice} autoPlay floating hold={hold} />
        <button type="button" className="lv-pin-close" onClick={close} aria-label="Close video">
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
