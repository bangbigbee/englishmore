import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: 'Hiếu Nguyễn Minh' } },
    select: { id: true, name: true }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Processing for user:', user.name);

  // @ts-ignore
  const logs = await prisma.toeicStarLog.findMany({
    where: { 
      userId: user.id,
      activityKey: 'pronunciation_correct'
    },
    select: { referenceKey: true }
  });

  const wordIds = new Set<string>();

  for (const log of logs) {
    // referenceKey format: pronunciation_${wordId}_${date}
    const parts = log.referenceKey.split('_');
    // Parts: ['pronunciation', 'wordId', 'date']
    // Since wordId could be a CUID (cl...) we can extract it.
    if (parts.length >= 3 && parts[1].length > 10) {
      wordIds.add(parts[1]);
    }
  }

  console.log(`Found ${wordIds.size} unique vocab words pronounced correctly.`);

  let updatedCount = 0;
  for (const wordId of wordIds) {
    try {
      await prisma.vocabularyTag.upsert({
        where: {
          userId_vocabId: { userId: user.id, vocabId: wordId }
        },
        create: {
          userId: user.id,
          vocabId: wordId,
          isLearned: true
        },
        update: {
          isLearned: true
        }
      });
      updatedCount++;
    } catch (e) {
      console.log(`Failed for wordId: ${wordId}`);
    }
  }

  console.log(`Successfully updated ${updatedCount} words as learned for ${user.name}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
