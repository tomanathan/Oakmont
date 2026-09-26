import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSubskill } from "@/data/curriculum";
import { itemsForSubskill } from "@/lib/items";
import { starterItems } from "@/lib/starter";
import { PracticeClient, type PracticeQuestion } from "./PracticeClient";

export const metadata: Metadata = { title: "Your first practice · Oakmont", robots: { index: false } };
export const dynamic = "force-dynamic";

const COUNT = 5;

// Right after "save my plan": five more questions on the skill their starter
// picked out, with that skill's worked example shown on any miss (the lesson
// arrives as help at the moment it's needed), then the parent connection.
export default async function StartPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/start");
  const row = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { firstSkillId: true, firstName: true, parentLinks: { select: { id: true } } },
  });
  const skill = row?.firstSkillId ? getSubskill(row.firstSkillId) : null;
  if (!row || !skill) redirect("/dashboard");

  const starterIds = new Set(starterItems().map((i) => i.id));
  const rank = { easy: 0, medium: 1, hard: 2 } as const;
  const pool = itemsForSubskill(skill.id)
    .filter((q) => !starterIds.has(q.id) && q.difficulty !== "hard")
    .sort((a, b) => rank[a.difficulty ?? "medium"] - rank[b.difficulty ?? "medium"] || a.q.length - b.q.length);
  // A spread of question types, easiest first, rather than five of one kind.
  const picked: typeof pool = [];
  const seen = new Set<string>();
  for (const q of pool) if (picked.length < COUNT && !seen.has(q.pattern ?? "")) { picked.push(q); seen.add(q.pattern ?? ""); }
  for (const q of pool) if (picked.length < COUNT && !picked.includes(q)) picked.push(q);

  const questions: PracticeQuestion[] = picked.map((q) => {
    const pattern = skill.patterns.find((p) => p.name === q.pattern) ?? skill.patterns[0];
    const ex = pattern.examples[0];
    return {
      id: q.id,
      q: q.q,
      choices: q.choices,
      answer: q.answer,
      explain: q.explain,
      why: q.why ?? null,
      figure: q.figure ?? null,
      example: { pattern: pattern.name, q: ex.q, choices: ex.choices, answer: ex.answer, explain: ex.explain },
    };
  });

  return (
    <PracticeClient
      skillId={skill.id}
      skillName={skill.name}
      firstName={row.firstName}
      questions={questions}
      parentConnected={row.parentLinks.length > 0}
    />
  );
}
