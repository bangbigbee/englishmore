import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      where: { toeicStars: { gt: 0 } },
      orderBy: { toeicStars: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
        toeicStars: true,
        totalStudySeconds: true,
        _count: {
          select: {
            vocabularyTags: { where: { isLearned: true } }
          }
        }
      }
    });

    if (topUsers.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userIds = topUsers.map(u => u.id);

    // Using raw SQL to group counts by topic type for each user efficiently
    const stats: any[] = await prisma.$queryRaw`
      SELECT 
        a."userId",
        t."type",
        COUNT(a.id)::int as count
      FROM "ToeicAnswer" a
      JOIN "ToeicQuestion" q ON a."questionId" = q.id
      JOIN "ToeicGrammarLesson" l ON q."lessonId" = l.id
      JOIN "ToeicGrammarTopic" t ON l."topicId" = t.id
      WHERE a."userId" IN (${Prisma.join(userIds)})
      GROUP BY a."userId", t."type"
    `;

    const data = topUsers.map(user => {
      const userStats = stats.filter((s: any) => s.userId === user.id);
      
      const getCount = (type: string) => {
        const row = userStats.find((s: any) => s.type === type);
        return row ? Number(row.count) : 0;
      };

      return {
        id: user.id,
        name: user.name || 'Học viên ẩn danh',
        image: user.image,
        toeicStars: user.toeicStars,
        totalStudySeconds: user.totalStudySeconds,
        learnedVocab: user._count.vocabularyTags,
        grammarAnswers: getCount('GRAMMAR'),
        listeningAnswers: getCount('LISTENING'),
        readingAnswers: getCount('READING'),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
