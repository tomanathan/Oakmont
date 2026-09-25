import { upcomingSatDates, type SatDate } from "./satDates";

// Retake cover: the 6-month pass extends free through one SAT retake. The
// student (or a parent, from their account) picks the retake date from the
// official calendar, and access runs until a few days after it. One claim
// per account. It's claimable while the pass is live or for a while after
// it lapses, since the realistic moment is "scores came back, we're going
// again", which often lands after six months are up.

const DAY = 24 * 60 * 60 * 1000;
// Access runs through test day plus this, so the last week isn't cut off
// by time zones or a rescheduled sitting.
export const RETAKE_BUFFER_DAYS = 3;
// How long after a pass lapses the cover can still be claimed.
export const RETAKE_CLAIM_GRACE_DAYS = 90;
// The retake has to be a sitting within this long of the pass's end (or of
// today, if that's later) -- "the next test", not one a year out.
export const RETAKE_WINDOW_DAYS = 183;

export interface RetakeState {
  // Holds (or held) a one-time pass. Only these accounts see anything.
  hasPass: boolean;
  claimedAt: Date | null;
  accessExpiresAt: Date | null;
  // Sittings they could pick right now; empty if not eligible.
  options: SatDate[];
}

export function retakeState(
  accessExpiresAt: Date | null,
  claimedAt: Date | null,
  now: Date = new Date()
): RetakeState {
  const hasPass = !!accessExpiresAt;
  const base = { hasPass, claimedAt, accessExpiresAt };
  if (!accessExpiresAt || claimedAt) return { ...base, options: [] };
  if (now.getTime() > accessExpiresAt.getTime() + RETAKE_CLAIM_GRACE_DAYS * DAY) return { ...base, options: [] };
  const from = Math.max(now.getTime(), accessExpiresAt.getTime());
  const options = upcomingSatDates(now).filter((d) => {
    const t = new Date(`${d.date}T00:00:00Z`).getTime();
    // Must actually extend access, fall within the window, and be at least
    // a week out (nobody claims a retake for this weekend's test).
    return t + RETAKE_BUFFER_DAYS * DAY > accessExpiresAt.getTime() && t <= from + RETAKE_WINDOW_DAYS * DAY && t >= now.getTime() + 7 * DAY;
  });
  return { ...base, options };
}

// The new access end for a chosen retake date.
export function retakeAccessEnd(date: string): Date {
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + RETAKE_BUFFER_DAYS * DAY);
}
