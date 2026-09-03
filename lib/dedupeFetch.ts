// Dedupes concurrent GET requests to the same URL into a single network
// request. AppShell and ScoutCompanion each independently read
// /api/pet/state on mount (AppShell remounts per page; ScoutCompanion mounts
// once at the root layout) -- on first page load both mount together and
// used to fire two nearly-simultaneous, functionally-identical requests.
// This collapses those into one fetch while leaving each caller free to
// manage its own resulting state however it already does.
const inFlight = new Map<string, Promise<unknown>>();

export function dedupedFetchJson<T = unknown>(url: string): Promise<T | null> {
  const existing = inFlight.get(url) as Promise<T | null> | undefined;
  if (existing) return existing;
  const p = fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
    .finally(() => {
      inFlight.delete(url);
    });
  inFlight.set(url, p);
  return p;
}
