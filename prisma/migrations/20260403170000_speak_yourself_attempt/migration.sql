-- CreateTable
CREATE TABLE "SpeakYourselfAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "profilePayload" JSONB NOT NULL,
    "generatedScript" TEXT NOT NULL,
    "recognizedText" TEXT NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakYourselfAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeakYourselfAttempt_userId_idx" ON "SpeakYourselfAttempt"("userId");

-- CreateIndex
CREATE INDEX "SpeakYourselfAttempt_courseId_idx" ON "SpeakYourselfAttempt"("courseId");

-- CreateIndex
CREATE INDEX "SpeakYourselfAttempt_enrollmentId_idx" ON "SpeakYourselfAttempt"("enrollmentId");

-- CreateIndex
CREATE INDEX "SpeakYourselfAttempt_userId_courseId_createdAt_idx" ON "SpeakYourselfAttempt"("userId", "courseId", "createdAt");

-- AddForeignKey
ALTER TABLE "SpeakYourselfAttempt" ADD CONSTRAINT "SpeakYourselfAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakYourselfAttempt" ADD CONSTRAINT "SpeakYourselfAttempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakYourselfAttempt" ADD CONSTRAINT "SpeakYourselfAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
