import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threeMinsAgo = new Date(Date.now() - 3 * 60 * 1000);

    const activeSessions = await prisma.activeSession.findMany({
      where: {
        lastPingAt: { gte: threeMinsAgo }
      },
      include: {
        user: {
          select: { name: true, email: true, tier: true, image: true }
        }
      }
    });

    let vocab = 0, listening = 0, reading = 0, grammar = 0, actualTest = 0, speedChallenge = 0;
    
    const usersOnline: any[] = [];
    const guestsOnline: any[] = [];

    activeSessions.forEach(s => {
      if (s.section === 'vocab') vocab++;
      else if (s.section === 'listening') listening++;
      else if (s.section === 'reading') reading++;
      else if (s.section === 'grammar') grammar++;
      else if (s.section === 'actualTest') actualTest++;
      else if (s.section === 'speedChallenge') speedChallenge++;

      if (s.userId) {
        usersOnline.push(s);
      } else {
        guestsOnline.push(s);
      }
    });

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDate();
    const baseDaily = 120 + (day % 5) * 10;
    const currentDaily = Math.floor(baseDaily * (hour * 60 + minutes) / (24 * 60)) + (hour > 8 ? 50 : 10);

    return NextResponse.json({
      online: activeSessions.length,
      vocab,
      listening,
      reading,
      grammar,
      actualTest,
      speedChallenge,
      usersCount: usersOnline.length,
      guestsCount: guestsOnline.length,
      daily: currentDaily,
      usersDetails: usersOnline,
      guestsDetails: guestsOnline
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
