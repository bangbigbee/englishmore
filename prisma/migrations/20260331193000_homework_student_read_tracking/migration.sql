-- AddColumn
ALTER TABLE "HomeworkSubmission" ADD COLUMN "studentLastReadAt" TIMESTAMP(3);

-- Initialize read marker for existing rows based on latest known submission update
UPDATE "HomeworkSubmission"
SET "studentLastReadAt" = COALESCE("submittedAt", "updatedAt")
WHERE "studentLastReadAt" IS NULL;
