import { cleanSourceValue, type SourceCookie } from "./signupSource.shared";

// How a new account found us, read once at signup from the first-visit
// cookie that components/SourceCapture.tsx wrote. The cookie is the
// visitor's own to edit, so every field is cleaned again here. `source` is
// the one short label the admin page groups accounts by.

export interface SignupSource {
  source: string;
  // The label this visit would have had with no invite code (for an invite that did not apply).
  sourceWithoutInvite: string;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
  landing: string | null;
  ref: string | null;
}

const DIRECT: SignupSource = { source: "direct", sourceWithoutInvite: "direct", medium: null, campaign: null, referrer: null, landing: null, ref: null };

// Country versions: google.de, google.co.uk, google.com.au and so on.
const TLD = String.raw`(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})`;
const GOOGLE = new RegExp(`(^|\\.)google\\.${TLD}$`);
const PINTEREST = new RegExp(`(^|\\.)pinterest\\.${TLD}$`);

// The sites that send most visitors, by a plain name. Matched on the
// hostname without "www." and any of the listed subdomains.
const SITES: [label: string, test: (host: string) => boolean][] = [
  ["tiktok", (h) => h === "tiktok.com" || h.endsWith(".tiktok.com")],
  ["instagram", (h) => h === "instagram.com" || h.endsWith(".instagram.com")],
  ["facebook", (h) => h === "facebook.com" || h.endsWith(".facebook.com") || h === "fb.com" || h === "fb.me"],
  ["google", (h) => GOOGLE.test(h)],
  ["bing", (h) => h === "bing.com" || h.endsWith(".bing.com")],
  ["duckduckgo", (h) => h === "duckduckgo.com" || h.endsWith(".duckduckgo.com")],
  ["youtube", (h) => h === "youtube.com" || h.endsWith(".youtube.com") || h === "youtu.be"],
  ["reddit", (h) => h === "reddit.com" || h.endsWith(".reddit.com") || h === "redd.it"],
  ["snapchat", (h) => h === "snapchat.com" || h.endsWith(".snapchat.com")],
  ["x", (h) => h === "twitter.com" || h.endsWith(".twitter.com") || h === "x.com" || h === "t.co"],
  ["pinterest", (h) => PINTEREST.test(h) || h === "pin.it"],
  ["discord", (h) => h === "discord.com" || h.endsWith(".discord.com") || h === "discord.gg" || h === "discordapp.com"],
  ["chatgpt", (h) => h === "chatgpt.com" || h === "chat.openai.com"],
];

/** The label for a referring site: a plain name for the big ones, else the bare hostname. */
export function referrerLabel(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, "");
  return SITES.find(([, test]) => test(h))?.[0] ?? h;
}

function parse(raw: string): SourceCookie | null {
  for (const text of [raw, safeDecode(raw)]) {
    if (!text) continue;
    try {
      const value = JSON.parse(text);
      if (value && typeof value === "object" && !Array.isArray(value)) return value as SourceCookie;
    } catch {
      // try the next form
    }
  }
  return null;
}

// Next hands route handlers the cookie already decoded; anything else may not.
function safeDecode(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export function readSignupSource(cookieValue: string | undefined): SignupSource {
  if (!cookieValue) return { ...DIRECT };
  const c = parse(cookieValue);
  if (!c) return { ...DIRECT };
  const utmSource = cleanSourceValue(c.us)?.toLowerCase();
  const referrer = cleanSourceValue(c.h)?.toLowerCase().replace(/^www\./, "") || null;
  const ref = cleanSourceValue(c.r) ?? null;
  const sourceWithoutInvite = utmSource || (referrer ? referrerLabel(referrer) : "direct");
  return {
    source: ref ? "invite" : sourceWithoutInvite,
    sourceWithoutInvite,
    medium: cleanSourceValue(c.um) ?? null,
    campaign: cleanSourceValue(c.uc) ?? null,
    referrer,
    landing: cleanSourceValue(c.p, true) ?? null,
    ref,
  };
}

/** The source as columns for a new User or Parent row. */
export function signupSourceFields(src: SignupSource) {
  return {
    signupSource: src.source,
    signupMedium: src.medium,
    signupCampaign: src.campaign,
    signupReferrer: src.referrer,
    signupLanding: src.landing,
  };
}

/**
 * Whether a stored source says nothing more than where the click happened
 * (no utm tags, no friend's invite) -- so a parent's invite, which is the
 * real reason they came, may replace it. A parent's link opened in webmail
 * would otherwise count as "google".
 */
export function onlyReferrerOrDirect(row: { signupSource: string | null; signupReferrer: string | null }): boolean {
  if (row.signupSource === "direct") return true;
  return !!row.signupReferrer && row.signupSource === referrerLabel(row.signupReferrer);
}
