-- Add attachmentFileUrl to CourseExercise
ALTER TABLE "CourseExercise" ADD COLUMN "attachmentFileUrl" TEXT;

-- Create ExerciseAttachmentFile table
CREATE TABLE "ExerciseAttachmentFile" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExerciseAttachmentFile_pkey" PRIMARY KEY ("id")
);

-- Migrate legacy listening_audio exercises to question_response
UPDATE "CourseExercise" SET "exerciseType" = 'question_response' WHERE "exerciseType" = 'listening_audio';
