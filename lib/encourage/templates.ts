import { PET_NAME } from "@/lib/pet";
import type { TodayPlan } from "@/lib/todayPlan";
import { APP_URL } from "./config";

// The four daily emails, as pure functions of what we know about someone
// (so they can be previewed and tested without a database):
//   student morning: today's piece of the plan, and where they stand
//   student nudge:   mid-afternoon, only if they haven't studied yet
//   parent morning:  what each student did in the last day, what's next,
//                    and one easy way to help
//   parent nudge:    mid-afternoon, only for a student who hasn't studied
// Short on purpose, one button each, never a guilt trip: a break costs
// nothing that one session doesn't bring back (see lib/pet.ts).

// A postal address for the footer, if the business has one to show (US
// rules expect it on promotional email). Empty: the line is left out.
export const MAILING_ADDRESS = "";

export interface Email {
  subject: string;
  html: string;
}

export interface StudentCtx {
  name: string | null;
  streak: number;
  // Whole days since they last studied (0 = today). From signup if never.
  daysInactive: number;
  everStudied: boolean;
  plan: TodayPlan;
  daysToTest: number | null;
}

export interface KidCtx {
  name: string;
  // The last 24 hours, or null if they didn't study.
  last24: { questions: number; correct: number; minutes: number; lessons: number } | null;
  streak: number;
  daysInactive: number;
  everStudied: boolean;
  plan: TodayPlan;
  daysToTest: number | null;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const days = (n: number) => `${n} day${n === 1 ? "" : "s"}`;
const FOREST = "#3461c1"; // the brand blue; the name is from the old green theme

function button(label: string, href: string): string {
  return `<p style="margin:22px 0 4px;"><a href="${APP_URL}${href}" style="display:inline-block;background:${FOREST};color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">${esc(label)}</a></p>`;
}

function box(label: string, title: string, extra = ""): string {
  return `<div style="margin:18px 0 0;padding:14px 16px;border-radius:12px;background:#e9effb;border:1px solid #c2d1ee;">
    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4a67a6;">${esc(label)}</div>
    <div style="font-size:17px;font-weight:700;color:#1f2f5a;margin-top:3px;font-family:Georgia,serif;">${esc(title)}</div>${extra}
  </div>`;
}

function shell(heading: string, body: string, unsubscribeUrl: string, footNote: string): string {
  return `<div style="background:#eef3fb;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="font-size:13px;font-weight:700;letter-spacing:.06em;color:${FOREST};margin:0 4px 10px;">OAKMONT SAT PREP</div>
    <div style="background:#ffffff;border:1px solid #c9d6ee;border-radius:16px;padding:26px 24px;">
      <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:23px;line-height:1.25;color:#1f2f5a;">${esc(heading)}</h1>
      ${body}
    </div>
    <p style="margin:14px 6px 0;font-size:12px;line-height:1.5;color:#7f8aa6;">
      ${esc(footNote)} <a href="${unsubscribeUrl}" style="color:#7f8aa6;text-decoration:underline;">Turn these emails off</a>.${MAILING_ADDRESS ? `<br>${esc(MAILING_ADDRESS)}` : ""}
    </p>
  </div>
</div>`;
}

const p = (html: string) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.55;color:#3b4763;">${html}</p>`;

function planBox(plan: TodayPlan): string {
  const tip = plan.tip ? `<div style="font-size:13.5px;line-height:1.5;color:#3b4763;margin-top:8px;"><b>One thing to remember:</b> ${esc(plan.tip)}</div>` : "";
  const sub =
    plan.kind === "review"
      ? `<div style="font-size:13.5px;color:#3b4763;margin-top:6px;">A short set from everything you&#39;ve covered so far.</div>`
      : plan.kind === "test"
        ? `<div style="font-size:13.5px;color:#3b4763;margin-top:6px;">A full-length test. Set aside the time and treat it like the real thing.</div>`
        : plan.kind === "rest"
          ? `<div style="font-size:13.5px;color:#3b4763;margin-top:6px;">Nothing new today. A few review questions still count if you want them.</div>`
          : tip;
  return box("Today in your plan", plan.title, sub);
}

function startLabel(plan: TodayPlan): string {
  return plan.kind === "lesson" ? "Start today's lesson" : plan.kind === "test" ? "Open the practice test" : plan.kind === "review" ? "Start today's review" : "Open Oakmont";
}

const countdown = (n: number | null) => (n !== null && n > 0 && n <= 120 ? p(`${days(n)} until your SAT.`) : "");

// ---------- student ----------

export function studentMorning(c: StudentCtx, unsubscribeUrl: string): Email {
  const hi = c.name ? `Hi ${esc(c.name)},` : "Hi,";
  let subject: string;
  let heading: string;
  let lead: string;
  if (!c.everStudied) {
    subject = "Your first lesson is ready";
    heading = "Your first lesson is ready";
    lead = `${PET_NAME} has your plan laid out. The first piece is short: read the lesson, try the quiz, and that&#39;s day one done.`;
  } else if (c.daysInactive >= 4) {
    subject = `${PET_NAME} is cold. One lesson warms him up.`;
    heading = `${PET_NAME} got cold while you were away`;
    lead = `It&#39;s been ${days(c.daysInactive)}, so ${PET_NAME} has gone blue and shivery. He&#39;s okay: one lesson or a quick quiz warms him right back up, and your plan picks up where you left off.`;
  } else if (c.daysInactive >= 2) {
    subject = `Pick it back up with ${c.plan.title}`;
    heading = "Ready when you are";
    lead = `It&#39;s been ${days(c.daysInactive)} since your last session, and ${PET_NAME} is getting hungry. Today&#39;s piece is waiting, and it&#39;s a short one.`;
  } else if (c.streak >= 2) {
    subject = `Day ${c.streak + (c.daysInactive === 0 ? 0 : 1)} of your streak: ${c.plan.title}`;
    heading = `${c.streak} days in a row`;
    lead = `You&#39;ve studied ${c.streak} days running. Here&#39;s today&#39;s piece to make it ${c.streak + 1}.`;
  } else {
    subject = `Today: ${c.plan.title}`;
    heading = "Here's today's piece";
    lead = `One lesson or quiz a day is the whole plan. Here&#39;s today&#39;s.`;
  }
  const body = `${p(hi)}${p(lead)}${planBox(c.plan)}${button(startLabel(c.plan), c.plan.href)}<div style="margin-top:14px;">${countdown(c.daysToTest)}</div>`;
  return { subject, html: shell(heading, body, unsubscribeUrl, "You get this each morning because you have an Oakmont account.") };
}

export function studentNudge(c: StudentCtx, unsubscribeUrl: string): Email {
  const hi = c.name ? `Hi ${esc(c.name)},` : "Hi,";
  const hasStreak = c.streak >= 2 && c.daysInactive <= 1;
  const subject = hasStreak ? `A couple of hours left to keep your ${c.streak}-day streak` : `Ten minutes with ${PET_NAME} today?`;
  const heading = hasStreak ? `Keep the ${c.streak}-day streak going` : "There's still time today";
  const lead = hasStreak
    ? `You haven&#39;t studied yet today, and your ${c.streak}-day streak has a couple of hours left on it. One lesson or a quick quiz keeps it alive.`
    : `You haven&#39;t studied yet today. One lesson or a quick quiz is enough to count, and ${PET_NAME} gets fed.`;
  const body = `${p(hi)}${p(lead)}${box("Today in your plan", c.plan.title)}${button(startLabel(c.plan), c.plan.href)}`;
  return { subject, html: shell(heading, body, unsubscribeUrl, "You get this on days you haven't studied yet.") };
}

// ---------- parent ----------

// One small, concrete thing a parent can do tonight. Rotates daily.
export const PARENT_PROMPTS = [
  "Ask what the trickiest question was today, and let them explain it to you. Explaining it is studying.",
  "Ask them to show you Ozho. A streak they've shown someone is one they want to keep.",
  "Pick the same time for SAT practice each day this week, tied to something that already happens, like right after dinner.",
  "Ask which skill felt easiest so far. Starting with a win makes the next session easier to open.",
  "Offer to keep phones in another room for fifteen minutes, yours included.",
  "Ask what their goal score is and what it's for. Saying it out loud makes the daily piece feel like it matters.",
  "Notice the effort, not the score: \"you kept your streak going on a busy day\" lands better than \"what did you get?\"",
  "Ask them to teach you one rule they learned this week, then try a question yourself.",
  "If they missed yesterday, skip the lecture. \"Want to do today's together?\" works better.",
  "Ask what kind of mistake they made most this week: rushing, misreading, or not knowing the rule. Naming it is half the fix.",
  "Put the test date on the family calendar where everyone can see it.",
  "A short session counts. If tonight is packed, ten minutes still keeps the habit.",
];

function kidCard(k: KidCtx, studentId: string): string {
  let did: string;
  if (k.last24) {
    const acc = k.last24.questions ? `, ${Math.round((k.last24.correct / k.last24.questions) * 100)}% right` : "";
    const parts = [
      k.last24.questions ? `${k.last24.questions} question${k.last24.questions === 1 ? "" : "s"}${acc}` : "",
      k.last24.lessons ? `${k.last24.lessons} lesson${k.last24.lessons === 1 ? "" : "s"} read` : "",
      k.last24.minutes ? `about ${k.last24.minutes} min` : "",
    ].filter(Boolean);
    did = `<b style="color:#2f6f4f;">Studied in the last day:</b> ${esc(parts.join(" · "))}.${k.streak >= 2 ? ` ${k.streak} days in a row.` : ""}`;
  } else if (!k.everStudied) {
    did = "Hasn&#39;t started yet. The first lesson is short.";
  } else {
    did = `No study in the last day. Last studied ${k.daysInactive <= 1 ? "yesterday" : `${days(k.daysInactive)} ago`}.`;
  }
  const next = k.plan.kind === "rest" ? "A rest day in the plan." : `Next in the plan: <b>${esc(k.plan.title)}</b>.`;
  const test = k.daysToTest !== null && k.daysToTest > 0 && k.daysToTest <= 120 ? ` ${days(k.daysToTest)} until the SAT.` : "";
  return `<div style="margin:14px 0 0;padding:14px 16px;border-radius:12px;border:1px solid #c9d6ee;">
    <div style="font-size:17px;font-weight:700;color:#1f2f5a;font-family:Georgia,serif;">${esc(k.name)}</div>
    <div style="font-size:14.5px;line-height:1.55;color:#3b4763;margin-top:4px;">${did}</div>
    <div style="font-size:14.5px;line-height:1.55;color:#3b4763;margin-top:2px;">${next}${test}</div>
    <div style="margin-top:8px;"><a href="${APP_URL}/parent/dashboard?student=${encodeURIComponent(studentId)}" style="font-size:13.5px;font-weight:600;color:${FOREST};">See ${esc(k.name)}&#39;s progress</a></div>
  </div>`;
}

const listNames = (names: string[]) => (names.length <= 1 ? names[0] ?? "" : names.length === 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

export function parentMorning(kids: { id: string; ctx: KidCtx }[], promptIndex: number, unsubscribeUrl: string): Email {
  const first = kids[0].ctx;
  const studied = kids.filter((k) => k.ctx.last24);
  let subject: string;
  if (kids.length === 1) {
    subject = first.last24
      ? `${first.name} studied${first.last24.questions ? `: ${first.last24.questions} questions in the last day` : " in the last day"}`
      : first.plan.kind === "rest"
        ? `${first.name}'s SAT prep today`
        : `${first.name}'s plan for today: ${first.plan.title}`;
  } else {
    subject = studied.length ? `${listNames(studied.map((k) => k.ctx.name))} studied in the last day` : `Today's SAT plan for ${listNames(kids.map((k) => k.ctx.name))}`;
  }
  const prompt = PARENT_PROMPTS[((promptIndex % PARENT_PROMPTS.length) + PARENT_PROMPTS.length) % PARENT_PROMPTS.length];
  const body = `${kids.map((k) => kidCard(k.ctx, k.id)).join("")}
    <div style="margin:16px 0 0;padding:14px 16px;border-radius:12px;background:#e9effb;border:1px solid #c2d1ee;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4a67a6;">One way to help today</div>
      <div style="font-size:14.5px;line-height:1.55;color:#1f2f5a;margin-top:4px;">${esc(prompt)}</div>
    </div>`;
  return { subject, html: shell(kids.length === 1 ? `${first.name}'s SAT prep, today` : "Today's SAT prep", body, unsubscribeUrl, "You get this each morning because you're connected to a student on Oakmont. The weekly report is separate.") };
}

export function parentNudge(kids: { id: string; ctx: KidCtx }[], unsubscribeUrl: string): Email {
  const names = listNames(kids.map((k) => k.ctx.name));
  const one = kids.length === 1 ? kids[0].ctx : null;
  const streak = one && one.streak >= 2 && one.daysInactive <= 1 ? ` ${one.name} has a ${one.streak}-day streak with a couple of hours left on it.` : "";
  const body = `${p(`${esc(names)} ${kids.length === 1 ? "hasn&#39;t" : "haven&#39;t"} studied yet today.${esc(streak)}`)}
    ${p("A light nudge is usually enough: one lesson or a quick quiz counts, and it takes about ten minutes.")}
    ${kids.map((k) => box(`${k.ctx.name}'s plan today`, k.ctx.plan.title)).join("")}
    ${button(kids.length === 1 ? `See ${kids[0].ctx.name}'s progress` : "Open the parent dashboard", kids.length === 1 ? `/parent/dashboard?student=${encodeURIComponent(kids[0].id)}` : "/parent/dashboard")}`;
  return {
    subject: `${names} ${kids.length === 1 ? "hasn't" : "haven't"} studied yet today`,
    html: shell("A good moment for a nudge", body, unsubscribeUrl, "You get this on days your student hasn't studied yet."),
  };
}
