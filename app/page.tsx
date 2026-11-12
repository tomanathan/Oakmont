import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getCurrentParent } from "@/lib/parentSession";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Oakmont Study Center — Every SAT skill, one week at a time",
  description:
    "A complete SAT plan (six months recommended, sized to fit your test date) covering all 29 official SAT skills. Try a sample question free, no account needed.",
  alternates: { canonical: "https://oakmontsat.com" },
  openGraph: {
    title: "Oakmont Study Center — Every SAT skill, one week at a time",
    description:
      "A complete SAT plan (six months recommended, sized to fit your test date) covering all 29 official SAT skills. Try a sample question free, no account needed.",
    url: "https://oakmontsat.com",
    siteName: "Oakmont Study Center",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oakmont Study Center — Every SAT skill, one week at a time",
    description: "A complete SAT plan (six months recommended, sized to fit your test date) covering all 29 official SAT skills.",
  },
};

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    // A signed-in parent has a dashboard of their own to go back to.
    if (await getCurrentParent()) redirect("/parent/dashboard");
    return <LandingPage />;
  }

  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) redirect("/subscribe");

  redirect("/dashboard");
}
