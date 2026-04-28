import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { awardToeicStars, TOEIC_STAR_KEYS } from '@/lib/toeicStars';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: 'Not authenticated' });
    }

    const body = await req.json();
    const { elapsedSeconds } = body;

    // Prevent abuse: max 120 seconds per ping
    if (typeof elapsedSeconds !== 'number' || elapsedSeconds <= 0 || elapsedSeconds > 120) {
      return NextResponse.json({ success: false, message: 'Invalid payload' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastStudyDate: true, dailyStudySeconds: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const today = new Date();
    // Format date in GMT+7
    const todayStr = new Date(today.getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let isNewDay = false;
    let currentDailySeconds = user.dailyStudySeconds || 0;

    if (!user.lastStudyDate) {
      isNewDay = true;
    } else {
      const lastStudyStr = new Date(user.lastStudyDate.getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (lastStudyStr !== todayStr) {
        isNewDay = true;
      }
    }

    if (isNewDay) {
      currentDailySeconds = 0;
    }

    const newDailySeconds = currentDailySeconds + elapsedSeconds;

    // Check thresholds
    let activityKey: any = null;
    
    if (currentDailySeconds < 3600 && newDailySeconds >= 3600) {
      activityKey = TOEIC_STAR_KEYS.study1h;
    } else if (currentDailySeconds < 7200 && newDailySeconds >= 7200) {
      activityKey = TOEIC_STAR_KEYS.study2h;
    }

    const updateData: any = {
      totalStudySeconds: { increment: elapsedSeconds },
      dailyStudySeconds: isNewDay ? elapsedSeconds : { increment: elapsedSeconds },
      lastStudyDate: today
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    let starsRewarded = 0;
    let rewardReason = '';

    if (activityKey) {
      const referenceKey = `${activityKey}:${session.user.id}:${todayStr}`;
      const rewardResult = await awardToeicStars({
        userId: session.user.id,
        activityKey,
        referenceKey
      });
      starsRewarded = rewardResult.awardedStars;
      rewardReason = rewardResult.reason || '';
    }

    return NextResponse.json({ 
      success: true, 
      newDailySeconds, 
      starsRewarded,
      rewardReason
    });
  } catch (error) {
    console.error('Study ping error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
