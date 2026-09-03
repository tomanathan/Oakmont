import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { validatePracticeTestInput, type PracticeTestInput } from "@/lib/practiceTestValidation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const tests = await prisma.practiceTest.findMany({
    where: { userId: user.userId },
    orderBy: { takenAt: "desc" },
  });

  return NextResponse.json({ tests });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
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

  const test = await prisma.practiceTest.create({
    data: {
      userId: user.userId,
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
