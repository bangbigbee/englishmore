import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { guestName, topicTitle, topicSlug, difficulty, score, total, timeMs } = body;

    const record = await prisma.toeicSpeedChallengeRecord.create({
      data: {
        userId: session?.user?.id || null,
        guestName: session?.user?.id ? null : (guestName || 'Người chơi Ẩn Danh'),
        topicTitle,
        topicSlug,
        difficulty,
        score,
        total,
        timeMs,
      },
      include: {
        user: { select: { name: true } }
      }
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error saving speed challenge score:', error);
    return NextResponse.json({ error: 'Lỗi khi lưu điểm số' }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const records = await prisma.toeicSpeedChallengeRecord.findMany({
            take: 10,
            orderBy: [
                { score: 'desc' },
                { timeMs: 'asc' }
            ],
            include: {
                user: { select: { name: true } }
            }
        });
        
        return NextResponse.json(records);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Lỗi khi tải bảng xếp hạng' }, { status: 500 });
    }
}
