import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const topics = await prisma.toeicGrammarTopic.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      lessons: {
        include: {
          questions: true
        }
      }
    }
  });

  for (const t of topics) {
    console.log(`Topic: ${t.title} (Level: ${t.level}, slug: ${t.slug})`);
    console.log(`  Lessons: ${t.lessons.length}`);
    if (t.lessons.length > 0) {
      console.log(`  Questions in first lesson: ${t.lessons[0].questions.length}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
