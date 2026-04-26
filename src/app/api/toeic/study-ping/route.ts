import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalStudySeconds: {
          increment: elapsedSeconds
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Study ping error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
