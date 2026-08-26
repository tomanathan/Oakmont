"use client";

import { useRouter, usePathname } from "next/navigation";
import { NavButton } from "./NavButton";

export function AppShell({
  email,
  stats,
  children,
}: {
  email: string;
  stats?: { totalXP: number; currentStreak: number };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 pb-12 pt-4 font-sans">
      <div className="flex items-center justify-between py-4 px-5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(26,26,46,0.04),0_6px_20px_rgba(26,26,46,0.05)] border border-[#eeecfb] mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d7fd6] to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            E
          </span>
          <div>
            <div className="font-bold text-lg text-ink leading-tight">Elevate SAT Prep</div>
            <div className="text-xs text-gray-400">{email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {stats && (
            <div className="flex items-center gap-1.5 mr-1">
              <StatChip
                label={`${stats.currentStreak}-day streak`}
                icon="🔥"
                muted={stats.currentStreak === 0}
              />
              <StatChip label={`${stats.totalXP.toLocaleString()} XP`} icon="⚡" />
            </div>
          )}
          <NavButton active={pathname === "/dashboard"} onClick={() => router.push("/dashboard")}>
            Dashboard
          </NavButton>
          <NavButton active={pathname === "/plan"} onClick={() => router.push("/plan")}>
            6-month plan
          </NavButton>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-lg border border-[#e0defa] bg-[#f0eff9] text-gray-500 text-sm hover:border-[#c9c6ee]"
          >
            Log out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatChip({ label, icon, muted }: { label: string; icon: string; muted?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-semibold whitespace-nowrap ${
        muted
          ? "bg-white border-gray-200 text-gray-400"
          : "bg-[#f0f7f2] border-[#cde8d9] text-accent"
      }`}
    >
      <span className={muted ? "grayscale opacity-50" : ""}>{icon}</span>
      {label}
    </div>
  );
}
