// The email a student sends their parent from onboarding or Settings: what
// Oakmont's parent report is, and a signup link with the student's code
// already filled in. Inline styles only, for mail clients.

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function parentInviteEmail({
  appUrl,
  code,
  firstName,
  studentEmail,
}: {
  appUrl: string;
  code: string;
  firstName: string | null;
  studentEmail: string;
}): { subject: string; html: string } {
  const who = firstName || studentEmail;
  const params = new URLSearchParams({ mode: "signup", code });
  if (firstName) params.set("name", firstName);
  const signupUrl = `${appUrl}/parent/login?${params.toString()}`;
  const loginUrl = `${appUrl}/parent/dashboard?add=1`;
  const subject = `${who} invited you to follow their SAT prep on Oakmont`;
  const bullets = [
    "Every study session: when, for how long, and what was covered",
    "All 29 SAT skills, from not started to mastered",
    "Accuracy, pacing, and the mistakes that keep repeating",
    "Practice test scores against their goal",
    "A summary email every Sunday",
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a2e;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6d7fd6;">Oakmont SAT</div>
  <h1 style="font-size:24px;line-height:1.25;margin:10px 0 12px;">${esc(who)} wants you to see how their SAT prep is going</h1>
  <p style="font-size:15px;line-height:1.6;color:#4b4b63;margin:0 0 16px;">
    ${esc(who)} is studying for the SAT with Oakmont and invited you to a free parent account. It shows you a live, read-only report of their studying:
  </p>
  <ul style="font-size:14px;line-height:1.7;color:#4b4b63;padding-left:20px;margin:0 0 20px;">
    ${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}
  </ul>
  <a href="${esc(signupUrl)}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">Create a free parent account</a>
  <p style="font-size:14px;line-height:1.6;color:#4b4b63;margin:20px 0 0;">
    Their code is <strong style="font-family:Menlo,Consolas,monospace;letter-spacing:.06em;">${esc(code)}</strong>. It's already filled in if you use the button.
    Already have a parent account? <a href="${esc(loginUrl)}" style="color:#4a5bb0;">Log in and add a student</a> with this code.
  </p>
  <p style="font-size:12px;line-height:1.6;color:#8a8aa0;margin:28px 0 0;">
    Parent accounts cost nothing and can't change anything in ${esc(who)}'s account. ${esc(who)} can see the connection in their Settings and remove it at any time.
    If you weren't expecting this, you can ignore it.
  </p>
</div></body></html>`;
  return { subject, html };
}
