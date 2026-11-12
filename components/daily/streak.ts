// What the question of the day remembers in this browser, with no account:
// which days' questions were answered, whether each was right, how long it
// took, and the choice picked (so coming back later the same day shows the
// result again, not a fresh question). One localStorage key. Private
// browsing and some in-app browsers refuse storage or throw on it, so every
// access is guarded and the page works without it, just with no streak.

export const DAILY_STORE_KEY = "oakmont-daily";
export const DAILY_URL = "https://oakmontsat.com/daily";
export const DAILY_SHARE_URL = `${DAILY_URL}?utm_source=daily_share`;

// About a year and a month of days; older ones only ever fed the best
// streak, which is kept as its own number.
const KEEP_DAYS = 400;

export interface DailyEntry {
  /** The choice picked. */
  c: number;
  /** Right or not. */
  r: boolean;
  /** Time taken, in milliseconds. */
  ms: number;
  /** The question's fingerprint: an answer is only shown again on the same question. */
  h: number;
}

export interface DailyStore {
  v: 1;
  best: number;
  days: Record<string, DailyEntry>;
}

export function emptyStore(): DailyStore {
  return { v: 1, best: 0, days: {} };
}

/** A small stable number from a question's text and choices. */
export function questionFingerprint(q: { q: string; choices: string[] }): number {
  const s = `${q.q}\u0000${q.choices.join("\u0000")}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function isEntry(e: unknown): e is DailyEntry {
  if (!e || typeof e !== "object") return false;
  const x = e as Record<string, unknown>;
  return Number.isInteger(x.c) && typeof x.r === "boolean" && typeof x.ms === "number" && Number.isFinite(x.ms) && typeof x.h === "number";
}

/** Reads a stored value, dropping anything that isn't in the expected shape. */
export function parseStore(raw: string | null): DailyStore {
  const store = emptyStore();
  if (!raw) return store;
  try {
    const parsed = JSON.parse(raw) as Partial<DailyStore> | null;
    if (!parsed || typeof parsed !== "object") return store;
    if (typeof parsed.best === "number" && Number.isFinite(parsed.best)) store.best = Math.max(0, Math.floor(parsed.best));
    if (parsed.days && typeof parsed.days === "object") {
      for (const [k, e] of Object.entries(parsed.days)) if (/^\d+$/.test(k) && isEntry(e)) store.days[k] = e;
    }
  } catch {
    // Unreadable: start again rather than break the page.
  }
  return store;
}

/** The longest run of consecutive answered days in `days`. */
function longestRun(days: Record<string, DailyEntry>): number {
  const nums = Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

/**
 * The store with day `day` answered. An answer already there for the same
 * question stands (a pick is final for the day); one for a different
 * question (the bank changed under it) is replaced.
 */
export function recordAnswer(store: DailyStore, day: number, entry: DailyEntry): DailyStore {
  const existing = store.days[day];
  if (existing && existing.h === entry.h) return store;
  const days: Record<string, DailyEntry> = {};
  for (const [k, e] of Object.entries(store.days)) if (Number(k) > day - KEEP_DAYS) days[k] = e;
  days[day] = entry;
  return { v: 1, best: Math.max(store.best, longestRun(days)), days };
}

/**
 * Consecutive days answered, ending today (`day`). Before today's is
 * answered, the run ending yesterday still counts: it isn't broken yet.
 */
export function currentStreak(store: DailyStore, day: number): number {
  let d = store.days[day] ? day : day - 1;
  let n = 0;
  while (store.days[d]) {
    n++;
    d--;
  }
  return n;
}

export function bestStreak(store: DailyStore): number {
  return Math.max(store.best, longestRun(store.days));
}

/** "0:42", "12:05", "1:02:03". */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/**
 * The result to share: the day, right or wrong, the time when right, and
 * the streak when there is one. Never the question or its answer, so it
 * spoils nothing for a friend who hasn't played yet.
 */
export function shareText({ day, right, ms, streak }: { day: number; right: boolean; ms: number; streak: number | null }): string {
  const run = streak !== null && streak >= 2 ? `${streak} days in a row` : null;
  const line = right
    ? [`SAT Daily #${day} ✅ ${formatTime(ms)}`, run].filter(Boolean).join(" · ")
    : [`SAT Daily #${day} ❌`, run, "back tomorrow"].filter(Boolean).join(" · ");
  return `${line}\n${DAILY_SHARE_URL}`;
}

// ---- Storage, guarded ---------------------------------------------------------

/** The saved store, an empty one if nothing's saved, or null if storage is off. */
export function loadStore(): DailyStore | null {
  try {
    return parseStore(window.localStorage.getItem(DAILY_STORE_KEY));
  } catch {
    return null;
  }
}

/** Whether it was saved. */
export function saveStore(store: DailyStore): boolean {
  try {
    window.localStorage.setItem(DAILY_STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
