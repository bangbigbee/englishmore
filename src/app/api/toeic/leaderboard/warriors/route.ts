import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      where: { 
        toeicStars: { gt: 0 },
        email: {
          notIn: ['bangdtbk@gmail.com', 'bigbeecoltd@gmail.com']
        }
      },
      orderBy: { toeicStars: 'desc' },
      take: 15,
      select: {
        id: true,
        name: true,
        image: true,
        toeicStars: true,
        totalStudySeconds: true,
        currentStreak: true,
        isAnonymousLeaderboard: true,
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
        COUNT(a.id)::int as count
      FROM "ToeicAnswer" a
      WHERE a."userId" IN (${Prisma.join(userIds)})
      GROUP BY a."userId"
    `;

    const testStats: any[] = await prisma.$queryRaw`
      SELECT 
        "userId",
        SUM("totalQuestions")::int as count
      FROM "ToeicTestRecord"
      WHERE "userId" IN (${Prisma.join(userIds)})
      GROUP BY "userId"
    `;

    const data = topUsers.map(user => {
      const userStats = stats.find((s: any) => s.userId === user.id);
      const userTestStats = testStats.find((s: any) => s.userId === user.id);
      
      const practiceCount = (userStats ? Number(userStats.count) : 0) + (userTestStats ? Number(userTestStats.count) : 0);

      return {
        id: user.id,
        name: user.name || 'Học viên ẩn danh',
        image: user.image,
        toeicStars: user.toeicStars,
        totalStudySeconds: user.totalStudySeconds,
        currentStreak: user.currentStreak || 0,
        isAnonymousLeaderboard: user.isAnonymousLeaderboard,
        learnedVocab: user._count.vocabularyTags,
        practiceAnswers: practiceCount,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
