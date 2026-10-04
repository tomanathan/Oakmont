// The daily encouragement emails (students and parents).
//
// OFF until the owner says go: with this false, the cron jobs send nothing
// from lib/encourage (everything else they do is unchanged). The admin
// preview page and "send the samples to me" still work, so the emails can
// be read in a real inbox first.
export const ENCOURAGE_EMAILS_ON = false;

// Who gets them, and how often:
//   - studied within the last DAILY_UNTIL_DAYS days: every day
//   - quieter than that, up to STOP_AFTER_DAYS: Mondays and Thursdays only
//   - after STOP_AFTER_DAYS without study: nothing (mail nobody opens gets a
//     sender marked as spam, which would hurt password resets and receipts)
export const DAILY_UNTIL_DAYS = 7;
export const STOP_AFTER_DAYS = 30;
// The afternoon "you haven't studied yet today" nudge only goes to someone
// who studied within this many days (a streak worth keeping, or just lost).
export const NUDGE_WITHIN_DAYS = 3;
// No morning email in an account's first hours (they just signed up).
export const NEW_ACCOUNT_QUIET_HOURS = 18;

export const APP_URL = process.env.APP_URL || "https://oakmontsat.com";
