"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { LegalFooter } from "@/components/LegalFooter";
import { LoginCard } from "@/components/LoginCard";

function LoginPageContent() {
  // "Start free" on the landing page links here with ?mode=signup so a
  // visitor who just clicked "sign up" doesn't land on the login tab first.
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  return (
    <div className="max-w-[420px] mx-auto px-6 py-12 font-sans">
      <div className="text-center mb-8">
        <BrandMark size={56} className="mx-auto mb-3" />
        <div className="font-display font-semibold text-[28px] text-ink mb-1">Oakmont Study Center</div>
        <div className="text-sm text-gray-500">
          A full 6-month SAT curriculum, built around every official subskill.
        </div>
      </div>
      <LoginCard initialMode={initialMode} />
      <div className="text-center text-xs text-gray-400 mt-4">
        Your progress is saved automatically and syncs whenever you log back in.
      </div>
      <LegalFooter className="mt-6" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
