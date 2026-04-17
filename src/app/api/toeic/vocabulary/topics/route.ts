import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Returns distinct topics from VocabularyItem where category = 'TOEIC', with word counts and learned counts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups = await (prisma as any).vocabularyItem.groupBy({
      by: ['topic'],
      where: { category: 'TOEIC', isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    })

    let learnedCounts: Record<string, number> = {};

    if (session?.user?.id) {
      const userTags = await prisma.vocabularyTag.findMany({
        where: {
          userId: session.user.id,
          isLearned: true,
          vocabulary: { category: 'TOEIC' }
        },
        include: { vocabulary: { select: { topic: true } } }
      });

      userTags.forEach(tag => {
        const topicName = tag.vocabulary?.topic;
        if (topicName) {
          learnedCounts[topicName] = (learnedCounts[topicName] || 0) + 1;
        }
      });
    }

    const groupedTopics = groups as { topic: string; _count: { id: number } }[];
    const topicsNames = groupedTopics.map(g => g.topic);
    const configs = await prisma.vocabularyTopicConfig.findMany({
      where: { topic: { in: topicsNames } }
    });
    const configMap = new Map(configs.map(c => [c.topic, c]));

    const topics = groupedTopics.map((g) => ({
      topic: g.topic,
      wordCount: g._count.id,
      learnedCount: learnedCounts[g.topic] || 0,
      packageType: configMap.get(g.topic)?.packageType || 'ADVANCED'
    }))

    return NextResponse.json({ topics })
  } catch (err) {
    console.error('[GET /api/toeic/vocabulary/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
