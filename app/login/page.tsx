import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { googleEnabled, safeNext } from "@/lib/googleAuth";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import { getCurrentUser } from "@/lib/session";
import { LoginView } from "./LoginView";

export const metadata: Metadata = { title: "Log in · Oakmont", robots: { index: false, follow: false } };

// Server wrapper so "Continue with Google" only shows once its keys are
// configured (see lib/googleAuth.ts), and not inside apps like Facebook or
// TikTok, whose built-in browsers Google refuses to sign in from.
export default async function LoginPage({ searchParams }: { searchParams: { next?: string | string[]; error?: string | string[] } }) {
  // Already signed in: on to the dashboard (or the parent invite they were
  // on their way to). An ?error= from the Google callback still shows here.
  const user = await getCurrentUser();
  if (user && !searchParams.error) {
    redirect(safeNext(typeof searchParams.next === "string" ? searchParams.next : null) ?? "/dashboard");
  }

  const google = googleEnabled();
  const inApp = isInAppBrowser();
  return <LoginView googleEnabled={google && !inApp} inApp={google && inApp} />;
}
