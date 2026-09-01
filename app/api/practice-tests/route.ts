import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ALL_DOMAINS } from "@/data/curriculum";

const VALID_DOMAINS = new Set(ALL_DOMAINS.map((d) => d.domain));

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

interface DomainCount {
  correct: number;
  total: number;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: {
    takenAt?: string;
    compositeScore?: number;
    rwScore?: number;
    mathScore?: number;
    // The literal "X correct out of Y" fraction Bluebook's own score
    // report shows per domain -- e.g. { "Algebra": { correct: 11, total: 13 } }.
    // This replaces asking the student to mentally convert that into a
    // percentage themselves.
    domainCounts?: Record<string, DomainCount | null>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { takenAt, compositeScore, rwScore, mathScore, domainCounts } = body;

  if (
    typeof compositeScore !== "number" ||
    compositeScore < 400 ||
    compositeScore > 1600
  ) {
    return NextResponse.json({ error: "Composite score must be between 400 and 1600." }, { status: 400 });
  }
  if (typeof rwScore !== "number" || rwScore < 200 || rwScore > 800) {
    return NextResponse.json({ error: "Reading & Writing score must be between 200 and 800." }, { status: 400 });
  }
  if (typeof mathScore !== "number" || mathScore < 200 || mathScore > 800) {
    return NextResponse.json({ error: "Math score must be between 200 and 800." }, { status: 400 });
  }

  let parsedDate = new Date();
  if (takenAt) {
    const d = new Date(takenAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid test date." }, { status: 400 });
    }
    parsedDate = d;
  }

  // Validate the raw counts, then derive the percentage from them --
  // domainScores is never taken from the client directly, so the two can
  // never disagree.
  const cleanDomainCounts: Record<string, DomainCount> = {};
  const cleanDomainScores: Record<string, number> = {};
  if (domainCounts) {
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count === null || count === undefined) continue;
      if (!VALID_DOMAINS.has(domain)) continue;
      const { correct, total } = count;
      if (
        typeof correct !== "number" ||
        typeof total !== "number" ||
        !Number.isInteger(correct) ||
        !Number.isInteger(total) ||
        total <= 0 ||
        correct < 0 ||
        correct > total
      ) {
        return NextResponse.json({ error: `Invalid question count for ${domain}.` }, { status: 400 });
      }
      cleanDomainCounts[domain] = { correct, total };
      cleanDomainScores[domain] = Math.round((correct / total) * 100);
    }
  }

  const test = await prisma.practiceTest.create({
    data: {
      userId: user.userId,
      takenAt: parsedDate,
      compositeScore,
      rwScore,
      mathScore,
      domainCounts: cleanDomainCounts as unknown as Prisma.InputJsonValue,
      domainScores: cleanDomainScores,
    },
  });

  return NextResponse.json({ ok: true, test });
}
