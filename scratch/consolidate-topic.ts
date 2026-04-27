import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Consolidating 3 levels into 1 Topic...");
  
  // Create the new consolidated topic
  const newTopicSlug = 'cau-truc-chu-ngu-va-danh-tu';
  let newTopic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: newTopicSlug } });
  
  if (!newTopic) {
    newTopic = await prisma.toeicGrammarTopic.create({
      data: {
        title: "Cấu trúc Chủ ngữ & Danh từ",
        subtitle: "Nắm vững danh từ đếm được, quán từ, sở hữu cách làm chủ ngữ.",
        slug: newTopicSlug,
        level: "Tất cả các trình độ", // Level no longer dictates columns directly
        type: 'GRAMMAR',
        part: 5
      }
    });
  }

  // Get the 3 old topics
  const cbTopic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: 'cau-truc-chu-ngu-co-ban' }, include: { lessons: true } });
  const tcTopic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: 'cau-truc-chu-ngu-trung-cap' }, include: { lessons: true } });
  const ncTopic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: 'cau-truc-chu-ngu-nang-cao' }, include: { lessons: true } });

  let newOrder = 1;

  const processTopic = async (oldTopic: any, levelPrefix: string) => {
    if (!oldTopic) return;
    
    // update all lessons to point to the new topic and rename them
    const sortedLessons = oldTopic.lessons.sort((a: any, b: any) => a.order - b.order);
    for (const lesson of sortedLessons) {
      await prisma.toeicGrammarLesson.update({
        where: { id: lesson.id },
        data: { 
          topicId: newTopic.id,
          title: `[${levelPrefix}] Bài tập ${newOrder}: Chủ ngữ & Danh từ`,
          order: newOrder
        }
      });
      newOrder++;
    }
    
    // Delete the old topic (lessons and questions are already moved or retained)
    await prisma.toeicGrammarTopic.delete({ where: { id: oldTopic.id } });
    console.log(`Moved lessons and deleted old topic: ${oldTopic.slug}`);
  };

  await processTopic(cbTopic, 'Cơ Bản');
  await processTopic(tcTopic, 'Trung Cấp');
  await processTopic(ncTopic, 'Nâng Cao');

  console.log("Consolidation finished!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
