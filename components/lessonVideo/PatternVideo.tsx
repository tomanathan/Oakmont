"use client";

import { useMemo, useState } from "react";
import type { Pattern } from "@/data/curriculum";
import { PixelDog } from "@/components/PixelDog";
import { lessonVideoFor } from "@/lib/lessonVideos";
import { voiceFor } from "@/lib/lessonVideos/voice";
import { LessonVideo } from "./LessonVideo";
import { buildTimeline } from "./timeline";

// The lesson page's way in: a small "Watch Ozho explain it" card under a
// question type's name, which opens the video in place. `pattern` must be
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
    <div className="lv-embed">
      <LessonVideo key={pattern.name} script={script} example={example} skillName={skillName} voice={voice} autoPlay />
      <button type="button" className="lv-close" onClick={() => setOpen(false)}>
        Close video
      </button>
    </div>
  );
}
