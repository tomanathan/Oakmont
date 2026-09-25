import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/support";

// The visible support contact across the app -- see app/terms and
// app/privacy for the pages this links to. SUPPORT_EMAIL lives in
// lib/support.ts (so server code like lib/email.ts can use it too) and is
// re-exported here for the pages that already import it from this file.
export { SUPPORT_EMAIL };

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-500 ${className}`}>
      <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink transition-colors">
        Contact support
      </a>
      <Link href="/terms" className="hover:text-ink transition-colors">
        Terms of Service
      </Link>
      <Link href="/privacy" className="hover:text-ink transition-colors">
        Privacy Policy
      </Link>
    </div>
  );
}
