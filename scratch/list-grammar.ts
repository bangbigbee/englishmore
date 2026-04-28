import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const topics = await prisma.toeicGrammarTopic.findMany({
    where: { type: 'GRAMMAR' },
    orderBy: { createdAt: 'asc' },
    select: { title: true, slug: true, level: true, id: true }
  });
  console.log(JSON.stringify(topics, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
