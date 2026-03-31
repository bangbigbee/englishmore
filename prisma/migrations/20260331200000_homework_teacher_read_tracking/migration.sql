-- AddColumn
ALTER TABLE "HomeworkSubmission" ADD COLUMN "teacherLastReadAt" TIMESTAMP(3);

-- Initialize teacher read marker for existing rows
UPDATE "HomeworkSubmission"
SET "teacherLastReadAt" = COALESCE("submittedAt", "updatedAt")
WHERE "teacherLastReadAt" IS NULL;
