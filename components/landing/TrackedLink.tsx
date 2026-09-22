"use client";

import { track } from "@vercel/analytics";

// A plain <a> that also fires a Vercel Analytics custom event on click --
// used for the landing page's CTAs so the visit -> sample_answered ->
// signup_started -> signup_completed funnel is actually measurable. Still
// a real link (default navigation proceeds normally); this only adds the
// tracking call.
export function TrackedLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  event: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => track(event)}>
      {children}
    </a>
  );
}
