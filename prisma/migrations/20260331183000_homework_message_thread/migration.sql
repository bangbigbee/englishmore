-- CreateEnum
CREATE TYPE "HomeworkMessageSender" AS ENUM ('student', 'teacher');

-- CreateTable
CREATE TABLE "HomeworkMessage" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "senderRole" "HomeworkMessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeworkMessage_submissionId_idx" ON "HomeworkMessage"("submissionId");

-- CreateIndex
CREATE INDEX "HomeworkMessage_createdAt_idx" ON "HomeworkMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "HomeworkMessage" ADD CONSTRAINT "HomeworkMessage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "HomeworkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing single-turn data into threaded messages
INSERT INTO "HomeworkMessage" ("id", "submissionId", "senderRole", "content", "createdAt", "updatedAt")
SELECT
    CONCAT('migrated-student-', hs."id"),
    hs."id",
    'student'::"HomeworkMessageSender",
    hs."note",
    hs."submittedAt",
    hs."updatedAt"
FROM "HomeworkSubmission" hs
WHERE hs."note" IS NOT NULL AND BTRIM(hs."note") <> '';

INSERT INTO "HomeworkMessage" ("id", "submissionId", "senderRole", "content", "createdAt", "updatedAt")
SELECT
    CONCAT('migrated-teacher-', hs."id"),
    hs."id",
    'teacher'::"HomeworkMessageSender",
    hs."teacherComment",
    hs."updatedAt",
    hs."updatedAt"
FROM "HomeworkSubmission" hs
WHERE hs."teacherComment" IS NOT NULL AND BTRIM(hs."teacherComment") <> '';
