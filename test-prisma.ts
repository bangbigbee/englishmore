import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const existingItems = await prisma.vocabularyItem.findMany({
    where: { category: 'TOEIC' },
    select: { word: true, meaning: true }
  });
  console.log('Total TOEIC vocabs:', existingItems.length);
  const words = existingItems.map(i => i.word);
  console.log('Sample words:', words.slice(0, 50));
}
main().finally(() => prisma.$disconnect());
