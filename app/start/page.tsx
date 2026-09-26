import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ALL_DOMAINS, ALL_SUBSKILLS } from "@/data/curriculum";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { upcomingSatDates, weeksUntil } from "@/lib/satDates";
import { googleEnabled } from "@/lib/googleAuth";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import { readStartCookie, starterItems } from "@/lib/starter";
import { StartClient, type StarterQuestion } from "./StartClient";

// The front door for students: five real questions before any account,
// then a test date, their plan, and "save my plan". See lib/starter.ts.

export const metadata: Metadata = {
  title: "Try 5 SAT questions · Oakmont",
  description: "Five quick SAT questions, instant explanations, and a study plan built around you. Free, no account needed to start.",
};
export const dynamic = "force-dynamic";

export default async function StartPage({ searchParams }: { searchParams: { invite?: string; error?: string } }) {
  const invite = searchParams.invite?.slice(0, 64) ?? null;
  const user = await getCurrentUser();
  // Already have an account: an invite goes through the normal connect page.
  if (user) redirect(invite ? `/link/${invite}` : "/dashboard");

  const [state, inviteRow] = await Promise.all([
    readStartCookie(),
    invite
      ? prisma.parentInvite.findUnique({ where: { token: invite }, include: { parent: { select: { email: true } } } })
      : Promise.resolve(null),
  ]);
  const validInvite = inviteRow && !inviteRow.usedAt && inviteRow.expiresAt > new Date() ? inviteRow : null;

  const questions: StarterQuestion[] = starterItems().map((it) => ({
    id: it.id,
    q: it.q,
    choices: it.choices,
    answer: it.answer,
    explain: it.explain,
    why: it.why ?? null,
    skill: it.subskillId,
  }));

  // The order a brand-new student's plan uses (no results yet), so the plan
  // preview here matches the dashboard they land on.
  const byDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (byDomain[s.domain] ??= []).push(s.id);
  const order = orderSubskillsByWeakness(ALL_SUBSKILLS, computeDomainMastery(ALL_DOMAINS, byDomain, {}, null));

  const now = new Date();
  const inApp = isInAppBrowser();
  return (
    <StartClient
      questions={questions}
      savedAnswers={state?.answers ?? {}}
      savedDate={state?.date ?? undefined}
      skillNames={Object.fromEntries(ALL_SUBSKILLS.map((s) => [s.id, s.name]))}
      order={order}
      satDates={upcomingSatDates(now).map((d) => ({ date: d.date, label: d.label, weeks: weeksUntil(d.date, now) }))}
      today={now.toISOString().slice(0, 10)}
      invite={validInvite ? { token: validInvite.token, parentEmail: validInvite.parent.email } : null}
      google={googleEnabled() && !inApp}
      inApp={inApp}
      googleError={searchParams.error === "google" || searchParams.error === "google_other_account"}
    />
  );
}
