import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { sendEmail } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/support";

// TEMPORARY: one-off end-to-end check that production can send email.
// Sends only to SUPPORT_EMAIL, and only with the matching one-time token
// (just its SHA-256 is stored here). Delete after the test.
const TOKEN_SHA256 = "50cea2cd95c445efe69da60248d0d33277482d80856b55f85e51bccffd6c4b22";

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (createHash("sha256").update(t).digest("hex") !== TOKEN_SHA256) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const res = await sendEmail({
    to: SUPPORT_EMAIL,
    subject: "Oakmont email test",
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#1d2621">
      <p><strong>It works.</strong> This test came from the live site at oakmontsat.com.</p>
      <p>It should show as sent by <em>Oakmont Study Center</em>, and hitting reply should address oakmontstudycenter@gmail.com.</p>
    </div>`,
  });
  return NextResponse.json({ ...res, from: process.env.EMAIL_FROM ?? null, keySet: !!process.env.RESEND_API_KEY, at: new Date().toISOString() });
}
