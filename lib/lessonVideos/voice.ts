import type { VoiceTrack } from "@/components/lessonVideo/timeline";
import manifest from "./audio.json";
import { videoSlug } from "./index";

// Ozho's generated voice tracks (scripts/voice/generate.py writes both the
// mp3s in public/lesson-audio and this manifest). A video without an entry
// still plays, captions only.
const TRACKS = manifest as unknown as Record<string, VoiceTrack>;

export function voiceFor(v: { subskillId: string; pattern: string }): VoiceTrack | undefined {
  return TRACKS[videoSlug(v)];
}
