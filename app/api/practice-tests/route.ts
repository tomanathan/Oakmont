import { NextRequest, NextResponse } from "next/server";
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
    domainScores?: Record<string, number | null>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { takenAt, compositeScore, rwScore, mathScore, domainScores } = body;

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

  const cleanDomainScores: Record<string, number> = {};
  if (domainScores) {
    for (const [domain, score] of Object.entries(domainScores)) {
      if (score === null || score === undefined) continue;
      if (!VALID_DOMAINS.has(domain)) continue;
      if (typeof score !== "number" || score < 0 || score > 100) {
        return NextResponse.json({ error: `Invalid score for ${domain}.` }, { status: 400 });
      }
      cleanDomainScores[domain] = score;
    }
  }

  const test = await prisma.practiceTest.create({
    data: {
      userId: user.userId,
      takenAt: parsedDate,
      compositeScore,
      rwScore,
      mathScore,
      domainScores: cleanDomainScores,
    },
  });

  return NextResponse.json({ ok: true, test });
}
