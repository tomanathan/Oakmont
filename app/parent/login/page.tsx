import { googleEnabled } from "@/lib/googleAuth";
import { ParentLoginView } from "./ParentLoginView";

// Server wrapper so "Continue with Google" only shows once its keys are
// configured (see lib/googleAuth.ts).
export default function ParentLoginPage() {
  return <ParentLoginView googleEnabled={googleEnabled()} />;
}
