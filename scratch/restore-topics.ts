import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Splitting consolidated topic back into 3 levels...");
  
  const consolidatedTopic = await prisma.toeicGrammarTopic.findUnique({ 
    where: { slug: 'cau-truc-chu-ngu-va-danh-tu' }, 
    include: { lessons: true } 
  });

  if (!consolidatedTopic) {
    console.log("Consolidated topic not found.");
    return;
  }

  const baseTitle = "Cấu trúc Chủ ngữ & Danh từ";
  const levelsData = [
    { level: "Cơ Bản", slug: "cau-truc-chu-ngu-co-ban", keyword: "[Cơ Bản]" },
    { level: "Trung Cấp", slug: "cau-truc-chu-ngu-trung-cap", keyword: "[Trung Cấp]" },
    { level: "Nâng Cao", slug: "cau-truc-chu-ngu-nang-cao", keyword: "[Nâng Cao]" }
  ];

  for (const lData of levelsData) {
    // Re-create the level topic
    let newTopic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: lData.slug } });
    if (!newTopic) {
      newTopic = await prisma.toeicGrammarTopic.create({
        data: {
          title: baseTitle,
          subtitle: `Nắm vững cấu trúc Chủ ngữ và Danh từ ở cấp độ ${lData.level}`,
          slug: lData.slug,
          level: lData.level,
          type: 'GRAMMAR',
          part: 5
        }
      });
    }

    // Find lessons belonging to this level and move them
    const levelLessons = consolidatedTopic.lessons.filter(lesson => lesson.title.includes(lData.keyword));
    
    let order = 1;
    for (const lesson of levelLessons) {
      const newTitle = lesson.title.replace(`${lData.keyword} `, ''); // Remove [Cơ Bản] etc
      await prisma.toeicGrammarLesson.update({
        where: { id: lesson.id },
        data: {
          topicId: newTopic.id,
          title: newTitle,
          order: order
        }
      });
      order++;
    }
    console.log(`Restored topic ${lData.slug} with ${levelLessons.length} lessons`);
  }

  // Delete the consolidated topic since it's now empty
  await prisma.toeicGrammarTopic.delete({ where: { id: consolidatedTopic.id } });
  console.log("Deleted consolidated topic.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
