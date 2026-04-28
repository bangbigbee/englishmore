import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  const topics = await prisma.vocabularyItem.findMany({ select: { topic: true }, distinct: ["topic"] });
  console.log("Topics:", topics.map(t => t.topic));
  await prisma.$disconnect();
}
run();
