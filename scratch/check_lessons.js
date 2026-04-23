const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.toeicGrammarLesson.findMany({
    where: { topic: { title: { contains: 'ETS' } } },
    take: 10,
    include: { topic: true }
  });
  console.log(lessons.map(l => ({ id: l.id, title: l.title, topicTitle: l.topic.title, type: l.topic.type, part: l.topic.part })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
