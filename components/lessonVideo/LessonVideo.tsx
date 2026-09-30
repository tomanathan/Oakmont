"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { WorkedExample } from "@/data/curriculum";
import type { LessonVideoScript } from "@/lib/lessonVideos/types";
import { PixelDog } from "@/components/PixelDog";
import { beatAt, buildTimeline, type Timeline, type VoiceTrack } from "./timeline";
import { sfx } from "./sfx";
import "./lessonVideo.css";

// A lesson video that's drawn, not streamed: a Polaroid slaps onto the
// notebook page, Ozho walks into it, and he teaches the question type on a
// little board, then walks through one of the lesson's own worked
// examples. Everything on screen is a pure function of the playhead, so it
// scrubs, replays and pauses like a video. Captions carry every line (the
// sound is only small effects), so it works muted.

const W = 800; // design size; the stage scales to its container
const H = 500;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const outBack = (p: number) => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
const LETTERS = ["A", "B", "C", "D"];

export function LessonVideo({
  script,
  example,
  skillName,
  autoPlay = false,
  frameTime,
  voice,
}: {
  script: LessonVideoScript;
  example: WorkedExample;
  skillName: string;
  autoPlay?: boolean;
  // Set to render one fixed frame (for capture); disables the controls.
  frameTime?: number;
  // Ozho's recorded voice for this video, when it exists.
  voice?: VoiceTrack;
}) {
  const tl = useMemo(() => buildTimeline(script, example, voice), [script, example, voice]);
  // With a voice track, the audio element is the clock (no drift).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!voice) return;
    const a = new Audio(voice.src);
    a.preload = "auto";
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, [voice]);
  const [t, setT] = useState(frameTime ?? 0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sound, setSound] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const last = useRef<number | null>(null);
  const tRef = useRef(t);
  tRef.current = t;

  // Fit the 800x500 stage to the container width.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The clock.
  useEffect(() => {
    if (!playing || frameTime !== undefined) return;
    let raf = 0;
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = ((now - last.current) / 1000) * speed;
        const prev = tRef.current;
        const a = audioRef.current;
        const next = Math.min(tl.duration, a && !a.paused ? a.currentTime : prev + dt);
        if (sound) sfx.cues(tl, prev, next);
        setT(next);
        if (next >= tl.duration) {
          setPlaying(false);
          last.current = null;
          return;
        }
      }
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      last.current = null;
    };
  }, [playing, speed, sound, tl, frameTime]);

  const play = useCallback(() => {
    setStarted(true);
    const from = tRef.current >= tl.duration ? 0 : tRef.current;
    if (from === 0) setT(0);
    sfx.unlock();
    const a = audioRef.current;
    if (a) {
      a.currentTime = from;
      void a.play().catch(() => {});
    }
    setPlaying(true);
  }, [tl.duration]);
  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);
  // Keep the voice in step with speed and sound settings.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = speed;
    a.muted = !sound;
  }, [speed, sound, voice]);
  useEffect(() => {
    if (!playing) audioRef.current?.pause();
  }, [playing]);

  useEffect(() => {
    if (autoPlay) play();
  }, [autoPlay, play]);

  const now = frameTime ?? t;
  const beat = beatAt(tl, now);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <figure className="lv" aria-label={`Video: ${script.pattern}`}>
      <div className="lv-box" ref={boxRef} style={{ height: H * scale }}>
        <div className="lv-stage" style={{ width: W, height: H, transform: `scale(${scale})` }} aria-hidden>
          <Stage tl={tl} t={now} script={script} example={example} skillName={skillName} />
        </div>
        {/* What's said, for screen readers (the stage itself is decoration). */}
        <p className="lv-sr" aria-live="polite">
          {beat?.say ?? ""}
        </p>
        {frameTime === undefined && !started && (
          <button type="button" className="lv-bigplay" onClick={play} aria-label={`Play: ${script.pattern}`}>
            <span className="lv-bigplay-dot">▶</span>
            <span className="lv-bigplay-t">
              Watch Ozho explain it <small>{fmt(tl.duration)}</small>
            </span>
          </button>
        )}
      </div>
      {frameTime === undefined && (
        <div className="lv-bar">
          <button type="button" className="lv-btn" onClick={() => (playing ? pause() : play())} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <input
            className="lv-scrub"
            type="range"
            min={0}
            max={tl.duration}
            step={0.05}
            value={now}
            aria-label="Seek"
            onChange={(e) => {
              setStarted(true);
              const v = Number(e.target.value);
              setT(v);
              if (audioRef.current) audioRef.current.currentTime = v;
            }}
          />
          <span className="lv-time">
            {fmt(now)} / {fmt(tl.duration)}
          </span>
          <button type="button" className="lv-btn lv-btn--txt" onClick={() => setSpeed((s) => (s === 1 ? 1.5 : 1))} aria-label="Playback speed">
            {speed}×
          </button>
          {voice && (
            <span className="lv-ai" title="Ozho's voice is generated with AI">
              AI voice
            </span>
          )}
          <button type="button" className="lv-btn lv-btn--txt" onClick={() => setSound((s) => !s)} aria-label={sound ? "Mute" : "Unmute"}>
            {sound ? "🔊" : "🔈"}
          </button>
        </div>
      )}
    </figure>
  );
}

