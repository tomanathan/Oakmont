import { googleEnabled } from "@/lib/googleAuth";
import { LoginView } from "./LoginView";

// Server wrapper so "Continue with Google" only shows once its keys are
// configured (see lib/googleAuth.ts).
export default function LoginPage() {
  return <LoginView googleEnabled={googleEnabled()} />;
}
