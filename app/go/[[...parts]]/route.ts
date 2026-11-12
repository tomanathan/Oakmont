import { NextResponse } from "next/server";

// Short, memorable links for bios, flyers and posts, e.g. oakmontsat.com/go/tiktok
// or oakmontsat.com/go/flyer/lincoln-hs. Each one lands on the free starter
// (/start) tagged with where it was shared, so the signup source tracking in
// components/SourceCapture.tsx counts it. Only cleaned letters, digits, "-" and
// "_" are ever passed on, and the destination is always our own /start.

const MAX_PART_LEN = 40;

function cleanPart(part: string): string {
  return part.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, MAX_PART_LEN);
}

/** The /start URL (path and query only) a /go link should send the visitor to. */
function goTarget(parts: string[] | undefined): string {
  const cleaned = (parts ?? []).map(cleanPart);
  if (cleaned.length < 1 || cleaned.length > 2 || cleaned.some((p) => !p)) return "/start";
  const params = new URLSearchParams({ utm_source: cleaned[0] });
  if (cleaned[1]) params.set("utm_campaign", cleaned[1]);
  return `/start?${params.toString()}`;
}

export function GET(req: Request, { params }: { params: { parts?: string[] } }) {
  // 307, so a link can be pointed somewhere else later without browsers holding on to the old one.
  const res = NextResponse.redirect(new URL(goTarget(params.parts), req.url), 307);
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
