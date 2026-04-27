import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up mistakenly generated topics...');
  
  const slugsToDelete = [
    'cau-truc-chu-ngu-co-ban', 'cau-truc-chu-ngu-trung-cap', 'cau-truc-chu-ngu-nang-cao',
    'cac-thi-hien-tai-co-ban', 'cac-thi-hien-tai-trung-cap', 'cac-thi-hien-tai-nang-cao',
    'cac-thi-qua-khu-tuong-lai-co-ban', 'cac-thi-qua-khu-tuong-lai-trung-cap', 'cac-thi-qua-khu-tuong-lai-nang-cao',
    'su-hoa-hop-chu-vi-co-ban', 'su-hoa-hop-chu-vi-trung-cap', 'su-hoa-hop-chu-vi-nang-cao',
    'dai-tu-co-ban', 'dai-tu-trung-cap', 'dai-tu-nang-cao'
  ];

  for (const slug of slugsToDelete) {
    const topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
    if (topic) {
        await prisma.toeicQuestion.deleteMany({
            where: { lesson: { topicId: topic.id } }
        });
        await prisma.toeicGrammarLesson.deleteMany({
            where: { topicId: topic.id }
        });
        await prisma.toeicGrammarTopic.delete({
            where: { id: topic.id }
        });
        console.log(`Deleted: ${slug}`);
    }
  }

  console.log('Cleanup finished.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
