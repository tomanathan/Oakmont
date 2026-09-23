"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BrandMark } from "./BrandMark";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import { PET_NAME, type PetStage } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";
import { LegalFooter } from "./LegalFooter";

const STAGE_PILL: Record<PetStage, string> = {
  thriving: "bg-[#eaf6ef] border-[#cde8d9] text-[#2f6f4f]",
  content: "bg-[#eef0fc] border-[#d7dbf3] text-[#4a5bb0]",
  hungry: "bg-[#fbf1df] border-[#f0ddb8] text-[#9a6a12]",
  critical: "bg-[#fbeaea] border-[#f0d0d0] text-[#b23b3b]",
  dead: "bg-[#f0eff2] border-[#e0dee6] text-gray-500",
};
const STAGE_LABEL: Record<PetStage, string> = {
  thriving: "Thriving",
  content: "Doing well",
  hungry: "Hungry",
  critical: "Needs you",
  dead: "Gone",
};

export function AppShell({
  email,
  stats,
  children,
  wide = false,
}: {
  email: string;
  stats?: { currentStreak: number };
  children: React.ReactNode;
  // The lesson page's own content column was measuring ~42 characters per
  // line at desktop widths -- narrower than the same page on a phone --
  // because its two fixed-width side rails (a subskill outline, a tips
  // panel) were eating most of the shared 900px page width, leaving very
  // little for the actual reading surface. Opt-in rather than widening
  // every page by default: plan/analysis/settings are short, mostly
  // single-column forms and summaries that don't have more to show at
  // 1180px, so they stay put. The dashboard opts in too, though, on
  // explicit request -- it's the page students actually come back to
  // day after day, and at 900px it sat in a noticeably narrower column
  // than the lesson page on the exact same desktop screen for no
  // content-driven reason. Its subskill grid also gains a fourth
  // column at this width (see DashboardClient) so the extra room goes
  // toward showing more at once, not just wider padding around the
  // same three columns.
  wide?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pet, setPet] = useState<{ stage: PetStage; costume: string | null } | null>(null);

  // Fetched fresh on every mount rather than shared with ScoutCompanion's
  // own fetch -- AppShell lives inside each page, not the root layout, so
  // it naturally remounts on every navigation anyway (see ScoutCompanion's
  // comments on the same distinction). This gives the *starting* costume;
  // see the "ozho:costume" listener below for how it stays current after
  // that without depending on a remount or a Next.js router refresh ever
  // actually re-running this effect (it doesn't, reliably).
  useEffect(() => {
    let cancelled = false;
    dedupedFetchJson<{ stage: PetStage; costume: string | null }>("/api/pet/state")
      .then((data) => {
        if (!cancelled && data?.stage) {
          setPet({ stage: data.stage, costume: data.costume && data.costume !== "none" ? data.costume : null });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // The instant, reliable way this pill's costume stays in sync after the
  // student equips something in Settings: SettingsClient fires this plain
  // window event with the new costume the moment the server confirms it,
  // and every mounted Ozho icon (this one, ScoutCompanion) just applies it
  // directly -- no re-fetch, no dependency on whether a client component
  // happens to remount or re-run effects after router.refresh().
  useEffect(() => {
    function onCostumeChange(e: Event) {
      const detail = (e as CustomEvent<{ costume: string | null }>).detail;
      if (!detail) return;
      setPet((prev) => (prev ? { ...prev, costume: detail.costume } : prev));
    }
    window.addEventListener("ozho:costume", onCostumeChange);
    return () => window.removeEventListener("ozho:costume", onCostumeChange);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const width = wide ? "max-w-[1180px]" : "max-w-[900px]";

  return (
    <>
      {/* Sticky and full-bleed, the same frosted bar as the public site's
          nav, so moving from the landing page into the app feels like the
          same product. On phones the right edge is left clear: that's
          where Ozho (and Mochi, once earned) dock as fixed badges -- see
          ScoutCompanion's MOBILE_DOCK_* and SecondCompanion's DOCK_*. */}
      <header className="sticky top-0 z-30 border-b border-[#ece9f7]/80 bg-white/85 backdrop-blur-md font-sans">
        <div className={`${width} mx-auto flex items-center gap-2 pl-4 pr-[100px] py-2.5 sm:gap-3 sm:pr-4`}>
          <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2" aria-label="Oakmont Study Center, dashboard">
            <BrandMark size={26} />
            <span className="hidden font-display text-[15px] font-semibold text-ink md:inline">Oakmont</span>
          </Link>

          <nav className="ml-1 flex items-center gap-0.5 sm:ml-3">
            {/* One nav item now covers what used to be two separate pages
                (6-month plan, practice exam analysis) -- see app/plan/
                page.tsx's own comment on why logging scores and seeing the
                schedule they drive belong on one page, not two. /analysis
                still resolves (see app/analysis/page.tsx) as a redirect
                here for anyone with an old bookmark. */}
            <Tab href="/dashboard" active={pathname === "/dashboard" || !!pathname?.startsWith("/subskill")}>
              <span className="sm:hidden">Home</span>
              <span className="hidden sm:inline">Dashboard</span>
            </Tab>
            <Tab href="/plan" active={pathname === "/plan"}>
              <span className="sm:hidden">Plan</span>
              <span className="hidden sm:inline">Study plan</span>
            </Tab>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {pet && (
              <Link
                href="/settings#wardrobe"
                className={`hidden items-center gap-1.5 rounded-full border py-0.5 pl-1 pr-2.5 text-[11px] font-semibold transition-opacity hover:opacity-75 sm:flex ${STAGE_PILL[pet.stage]}`}
                title={`${PET_NAME} is ${STAGE_LABEL[pet.stage].toLowerCase()}`}
              >
                <PixelDog
                  size={22}
                  mood={MOOD_BY_STAGE[pet.stage]}
                  dead={pet.stage === "dead"}
                  costume={pet.costume}
                  shadow={false}
                  className={pet.stage === "critical" ? "animate-worried" : ""}
                />
                {STAGE_LABEL[pet.stage]}
              </Link>
            )}

            {stats && stats.currentStreak > 0 && (
              <div
                className="hidden items-center gap-1 rounded-full bg-[#fff4e6] py-1 pl-2 pr-2.5 text-[11px] font-semibold text-[#b4541a] sm:flex"
                title={`${stats.currentStreak}-day streak`}
              >
                <svg width="10" height="12" viewBox="0 0 12 14" aria-hidden="true">
                  <path
                    d="M6 0.5c.6 2.3 3.2 3.6 3.2 7a3.2 3.2 0 0 1-6.4 0c0-1.4.7-2.3 1.4-3 .1 1 .6 1.7 1.3 1.9C5 4.6 5 2.4 6 .5Z"
                    fill="currentColor"
                  />
                </svg>
                {stats.currentStreak}
                <span className="font-medium opacity-80">day{stats.currentStreak === 1 ? "" : "s"}</span>
              </div>
            )}

            <AccountMenu email={email} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <div className={`${width} mx-auto px-4 pb-12 pt-5 font-sans`}>
        {children}
        <LegalFooter className="mt-10" />
      </div>
    </>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-[#f1f0fb] font-semibold text-ink" : "text-gray-500 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

// The account's initial in a circle, opening a small menu with who's
// signed in, Settings and Log out -- the three things that used to sit
// loose across the header as small grey text.
function AccountMenu({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-85"
      >
        {email.trim()[0] ?? "?"}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-[#ece9f7] bg-white py-1 shadow-[0_12px_32px_-8px_rgba(26,26,46,0.2)]"
        >
          <div className="border-b border-[#f2f0fa] px-3.5 py-2.5">
            <div className="text-[11px] text-gray-400">Signed in as</div>
            <div className="truncate text-[13px] font-medium text-ink">{email}</div>
          </div>
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className="block px-3.5 py-2 text-sm text-gray-700 hover:bg-[#f7f6fd]">
            Settings
          </Link>
          <Link role="menuitem" href="/settings#wardrobe" onClick={() => setOpen(false)} className="block px-3.5 py-2 text-sm text-gray-700 hover:bg-[#f7f6fd]">
            {PET_NAME}&apos;s wardrobe
          </Link>
          <button
            role="menuitem"
            onClick={onLogout}
            className="block w-full px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-[#f7f6fd]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
