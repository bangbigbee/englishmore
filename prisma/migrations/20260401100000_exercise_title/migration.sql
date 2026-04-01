ALTER TABLE "CourseExercise"
ADD COLUMN "title" TEXT;

UPDATE "CourseExercise"
SET "title" = 'Exercise ' || "order"
WHERE "title" IS NULL OR btrim("title") = '';

ALTER TABLE "CourseExercise"
ALTER COLUMN "title" SET NOT NULL;
