import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const configs = await prisma.vocabularyTopicConfig.findMany();
    
    const basicTopics = configs.filter((c: any) => c.packageType === 'BASIC').map((c: any) => c.topic);
    const mixedTopics = configs.filter((c: any) => c.packageType === 'MIXED').map((c: any) => c.topic);
    
    const allWords = await (prisma as any).vocabularyItem.findMany({
      where: { category: 'TOEIC', isActive: true },
      select: {
          id: true, word: true, phonetic: true, meaning: true, example: true, exampleVi: true, topic: true, synonyms: true, antonyms: true, collocations: true, toeicTrap: true
      }
    });

    const basicWords = allWords.filter((w: any) => basicTopics.includes(w.topic));
    const mixedWords = allWords.filter((w: any) => mixedTopics.includes(w.topic));
    const advancedWords = allWords.filter((w: any) => !basicTopics.includes(w.topic) && !mixedTopics.includes(w.topic)); // Default to advanced

    const getRandom = (arr: any[], n: number) => {
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len) return arr;
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    };

    const finalWords = [
        ...getRandom(basicWords, 10),
        ...getRandom(advancedWords, 15),
        ...getRandom(mixedWords, 5)
    ];

    const shuffled = finalWords.sort(() => 0.5 - Math.random());

    return NextResponse.json({ items: shuffled });

  } catch (error) {
    console.error('Error fetching global challenge words:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
