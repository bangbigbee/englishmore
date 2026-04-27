import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const lessons = await prisma.toeicGrammarLesson.findMany({
    where: { title: { contains: 'Chủ ngữ & Danh từ' } },
    orderBy: { order: 'asc' }
  });

  for (const lesson of lessons) {
    const match = lesson.title.match(/Lesson (\d+)/);
    if (match) {
        const num = match[1];
        const newTitle = `Bài tập ${num}: Chủ ngữ & Danh từ`;
        await prisma.toeicGrammarLesson.update({
            where: { id: lesson.id },
            data: { title: newTitle }
        });
        console.log(`Updated lesson to: ${newTitle}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
