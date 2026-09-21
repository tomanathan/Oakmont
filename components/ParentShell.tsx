"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "./BrandMark";

// A lightweight sibling of AppShell.tsx for parent-facing pages -- same
// header chrome (BrandMark, white rounded card, fonts/colors) so the two
// halves of the app read as one product, but none of AppShell's
// student-only concerns (Ozho's pet-state fetch, the Dashboard/Study plan
// nav, streak pill). A parent has exactly one page today, so the only nav
// need is switching which linked student it's showing.
export function ParentShell({
  parentEmail,
  students,
  activeStudentId,
  children,
}: {
  parentEmail: string;
  students: { id: string; email: string }[];
  activeStudentId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/parent/logout", { method: "POST" });
    router.push("/parent/login");
    router.refresh();
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 pb-12 pt-2 font-sans">
      <header className="flex items-center justify-between gap-3 py-2 px-4 bg-white rounded-xl shadow-[0_1px_2px_rgba(26,26,46,0.04),0_6px_20px_rgba(26,26,46,0.05)] border border-stone-200 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark size={28} />
          <div className="min-w-0">
            <div className="font-display font-semibold text-[14px] text-ink leading-tight truncate">
              Oakmont for Parents
            </div>
            <div className="text-[10.5px] text-stone-400 truncate">{parentEmail}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {students.length > 1 && (
            <select
              value={activeStudentId}
              onChange={(e) => router.push(`/parent/dashboard?student=${e.target.value}`)}
              className="text-xs border border-[#e0defa] rounded-lg px-2 py-1.5 bg-white text-ink max-w-[180px]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.email}
                </option>
              ))}
            </select>
          )}
          <button onClick={handleLogout} className="text-xs text-stone-400 hover:text-ink transition-colors">
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
