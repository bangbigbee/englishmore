-- CreateTable
CREATE TABLE "VocabularyItem" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "phonetic" TEXT,
    "meaning" TEXT NOT NULL,
    "example" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VocabularyItem_courseId_idx" ON "VocabularyItem"("courseId");

-- CreateIndex
CREATE INDEX "VocabularyItem_courseId_displayOrder_idx" ON "VocabularyItem"("courseId", "displayOrder");

-- AddForeignKey
ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
