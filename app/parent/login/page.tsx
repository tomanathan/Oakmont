import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { googleEnabled } from "@/lib/googleAuth";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import { getCurrentParent } from "@/lib/parentSession";
import { ParentLoginView } from "./ParentLoginView";

export const metadata: Metadata = { title: "Parent log in · Oakmont", robots: { index: false, follow: false } };

// Server wrapper so "Continue with Google" only shows once its keys are
// configured (see lib/googleAuth.ts), and not inside apps like Facebook or
// TikTok, whose built-in browsers Google refuses to sign in from.
export default async function ParentLoginPage({
  searchParams,
}: {
  searchParams: { plan?: string | string[]; error?: string | string[]; code?: string | string[] };
}) {
  // Already signed in: on to the dashboard. Not when the Google callback
  // sent an ?error= back to show, or a student code came along to use. The
  // account is confirmed here too, because the dashboard sends a session
  // with no account behind it back to this page, and the two must never
  // bounce between each other; if that lookup fails, the form just shows.
  const session = await getCurrentParent();
  if (session && !searchParams.error && !searchParams.code) {
    const account = await prisma.parent.findUnique({ where: { id: session.parentId }, select: { id: true } }).catch(() => null);
    if (account) redirect("/parent/dashboard");
  }

  const google = googleEnabled();
  const inApp = isInAppBrowser();
  // The homepage's pricing buttons say which plan was clicked.
  const plan = searchParams.plan === "monthly" || searchParams.plan === "sixmonth" ? searchParams.plan : null;
  return <ParentLoginView googleEnabled={google && !inApp} inApp={google && inApp} plan={plan} />;
}
