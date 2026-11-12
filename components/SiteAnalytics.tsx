"use client";

import { Analytics } from "@vercel/analytics/next";

// Page-view analytics, with private links kept out of it. A few URLs carry
// a token that is itself the key to something (a parent's share link, an
// invite, a friend's invite code, a password reset): the query string is dropped from every
// recorded URL and the token part of those paths is blanked.
export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const url = new URL(event.url);
          url.search = "";
          url.pathname = url.pathname.replace(/^\/(share|link|i)\/[^/]+/, "/$1/[token]");
          return { ...event, url: url.toString() };
        } catch {
          return event;
        }
      }}
    />
  );
}
