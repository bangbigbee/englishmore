import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const groupedTopics = [
  { baseSlug: 'cau-truc-chu-ngu', targetLevel: 'Cơ Bản' },
  { baseSlug: 'cac-thi-hien-tai', targetLevel: 'Cơ Bản' },
  { baseSlug: 'cac-thi-qua-khu-tuong-lai', targetLevel: 'Cơ Bản' },
  { baseSlug: 'su-hoa-hop-chu-vi', targetLevel: 'Trung Cấp' },
  { baseSlug: 'dai-tu', targetLevel: 'Cơ Bản' },
  { baseSlug: 'dong-tu-tan-ngu', targetLevel: 'Trung Cấp' },
  { baseSlug: 'dong-tu-ban-khiem-khuyet', targetLevel: 'Nâng Cao' },
  { baseSlug: 'cau-hoi', targetLevel: 'Cơ Bản' },
  { baseSlug: 'phu-hoa', targetLevel: 'Trung Cấp' },
  { baseSlug: 'menh-lenh-thuc', targetLevel: 'Cơ Bản' },
  { baseSlug: 'dong-tu-khiem-khuyet', targetLevel: 'Trung Cấp' },
  { baseSlug: 'cau-dieu-kien', targetLevel: 'Trung Cấp' },
  { baseSlug: 'cau-truc-as-if-hope-wish', targetLevel: 'Nâng Cao' },
];

async function run() {
  for (const group of groupedTopics) {
    console.log(`Processing group: ${group.baseSlug}`);
    
    // Fetch all 3 topics for this group
    const topics = await prisma.toeicGrammarTopic.findMany({
      where: {
        slug: {
          in: [`${group.baseSlug}-co-ban`, `${group.baseSlug}-trung-cap`, `${group.baseSlug}-nang-cao`]
        }
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (topics.length === 0) {
      console.log(`No topics found for ${group.baseSlug}, skipping.`);
      continue;
    }

    // Find main topic based on target level
    let targetSuffix = 'co-ban';
    if (group.targetLevel === 'Trung Cấp') targetSuffix = 'trung-cap';
    if (group.targetLevel === 'Nâng Cao') targetSuffix = 'nang-cao';

    let mainTopic = topics.find(t => t.slug === `${group.baseSlug}-${targetSuffix}`);
    
    // Fallback to first topic if target is not found (shouldn't happen)
    if (!mainTopic) {
        mainTopic = topics[0];
    }

    const otherTopics = topics.filter(t => t.id !== mainTopic.id);

    // Update main topic
    await prisma.toeicGrammarTopic.update({
      where: { id: mainTopic.id },
      data: {
        slug: group.baseSlug,
        level: group.targetLevel,
        subtitle: `Tổng hợp kiến thức ${mainTopic.title}` // Remove old level suffix
      }
    });

    // Gather all lessons
    const cbLessons = topics.find(t => t.slug.endsWith('-co-ban'))?.lessons || [];
    const tcLessons = topics.find(t => t.slug.endsWith('-trung-cap'))?.lessons || [];
    const ncLessons = topics.find(t => t.slug.endsWith('-nang-cao'))?.lessons || [];

    const allLessons = [...cbLessons, ...tcLessons, ...ncLessons];
    
    // Update lessons
    let currentOrder = 1;
    for (const lesson of allLessons) {
      let difficultyStr = '';
      if (currentOrder <= 2) difficultyStr = '(Dễ)';
      else if (currentOrder <= 4) difficultyStr = '(Trung bình)';
      else difficultyStr = '(Khó)';

      await prisma.toeicGrammarLesson.update({
        where: { id: lesson.id },
        data: {
          topicId: mainTopic.id,
          order: currentOrder,
          title: `Bài tập ${currentOrder} ${difficultyStr}: ${mainTopic.title}`
        }
      });
      currentOrder++;
    }

    // Delete other topics
    for (const ot of otherTopics) {
      await prisma.toeicGrammarTopic.delete({
        where: { id: ot.id }
      });
    }

    console.log(`Successfully consolidated ${group.baseSlug} into single topic with ${currentOrder - 1} lessons.`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
