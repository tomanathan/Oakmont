// Minimal email sender using Resend's plain REST API (no SDK dependency).
// Requires RESEND_API_KEY and EMAIL_FROM in the environment; see README for
// setup. Without a key, this logs instead of sending -- so local dev and a
// not-yet-configured deployment never crash, they just don't deliver mail.

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY or EMAIL_FROM not set -- skipping send. Would have sent "${subject}" to ${to}.`
    );
    return { sent: false };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend request failed (${res.status}): ${body}`);
    return { sent: false };
  }

  return { sent: true };
}
