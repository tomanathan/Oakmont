import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readUnsubscribeToken } from "@/lib/encourage/unsubscribe";

// Turns the daily emails off (or back on) for whoever the signed token in
// the link names; no login needed. Two callers:
//   - mail apps' own "Unsubscribe" button (the List-Unsubscribe header): a
//     bare POST to this URL, which always means "off"
//   - the /email/unsubscribe page's buttons: a JSON POST with { on }
// A GET just goes to that page: link scanners open links, and a visit
// alone shouldn't change anything.
async function setEmails(token: string | null, on: boolean): Promise<boolean> {
  const who = await readUnsubscribeToken(token);
  if (!who) return false;
  if (who.who === "student") await prisma.user.updateMany({ where: { id: who.id }, data: { encourageEmails: on } });
  else await prisma.parent.updateMany({ where: { id: who.id }, data: { dailyEmails: on } });
  return true;
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t");
  let on = false;
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { on?: unknown };
    on = body.on === true;
  }
  if (!(await setEmails(token, on))) return NextResponse.json({ error: "That link isn't valid." }, { status: 400 });
  return NextResponse.json({ ok: true, on });
}

export async function GET(req: NextRequest) {
  const url = new URL("/email/unsubscribe", req.nextUrl.origin);
  const t = req.nextUrl.searchParams.get("t");
  if (t) url.searchParams.set("t", t);
  return NextResponse.redirect(url);
}
