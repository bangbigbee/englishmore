import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAnonymousLeaderboard: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { isAnonymousLeaderboard: !user.isAnonymousLeaderboard }
    });

    return NextResponse.json({ success: true, isAnonymousLeaderboard: updatedUser.isAnonymousLeaderboard });
  } catch (error) {
    console.error('Toggle privacy error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
