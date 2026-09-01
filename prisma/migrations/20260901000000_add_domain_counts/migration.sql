-- Raw correct/total question counts per domain, alongside the existing
-- derived domainScores percentage -- lets the practice-test form and
-- history round-trip the literal numbers Bluebook's own score report
-- shows (e.g. "11/13") instead of a lossy percentage.
ALTER TABLE "PracticeTest" ADD COLUMN "domainCounts" JSONB NOT NULL DEFAULT '{}';
