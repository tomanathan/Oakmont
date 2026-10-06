import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCurrentParent } from "@/lib/parentSession";
import { sendEmail } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/support";
import { FEEDBACK_KINDS, FEEDBACK_MAX, kindLabel } from "@/lib/feedback";

// Feedback from the Feedback tab, from a signed-in student or parent: saved
// for /admin/feedback and forwarded to the support inbox so it's seen the
// day it's written.
const DAILY_LIMIT = 10;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { kind?: unknown; rating?: unknown; message?: unknown; path?: unknown; as?: unknown };
  // The parent pages say so; a browser can hold both sessions at once.
  const parent = body.as === "parent" ? await getCurrentParent() : null;
  const user = parent ? null : await getCurrentUser();
  if (!parent && !user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const who = parent ? { parentId: parent.parentId } : { userId: user!.userId };
  const email = parent ? parent.email : user!.email;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, FEEDBACK_MAX) : "";
  if (message.length < 3) return NextResponse.json({ error: "Tell us a little more." }, { status: 400 });
  const kind = FEEDBACK_KINDS.some((k) => k.id === body.kind) ? (body.kind as string) : "other";
  const rating = typeof body.rating === "number" && Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5 ? body.rating : null;
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : null;

  // Enough for anyone with something to say; stops a stuck button or a
  // script from flooding the inbox.
  const today = await prisma.feedback.count({ where: { ...who, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } } });
  if (today >= DAILY_LIMIT) return NextResponse.json({ error: "That's a lot for one day. Email us for anything else." }, { status: 429 });

  await prisma.feedback.create({ data: { ...who, kind, rating, message, path, userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null } });

  // Best effort: the note is saved either way.
  await sendEmail({
    to: SUPPORT_EMAIL,
    subject: `Feedback (${kindLabel(kind)}) from ${parent ? "parent " : ""}${email}`,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:560px;">
      <p style="color:#555;font-size:13px;margin:0 0 8px;">${parent ? "Parent " : ""}${esc(email)} · ${esc(kindLabel(kind))}${rating ? ` · ${rating}/5` : ""}${path ? ` · on ${esc(path)}` : ""}</p>
      <p style="font-size:15px;line-height:1.55;color:#1f2f5a;white-space:pre-wrap;margin:0 0 14px;">${esc(message)}</p>
      <p style="font-size:13px;"><a href="${process.env.APP_URL || "https://oakmontsat.com"}/admin/feedback">See all feedback</a></p>
    </div>`,
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
