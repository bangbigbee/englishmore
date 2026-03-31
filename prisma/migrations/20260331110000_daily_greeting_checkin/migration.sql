-- CreateEnum
CREATE TYPE "GreetingInputMethod" AS ENUM ('text', 'voice');

-- CreateTable
CREATE TABLE "DailyGreetingCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "responseDate" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "inputMethod" "GreetingInputMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyGreetingCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyGreetingCheckin_userId_responseDate_key" ON "DailyGreetingCheckin"("userId", "responseDate");

-- CreateIndex
CREATE INDEX "DailyGreetingCheckin_responseDate_idx" ON "DailyGreetingCheckin"("responseDate");

-- AddForeignKey
ALTER TABLE "DailyGreetingCheckin" ADD CONSTRAINT "DailyGreetingCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
