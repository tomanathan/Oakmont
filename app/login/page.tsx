import { googleEnabled } from "@/lib/googleAuth";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import { LoginView } from "./LoginView";

// Server wrapper so "Continue with Google" only shows once its keys are
// configured (see lib/googleAuth.ts), and not inside apps like Facebook or
// TikTok, whose built-in browsers Google refuses to sign in from.
export default function LoginPage() {
  return <LoginView googleEnabled={googleEnabled() && !isInAppBrowser()} />;
}
