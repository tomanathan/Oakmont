// Dedupes concurrent GET requests to the same URL into a single network
// request. AppShell and ScoutCompanion each independently read
// /api/pet/state on mount (AppShell remounts per page; ScoutCompanion mounts
// once at the root layout) -- on first page load both mount together and
// used to fire two nearly-simultaneous, functionally-identical requests.
// This collapses those into one fetch while leaving each caller free to
// manage its own resulting state however it already does.
//
// A caller can also say how old an answer it will accept (`maxAgeMs`).
// AppShell remounts on every navigation and used to re-read the pet's state
// each time, though it only changes when the student studies or changes his
// costume -- so those readers take the last answer if it's under
// PET_STATE_MAX_AGE_MS old, and the two things that do change it say so:
// a study session re-reads with `force`, a costume change calls
// forgetFetched. Callers that pass no maxAgeMs (Ozho's "what's next?")
// always get a fresh read, as before.
export const PET_STATE_MAX_AGE_MS = 45_000;

const inFlight = new Map<string, { p: Promise<unknown>; forced: boolean }>();
const fetched = new Map<string, { at: number; data: unknown }>();
// Bumped whenever a URL's answer is known to be out of date, so a request
// that was already on its way doesn't put the old answer back in `fetched`.
const generation = new Map<string, number>();

/**
 * Drops what's remembered for `url` (or for every URL): the next read goes
 * to the network, and a request already in flight is no longer shared or
 * kept. For when the data changed by some route other than a re-read, or
 * the person signed out.
 */
export function forgetFetched(url?: string): void {
  for (const u of url ? [url] : [...new Set([...fetched.keys(), ...inFlight.keys()])]) {
    generation.set(u, (generation.get(u) ?? 0) + 1);
    fetched.delete(u);
    inFlight.delete(u);
  }
}

export function dedupedFetchJson<T = unknown>(url: string, opts: { maxAgeMs?: number; force?: boolean } = {}): Promise<T | null> {
  const existing = inFlight.get(url);
  if (opts.force) {
    // Several listeners react to the same event; the first starts the
    // re-read and the rest share it. A request from before the change
    // isn't good enough, so that one is left behind.
    if (existing?.forced) return existing.p as Promise<T | null>;
    forgetFetched(url);
  } else {
    const kept = fetched.get(url);
    if (kept && opts.maxAgeMs !== undefined && Date.now() - kept.at < opts.maxAgeMs) return Promise.resolve(kept.data as T);
    if (existing) return existing.p as Promise<T | null>;
  }
  const startedIn = generation.get(url) ?? 0;
  const p: Promise<T | null> = fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
    .then((data) => {
      // Only a real answer is worth keeping: a failed read (signed out,
      // say) should be tried again by whoever asks next.
      if (data !== null && (generation.get(url) ?? 0) === startedIn) fetched.set(url, { at: Date.now(), data });
      return data;
    })
    .finally(() => {
      if (inFlight.get(url)?.p === p) inFlight.delete(url);
    });
  inFlight.set(url, { p, forced: !!opts.force });
  return p;
}
