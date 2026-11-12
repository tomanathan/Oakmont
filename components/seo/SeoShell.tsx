import Link from "next/link";
import { SiteHeader } from "@/components/landing/notebook/SiteHeader";
import { TrackedLink } from "@/components/landing/TrackedLink";
import { LegalFooter } from "@/components/LegalFooter";

// The public SAT reference pages (/sat and /sat/[slug]): the homepage's top
// bar over one notebook page (see .nbk-page in globals.css), like the 404
// page, with the homepage's footer lines under it. `.seo-read` raises the
// shared question components' small reading sizes to 16px here (see
// globals.css): these pages are read on phones by people who have never
// seen the app.
export function SeoShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="seo-read mx-auto my-6 w-[calc(100%-24px)] max-w-[760px] font-sans sm:my-8 md:w-[calc(100%-80px)]">
        <main className="nbk-page min-w-0 break-words">
          <span className="nbk-spiral" aria-hidden />
          {children}
        </main>
        <footer className="mt-6 text-center">
          <LegalFooter />
          <p className="mx-auto max-w-[560px] px-4 text-[12px] leading-relaxed text-stone-500">
            SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
          </p>
        </footer>
      </div>
    </>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="-mt-2 mb-3 text-[14px] text-stone-600">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-x-1.5">
            {i > 0 && <span aria-hidden>›</span>}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-[44px] items-center font-medium text-[#26427e] underline-offset-4 hover:underline">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="inline-flex min-h-[44px] items-center">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const START_BUTTON =
  "inline-flex min-h-[48px] items-center justify-center rounded-xl bg-forest px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#1f2f5a]";

/** The call to action: a card of its own, or a slim line near the top. */
export function StartFree({ text, slim = false }: { text: string; slim?: boolean }) {
  if (slim) {
    return (
      <div className="my-5 flex flex-col gap-3 rounded-xl border border-[#c9d6ee] bg-[#f3f6fc] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[16px] leading-snug text-ink">{text}</p>
        <TrackedLink href="/start" event="signup_started" className={`${START_BUTTON} flex-none`}>
          Start free
        </TrackedLink>
      </div>
    );
  }
  return (
    <aside aria-label="Start free" className="my-8 rounded-2xl border-2 border-[#3461c1] bg-[#eef3fb] p-5 shadow-[4px_4px_0_#3461c1] sm:p-6">
      <p className="font-display text-[21px] font-semibold leading-snug text-ink sm:text-[23px]">{text}</p>
      <TrackedLink href="/start" event="signup_started" className={`${START_BUTTON} mt-4 w-full sm:w-auto`}>
        Start free
      </TrackedLink>
    </aside>
  );
}
