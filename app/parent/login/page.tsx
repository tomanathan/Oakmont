import { googleEnabled } from "@/lib/googleAuth";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import { ParentLoginView } from "./ParentLoginView";

// Server wrapper so "Continue with Google" only shows once its keys are
// configured (see lib/googleAuth.ts), and not inside apps like Facebook or
// TikTok, whose built-in browsers Google refuses to sign in from.
export default function ParentLoginPage() {
  return <ParentLoginView googleEnabled={googleEnabled() && !isInAppBrowser()} />;
}
