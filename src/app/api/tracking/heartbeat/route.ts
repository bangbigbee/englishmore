import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { guestId, currentPath, section, userAgent, domain, isPageLoad } = body;

    if (session?.user?.email === 'bangdtbk@gmail.com') {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userId = session?.user?.id || null;
    const gId = userId ? null : (guestId || 'unknown');
    const safeDomain = domain || 'toeicmore.com';
    
    if (userId) {
      const existing = await prisma.activeSession.findFirst({ where: { userId } });
      if (existing) {
        await prisma.activeSession.update({
          where: { id: existing.id },
          data: { currentPath, section, lastPingAt: new Date(), userAgent, domain: safeDomain }
        });
      } else {
        await prisma.activeSession.create({
          data: { userId, currentPath, section, lastPingAt: new Date(), userAgent, domain: safeDomain }
        });
      }
    } else {
      const existing = await prisma.activeSession.findFirst({ where: { guestId: gId } });
      if (existing) {
        await prisma.activeSession.update({
          where: { id: existing.id },
          data: { currentPath, section, lastPingAt: new Date(), userAgent, domain: safeDomain }
        });
      } else {
        await prisma.activeSession.create({
          data: { guestId: gId, currentPath, section, lastPingAt: new Date(), userAgent, domain: safeDomain }
        });
      }
    }

    if (isPageLoad) {
      const dateStr = new Date().toISOString().split('T')[0];
      const existingView = await prisma.dailyPageview.findUnique({
        where: { domain_date: { domain: safeDomain, date: dateStr } }
      });
      if (existingView) {
        await prisma.dailyPageview.update({
          where: { id: existingView.id },
          data: { views: { increment: 1 } }
        });
      } else {
        await prisma.dailyPageview.create({
          data: { domain: safeDomain, date: dateStr, views: 1 }
        });
      }
    }

    // Always attempt to upsert unique visitor for today
    const dateStr = new Date().toISOString().split('T')[0];
    const visitorId = userId ? `usr_${userId}` : `gst_${gId}`;
    try {
      await prisma.dailyVisitor.upsert({
        where: { domain_date_visitorId: { domain: safeDomain, date: dateStr, visitorId } },
        update: {},
        create: { domain: safeDomain, date: dateStr, visitorId }
      });
    } catch (upsertError) {
      // Ignore unique constraint violations if concurrent
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Heartbeat error:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
