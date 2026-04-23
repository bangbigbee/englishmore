import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { guestId, currentPath, section, userAgent } = body;

    const userId = session?.user?.id || null;
    const gId = userId ? null : (guestId || 'unknown');
    
    if (userId) {
      const existing = await prisma.activeSession.findFirst({ where: { userId } });
      if (existing) {
        await prisma.activeSession.update({
          where: { id: existing.id },
          data: { currentPath, section, lastPingAt: new Date(), userAgent }
        });
      } else {
        await prisma.activeSession.create({
          data: { userId, currentPath, section, lastPingAt: new Date(), userAgent }
        });
      }
    } else {
      const existing = await prisma.activeSession.findFirst({ where: { guestId: gId } });
      if (existing) {
        await prisma.activeSession.update({
          where: { id: existing.id },
          data: { currentPath, section, lastPingAt: new Date(), userAgent }
        });
      } else {
        await prisma.activeSession.create({
          data: { guestId: gId, currentPath, section, lastPingAt: new Date(), userAgent }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Heartbeat error:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
