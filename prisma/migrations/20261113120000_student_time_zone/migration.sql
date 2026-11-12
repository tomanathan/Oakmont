-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timeZone" TEXT;


-- A first guess for students who already have a connected parent: the
-- parent's own zone (same household, nearly always). Their browser
-- corrects it the next time they open the app.
UPDATE "User" u SET "timeZone" = p."timeZone"
FROM "ParentLink" l JOIN "Parent" p ON p."id" = l."parentId"
WHERE l."studentId" = u."id" AND p."timeZone" IS NOT NULL AND u."timeZone" IS NULL;
