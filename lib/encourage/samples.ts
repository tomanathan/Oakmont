import type { TodayPlan } from "@/lib/todayPlan";
import { parentMorning, parentNudge, studentMorning, studentNudge, type Email, type KidCtx, type StudentCtx } from "./templates";

// The daily emails filled in with a made-up student, for the admin preview
// and the "send the samples to me" button. No real account is involved.

const lesson: TodayPlan = {
  kind: "lesson",
  title: "Words in Context",
  href: "/dashboard",
  tip: "Cover the blank and predict your own word first. Then pick the choice closest to it, instead of the one that merely sounds smart.",
};
const review: TodayPlan = { kind: "review", title: "Mixed review", href: "/dashboard", tip: null };

const student = (over: Partial<StudentCtx>): StudentCtx => ({ name: "Maya", streak: 0, daysInactive: 1, everStudied: true, plan: lesson, daysToTest: 46, ...over });
const kid = (over: Partial<KidCtx>): KidCtx => ({ name: "Maya", last24: null, streak: 0, daysInactive: 1, everStudied: true, plan: lesson, daysToTest: 46, ...over });

export interface Sample {
  id: string;
  to: "Student" | "Parent";
  when: string;
  label: string;
  email: Email;
}

export function sampleEmails(unsubscribeUrl = "#"): Sample[] {
  return [
    { id: "s-streak", to: "Student", when: "Morning", label: "On a streak", email: studentMorning(student({ streak: 5 }), unsubscribeUrl) },
    { id: "s-first", to: "Student", when: "Morning", label: "Hasn't started yet", email: studentMorning(student({ everStudied: false, daysInactive: 2, daysToTest: null }), unsubscribeUrl) },
    { id: "s-lapsed", to: "Student", when: "Morning", label: "2 to 3 days away", email: studentMorning(student({ daysInactive: 3, plan: review }), unsubscribeUrl) },
    { id: "s-cold", to: "Student", when: "Morning", label: "4+ days away (Ozho is cold)", email: studentMorning(student({ daysInactive: 6 }), unsubscribeUrl) },
    { id: "s-nudge", to: "Student", when: "Afternoon", label: "Hasn't studied yet today", email: studentNudge(student({ streak: 5 }), unsubscribeUrl) },
    {
      id: "p-studied",
      to: "Parent",
      when: "Morning",
      label: "Their student studied",
      email: parentMorning([{ id: "sample", ctx: kid({ last24: { questions: 24, correct: 19, minutes: 22, lessons: 1 }, streak: 5, daysInactive: 0 }) }], 0, unsubscribeUrl),
    },
    { id: "p-quiet", to: "Parent", when: "Morning", label: "No study in the last day", email: parentMorning([{ id: "sample", ctx: kid({ daysInactive: 2 }) }], 8, unsubscribeUrl) },
    { id: "p-nudge", to: "Parent", when: "Afternoon", label: "Their student hasn't studied yet today", email: parentNudge([{ id: "sample", ctx: kid({ streak: 5 }) }], unsubscribeUrl) },
  ];
}
