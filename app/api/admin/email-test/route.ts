import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { sampleEmails } from "@/lib/encourage/samples";
import { APP_URL } from "@/lib/encourage/config";

// Sends the sample daily emails to the admin who pressed the button, and
// to nobody else, so they can be read in a real inbox.
export const maxDuration = 60;

export async function POST() {
  const admin = await requireAdmin();
  let sent = 0;
  for (const s of sampleEmails(`${APP_URL}/admin/emails`)) {
    const res = await sendEmail({ to: admin.email, subject: `[Sample: ${s.to}, ${s.when.toLowerCase()}] ${s.email.subject}`, html: s.email.html });
    if (res.sent) sent++;
    await new Promise((r) => setTimeout(r, 600));
  }
  return NextResponse.json({ ok: true, sent, to: admin.email });
}