function Stage({ tl, t, script, example, skillName }: { tl: Timeline; t: number; script: LessonVideoScript; example: WorkedExample; skillName: string }) {
  const beat = beatAt(tl, t);
  const kind = beat?.kind;
  const first = (k: string) => tl.beats.find((b) => b.kind === k)!;
  const qAt = first("question").start;
  const ansAt = first("answer").start;
  const trapAt = first("trap").start;
  const recapAt = first("recap").start;

  // The Polaroid slaps down, then its tape.
  const slap = prog(t, 0, tl.slapAt);
  const pol = {
    opacity: clamp(slap * 3),
    transform: `translateY(${(1 - slap) * -30}px) scale(${1.22 - 0.22 * outBack(slap)}) rotate(${-6 + 4.8 * slap}deg)`,
  };
  const tape = prog(t, tl.slapAt, tl.slapAt + 0.2);

  // Ozho walks in from the left edge of the page into the photo.
  const walk = prog(t, tl.walkStart, tl.walkEnd);
  const walking = t > tl.walkStart && t < tl.walkEnd;
  const ozX = -170 + walk * (70 + 170);
  const beatStart = beat?.start ?? 0;
  const hop = t > tl.walkEnd && t - beatStart < 0.3 ? Math.sin(((t - beatStart) / 0.3) * Math.PI) * 10 : 0;
  const happy = t >= ansAt;
  const leg = walking ? ((Math.floor(t * 8) % 2) as 0 | 1) : 0;
  const tail = (Math.floor(t * 9) % 6) as 0 | 1 | 2 | 3 | 4 | 5;

  // The board's current card.
  const card = t < first("idea").start ? "title" : t < qAt ? "idea" : t < trapAt ? "question" : t < recapAt ? "trap" : "recap";
  const cardIn = (at: number) => clamp((t - at) / 0.35);
  // During the worked example the board takes the whole photo and Ozho
  // hops down into the caption strip to watch; he hops back for the trap.
  const wide = card === "question";
  const down = clamp(prog(t, qAt - 0.1, qAt + 0.3) - prog(t, trapAt - 0.1, trapAt + 0.3));

  return (
    <div className="lv-page">
      <div className="lv-pol" style={pol}>
        <span className="lv-tape lv-tape--a" style={{ opacity: tape }} />
        <span className="lv-tape lv-tape--b" style={{ opacity: tape }} />
        <div className="lv-photo">
          <div className="lv-wall" />
          <div className="lv-floor" />
          <div className={`lv-board ${wide ? "is-wide" : ""}`}>
            {card === "title" && (
              <div className="lv-title" style={{ opacity: cardIn(tl.slapAt + 0.3) }}>
                <span className="lv-kicker">{skillName}</span>
                <b>{script.pattern}</b>
              </div>
            )}
            {card === "idea" && (
              <ol className="lv-points">
                {script.idea.map((p, i) => {
                  const at = tl.beats.find((b) => b.kind === "idea" && b.i === i)!.start;
                  const a = cardIn(at);
                  return t >= at ? (
                    <li key={i} style={{ opacity: a, transform: `translateX(${(1 - a) * -14}px)` }}>
                      <span className="lv-num">{i + 1}</span>
                      {p.point}
                    </li>
                  ) : null;
                })}
              </ol>
            )}
            {card === "question" && <QuestionCard tl={tl} t={t} example={example} ansAt={ansAt} appear={cardIn(qAt)} />}
            {card === "trap" && (
              <div className="lv-note lv-note--trap" style={{ opacity: cardIn(trapAt), transform: `rotate(-2deg) scale(${0.9 + 0.1 * outBack(cardIn(trapAt))})` }}>
                <span className="lv-kicker">Watch out</span>
                <b>{script.trap.point}</b>
              </div>
            )}
            {card === "recap" && (
              <div className="lv-note lv-note--recap" style={{ opacity: cardIn(recapAt), transform: `rotate(1.5deg) scale(${0.9 + 0.1 * outBack(cardIn(recapAt))})` }}>
                <span className="lv-kicker">Remember</span>
                <b>{script.recap.point}</b>
              </div>
            )}
          </div>
          <div className="lv-ozho" style={{ transform: `translate(${ozX}px, ${-hop + down * 190}px)` }}>
            <PixelDog size={128} mood={happy ? "happy" : "neutral"} legFrame={leg} tailFrame={tail} shadow />
          </div>
        </div>
        <div className="lv-watch" style={{ opacity: clamp(down * 2 - 1), transform: `translateY(${(1 - down) * 30}px)` }}>
          <PixelDog size={74} mood={happy ? "happy" : "neutral"} tailFrame={tail} sitting shadow={false} />
        </div>
        <div className={`lv-cap ${down > 0.5 ? "is-narrow" : ""}`}>
          {beat && (
            <p key={beat.start} className="lv-cap-t">
              {beat.say}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ tl, t, example, ansAt, appear }: { tl: Timeline; t: number; example: WorkedExample; ansAt: number; appear: number }) {
  // Passage with marker sweeps: each highlight fills over 0.5s from its beat.
  const parts: { text: string; mark?: number }[] = [];
  let pos = 0;
  for (const m of tl.marks) {
    if (m.from < pos) continue;
    if (m.from > pos) parts.push({ text: tl.passage.slice(pos, m.from) });
    parts.push({ text: tl.passage.slice(m.from, m.to), mark: m.at });
    pos = m.to;
  }
  if (pos < tl.passage.length) parts.push({ text: tl.passage.slice(pos) });
  const answered = t >= ansAt;
  const circle = prog(t, ansAt, ansAt + 0.5);
  // Longer choices stack in one column; longer passages set a touch smaller.
  const longest = Math.max(...example.choices.map((c) => c.length));
  const passageWords = tl.passage.split(/\s+/).length;
  const dense = passageWords + tl.prompt.split(/\s+/).length > 60;
  // Short passage: across the top, choices in a grid below. Long passage:
  // passage on the left, prompt and choices on the right.
  const stack = passageWords < 48;

  // Shrink to fit the board: measured once per layout, then fixed, so every
  // frame of the video is the same size.
  const fitRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const outer = fitRef.current;
    const inner = outer?.firstElementChild as HTMLElement | null;
    if (!outer || !inner) return;
    let f = 1;
    for (let i = 0; i < 4; i++) {
      inner.style.width = `${100 / f}%`;
      inner.style.transform = `scale(${f})`;
      const natural = inner.scrollHeight;
      const room = outer.clientHeight;
      if (natural * f <= room + 1) break;
      f = Math.max(0.62, (room / natural) * 0.985);
    }
    setFit(f);
  }, [tl]);

  return (
    <div className="lv-q-fit" ref={fitRef} style={{ opacity: appear }}>
    <div
      className={`lv-q ${stack ? "lv-q--stack" : "lv-q--cols"} ${longest > 32 ? "lv-q--list" : ""} ${longest > 110 ? "lv-q--xlong" : ""} ${dense ? "lv-q--dense" : ""}`}
      style={{ width: `${100 / fit}%`, transform: `scale(${fit})` }}
    >
      <p className="lv-passage">
        {parts.map((p, i) =>
          p.mark === undefined ? (
            <span key={i}>{p.text}</span>
          ) : (
            <mark key={i} style={{ backgroundSize: `${prog(t, p.mark, p.mark + 0.5) * 100}% 100%` }}>
              {p.text}
            </mark>
          ),
        )}
      </p>
      {tl.prompt && <p className="lv-prompt">{tl.prompt}</p>}
      <div className="lv-choices">
        {example.choices.map((c, i) => {
          const strike = tl.strikes.find((s) => s.choice === i);
          const struck = strike ? prog(t, strike.at, strike.at + 0.35) : 0;
          const isAnswer = i === example.answer;
          return (
            <div key={i} className={`lv-choice ${struck > 0 ? "is-struck" : ""} ${struck > 0.5 ? "is-crossed" : ""} ${answered && isAnswer ? "is-right" : ""}`}>
              <span className="lv-letter">{answered && isAnswer ? "✓" : LETTERS[i]}</span>
              <span className="lv-ctext">
                {c}
              </span>
              {isAnswer && answered && c.length <= 40 && (
                <svg className="lv-circle" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <path
                    d="M12 34 C 10 10, 80 4, 150 8 S 196 26, 188 40 S 110 58, 50 54 S 4 44, 20 22"
                    pathLength={1}
                    style={{ strokeDasharray: 1, strokeDashoffset: 1 - circle }}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
