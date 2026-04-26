import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { awardToeicStars } from '@/lib/toeicStars';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    // Check if already mastered
    const existingMastery = await prisma.toeicVocabularyTopicMastery.findUnique({
      where: {
        userId_topic: {
          userId,
          topic
        }
      }
    });

    if (existingMastery) {
      return NextResponse.json({ success: true, alreadyMastered: true, starsAwarded: 0 });
    }

    // Insert mastery record
    await prisma.toeicVocabularyTopicMastery.create({
      data: {
        userId,
        topic
      }
    });

    // Reward stars for mastery (e.g., 50 stars)
    const starsAwarded = 50;
    await awardToeicStars(userId, starsAwarded, `Mastery Topic: ${topic}`);

    return NextResponse.json({ success: true, starsAwarded });
  } catch (error) {
    console.error('Error awarding mastery:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
