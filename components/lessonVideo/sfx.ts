import type { Timeline } from "./timeline";

// Tiny synthesized sound effects (WebAudio, no files): a paper slap when the
// Polaroid lands, soft steps while Ozho walks in, a pop per beat, a ding on
// the answer. Quiet on purpose; the captions carry the lesson. With Ozho's
// voice, his lines mark each beat, so the per-beat pop is dropped (it landed
// on his first syllable) and the rest sit lower, under his voice.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, dur: number, gain: number, type: OscillatorType = "sine", slideTo?: number) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + dur);
}

function noise(dur: number, gain: number, lowpass: number) {
  const a = ac();
  if (!a) return;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  src.buffer = buf;
  f.type = "lowpass";
  f.frequency.value = lowpass;
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

const crossed = (at: number, prev: number, next: number) => prev < at && next >= at;

export const sfx = {
  unlock() {
    void ac()?.resume();
  },
  /** Plays whatever cues fall between the previous and current playhead. */
  cues(tl: Timeline, prev: number, next: number) {
    if (next - prev > 0.5) return; // a seek, not playback
    if (crossed(tl.slapAt, prev, next)) noise(0.16, 0.5, 1800);
    for (let s = tl.walkStart; s < tl.walkEnd; s += 0.25) if (crossed(s, prev, next)) noise(0.04, 0.12, 900);
    const under = tl.voiced ? 0.55 : 1;
    for (const b of tl.beats) {
      if (!crossed(b.start, prev, next)) continue;
      if (b.kind === "answer") {
        tone(988, 0.18, 0.12 * under, "triangle");
        setTimeout(() => tone(1319, 0.3, 0.12 * under, "triangle"), 110);
      } else if (!tl.voiced) tone(620, 0.09, 0.05, "sine", 880);
    }
    for (const s of tl.strikes) if (crossed(s.at, prev, next)) noise(0.12, 0.08 * under, 3200);
  },
};
