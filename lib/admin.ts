import { notFound } from "next/navigation";
import { getCurrentUser } from "./session";
import { SUPPORT_EMAIL } from "./support";

// Who can open /admin: the support address, plus anyone in ADMIN_EMAILS
// (comma-separated, set in Vercel). The session must also come from Google
// sign-in, because password signups never verify their email -- otherwise
// anyone could register an admin's address with a password and walk in.
// Everyone else gets a plain 404, so the page doesn't advertise itself.
function adminEmails(): Set<string> {
  const extra = (process.env.ADMIN_EMAILS ?? "").split(",");
  return new Set([SUPPORT_EMAIL, ...extra].map((e) => e.trim().toLowerCase()).filter(Boolean));
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.method !== "google" || !adminEmails().has(user.email.toLowerCase())) notFound();
  return user;
}
