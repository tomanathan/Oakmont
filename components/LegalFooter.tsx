import Link from "next/link";

// The one place a visible support contact lives across the app -- see
// app/terms and app/privacy for the pages this links to. SUPPORT_EMAIL is
// exported so those two pages (and anywhere else that needs it) show the
// exact same address without risking it drifting out of sync.
export const SUPPORT_EMAIL = "aman.vishwanathan@gmail.com";

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-400 ${className}`}>
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
