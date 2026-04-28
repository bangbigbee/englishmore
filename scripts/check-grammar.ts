import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  const t = await prisma.vocabularyItem.findMany({ where: { topic: "Grammar: Essential Connectors - Từ nối thiết yếu" } });
  console.log("Count: ", t.length, t[0]?.category);
  const c = await prisma.vocabularyTopicConfig.findUnique({ where: { topic: "Grammar: Essential Connectors - Từ nối thiết yếu" } });
  console.log("Config: ", c);
}
run();
