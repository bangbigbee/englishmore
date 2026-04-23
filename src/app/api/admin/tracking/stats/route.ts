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
        lastPingAt: { gte: threeMinsAgo },
        domain: { contains: 'toeicmore' }
      },
      include: {
        user: {
          select: { name: true, email: true, tier: true, image: true }
        }
      }
    });

    let vocab = 0, listening = 0, reading = 0, grammar = 0, actualTest = 0, speedChallenge = 0;
    
    // Group all non-core ones into a map or add variables for Sổ Tay
    const sectionCounts: Record<string, number> = {};

    const usersOnline: any[] = [];
    const guestsOnline: any[] = [];

    activeSessions.forEach(s => {
      // Dynamic count for all sections
      if (!sectionCounts[s.section]) {
        sectionCounts[s.section] = 0;
      }
      sectionCounts[s.section]++;

      if (s.userId) {
        usersOnline.push(s);
      } else {
        guestsOnline.push(s);
      }
    });

    const dateStr = new Date().toISOString().split('T')[0];
    let currentDaily = 0;
    const pageViewData = await prisma.dailyPageview.findFirst({
      where: { date: dateStr, domain: { contains: 'toeicmore' } }
    });
    if (pageViewData) {
      currentDaily = pageViewData.views;
    }

    return NextResponse.json({
      online: activeSessions.length,
      sectionCounts, // New object to pass back all section counts dynamically
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
