import { headers } from "next/headers";

// Browsers built into other apps (Facebook, Instagram, TikTok, Snapchat...),
// where Google refuses to show its sign-in page ("disallowed_useragent").
// Where most of our traffic arrives from, so the Google button is hidden
// there rather than leading to Google's error page.
const IN_APP = /FBAN|FBAV|FB_IAB|FB4A|Instagram|Messenger|musical_ly|TikTok|BytedanceWebview|Snapchat|Discord|LinkedInApp|Line\/|Twitter/i;

export function isInAppBrowser(userAgent?: string | null): boolean {
  const ua = userAgent ?? headers().get("user-agent") ?? "";
  return IN_APP.test(ua);
}
