"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NavButton } from "./NavButton";
import { BrandMark } from "./BrandMark";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import { PET_NAME, type PetStage } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";

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
  // every page: the dashboard/plan/analysis/settings layouts were designed
  // and look right at 900px, so only pages that specifically need the extra
  // room ask for it.
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

  return (
    <div className={`${wide ? "max-w-[1180px]" : "max-w-[900px]"} mx-auto px-4 pb-12 pt-2 font-sans`}>
      <header className="flex items-center justify-between gap-3 py-2 px-4 bg-white rounded-xl shadow-[0_1px_2px_rgba(26,26,46,0.04),0_6px_20px_rgba(26,26,46,0.05)] border border-stone-200 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark size={28} />
          <div className="min-w-0">
            <div className="font-display font-semibold text-[14px] text-ink leading-tight truncate">
              Oakmont Study Center
            </div>
            <div className="text-[10.5px] text-stone-400 truncate">{email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {pet && (
            <button
              onClick={() => router.push("/settings")}
              className={`flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition-opacity hover:opacity-75 ${STAGE_PILL[pet.stage]}`}
              title={`${PET_NAME} is ${STAGE_LABEL[pet.stage].toLowerCase()} -- click to manage in Settings`}
            >
              <PixelDog
                size={22}
                mood={MOOD_BY_STAGE[pet.stage]}
                dead={pet.stage === "dead"}
                costume={pet.costume}
              />
              {STAGE_LABEL[pet.stage]}
            </button>
          )}

          {stats && stats.currentStreak > 0 && (
            <div
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-full pl-1.5 pr-2 py-1"
              title={`${stats.currentStreak}-day streak`}
            >
              <span className="animate-flame-pulse inline-block">🔥</span>
              {stats.currentStreak}
            </div>
          )}

          <nav className="flex items-center gap-1.5 flex-wrap">
            <NavButton active={pathname === "/dashboard"} onClick={() => router.push("/dashboard")}>
              Dashboard
            </NavButton>
            <NavButton active={pathname === "/plan"} onClick={() => router.push("/plan")}>
              6-month plan
            </NavButton>
            <NavButton active={pathname === "/analysis"} onClick={() => router.push("/analysis")}>
              Practice exam analysis
            </NavButton>
          </nav>

          {/* No divider border here on purpose -- on narrow viewports this
              group wraps onto its own line, and a left border would show
              up as an orphaned tick with nothing to actually divide from. */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/settings")}
              className="text-xs text-stone-400 hover:text-ink transition-colors"
            >
              Settings
            </button>
            <button onClick={handleLogout} className="text-xs text-stone-400 hover:text-ink transition-colors">
              Log out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
