ALTER TABLE "User" ADD COLUMN "activityPoints" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ActivityPointRule" (
    "id" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityPointRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActivityPointRule_activityKey_key" ON "ActivityPointRule"("activityKey");

CREATE TABLE "ActivityPointLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "referenceKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityPointLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActivityPointLog_referenceKey_key" ON "ActivityPointLog"("referenceKey");
CREATE INDEX "ActivityPointLog_userId_idx" ON "ActivityPointLog"("userId");
CREATE INDEX "ActivityPointLog_activityKey_idx" ON "ActivityPointLog"("activityKey");
CREATE INDEX "ActivityPointLog_createdAt_idx" ON "ActivityPointLog"("createdAt");

ALTER TABLE "ActivityPointLog"
ADD CONSTRAINT "ActivityPointLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ActivityPointRule" ("id", "activityKey", "label", "points", "isActive", "createdAt", "updatedAt")
VALUES
    ('apr_daily_checkin', 'daily_checkin', 'Daily Check-in', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('apr_daily_reflection', 'daily_reflection', 'Daily Reflection', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("activityKey") DO NOTHING;
