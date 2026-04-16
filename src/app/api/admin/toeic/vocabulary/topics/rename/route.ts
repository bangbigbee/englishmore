import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldTopic, newTopic } = await req.json();

    if (!oldTopic || !newTopic || oldTopic === newTopic) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Check if new topic already exists
    const existing = await prisma.vocabularyItem.findFirst({
      where: {
        category: 'TOEIC',
        topic: newTopic,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Chủ đề mới đã tồn tại' }, { status: 400 });
    }

    // 1. Update Vocabulary Items
    await prisma.vocabularyItem.updateMany({
      where: {
        category: 'TOEIC',
        topic: oldTopic,
      },
      data: {
        topic: newTopic,
      },
    });

    // 2. Update Topic Config if exists
    const config = await prisma.vocabularyTopicConfig.findUnique({
      where: { topic: oldTopic }
    });

    if (config) {
      await prisma.vocabularyTopicConfig.update({
        where: { topic: oldTopic },
        data: { topic: newTopic }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rename topic error:', error);
    return NextResponse.json({ error: 'Failed to rename topic' }, { status: 500 });
  }
}
