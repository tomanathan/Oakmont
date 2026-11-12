import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/support";

// The visible support contact across the app -- see app/terms and
// app/privacy for the pages this links to. SUPPORT_EMAIL lives in
// lib/support.ts (so server code like lib/email.ts can use it too) and is
// re-exported here for the pages that already import it from this file.
export { SUPPORT_EMAIL };

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    // The padding on each link is its tap area; the row's gaps are closed up to match.
    <div className={`flex flex-wrap items-center justify-center text-[11px] text-stone-500 ${className}`}>
      <a href={`mailto:${SUPPORT_EMAIL}`} className="px-2 py-3 hover:text-ink transition-colors">
        Contact support
      </a>
      {/* The public skill pages' hub: linked from every page's footer so
          visitors (and search engines) can reach it from anywhere. */}
      <Link href="/sat" className="px-2 py-3 hover:text-ink transition-colors">
        SAT skills
      </Link>
      <Link href="/terms" className="px-2 py-3 hover:text-ink transition-colors">
        Terms of Service
      </Link>
      <Link href="/privacy" className="px-2 py-3 hover:text-ink transition-colors">
        Privacy Policy
      </Link>
    </div>
  );
}
