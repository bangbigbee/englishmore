-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_key" ON "Enrollment"("studentId");
