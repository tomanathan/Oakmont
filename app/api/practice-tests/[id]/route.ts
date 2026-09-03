import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { validatePracticeTestInput, type PracticeTestInput } from "@/lib/practiceTestValidation";

// A logged practice test previously had no way to be corrected or removed
// once saved -- a single typo (1600 instead of 1060) would permanently
// poison the analysis page's latest-test breakdown, history list, and "new
// best composite" celebration, with no recovery short of deleting the whole
// account. PATCH and DELETE close that gap.

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const existing = await prisma.practiceTest.findUnique({ where: { id: params.id } });
  // Same 404 whether the row doesn't exist or belongs to someone else --
  // doesn't leak which one to a student probing other ids.
  if (!existing || existing.userId !== user.userId) {
    return NextResponse.json({ error: "Practice test not found." }, { status: 404 });
  }

  let body: PracticeTestInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = validatePracticeTestInput(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { takenAt, compositeScore, rwScore, mathScore, domainCounts, domainScores } = result.value;

  const test = await prisma.practiceTest.update({
    where: { id: params.id },
    data: {
      takenAt,
      compositeScore,
      rwScore,
      mathScore,
      domainCounts: domainCounts as unknown as Prisma.InputJsonValue,
      domainScores,
    },
  });

  return NextResponse.json({ ok: true, test });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const existing = await prisma.practiceTest.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== user.userId) {
    return NextResponse.json({ error: "Practice test not found." }, { status: 404 });
  }

  await prisma.practiceTest.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
