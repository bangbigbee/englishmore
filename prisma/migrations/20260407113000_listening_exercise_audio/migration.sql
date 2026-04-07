ALTER TABLE "CourseExercise"
ADD COLUMN "exerciseType" TEXT NOT NULL DEFAULT 'multiple_choice',
ADD COLUMN "audioFileUrl" TEXT;

ALTER TABLE "ExerciseQuestion"
ADD COLUMN "optionD" TEXT;

CREATE TABLE "ExerciseAudioFile" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAudioFile_pkey" PRIMARY KEY ("id")
);