import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { guestName, topicTitle, topicSlug, topicPackage, difficulty, score, total, timeMs } = body;

    const record = await prisma.toeicSpeedChallengeRecord.create({
      data: {
        userId: session?.user?.id || null,
        guestName: session?.user?.id ? null : (guestName || 'Người chơi Ẩn Danh'),
        topicTitle,
        topicSlug,
        topicPackage,
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
        let records = await prisma.toeicSpeedChallengeRecord.findMany({
            where: {
                topicSlug: 'GLOBAL'
            },
            include: {
                user: { select: { name: true } }
            }
        });
        
        records.sort((a, b) => {
            // 1. Độ chính xác (score / total) giảm dần
            const accA = a.total > 0 ? (a.score / a.total) : 0;
            const accB = b.total > 0 ? (b.score / b.total) : 0;
            if (accB !== accA) return accB - accA;
            
            // 2. Thời gian trung bình mỗi từ đã trả lời ĐÚNG (timeMs / score) hoặc (timeMs / total)
            // Nếu dùng số giây / mỗi từ vựng hoàn thành -> timeMs / total
            const avgMsA = a.total > 0 ? (a.timeMs / a.total) : Infinity;
            const avgMsB = b.total > 0 ? (b.timeMs / b.total) : Infinity;
            return avgMsA - avgMsB; // Nhanh hơn lên trên
        });
        
        // Lọc lấy kết quả tốt nhất của mỗi cá nhân
        const uniqueRecords = [];
        const seenKeys = new Set();
        
        for (const record of records) {
            const key = record.userId ? record.userId : record.guestName;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueRecords.push(record);
            }
        }
        
        return NextResponse.json(uniqueRecords.slice(0, 10));
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Lỗi khi tải bảng xếp hạng' }, { status: 500 });
    }
}
