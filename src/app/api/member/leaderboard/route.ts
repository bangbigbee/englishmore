import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const topUsers = await prisma.user.findMany({
      where: {
        role: 'member'
      },
      orderBy: {
        activityPoints: 'desc'
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        activityPoints: true
      }
    });

    const currentUserId = session?.user?.id || null;

    const maskedUsers = topUsers.map((user, index) => {
      let maskedName = 'Un***';
      if (user.name) {
        const trimmed = user.name.trim();
        maskedName = trimmed.length <= 2 ? trimmed + '***' : trimmed.substring(0, 2) + '***';
      }

      let maskedEmail = user.email;
      const emailParts = user.email.split('@');
      if (emailParts.length === 2) {
        const first = emailParts[0];
        const domain = emailParts[1];
        if (first.length > 2) {
          maskedEmail = first[0] + '***' + first[first.length - 1] + '@' + domain;
        } else {
          maskedEmail = first + '@' + domain;
        }
      }

      return {
        id: user.id,
        rank: index + 1,
        isCurrentUser: user.id === currentUserId,
        name: maskedName,
        email: maskedEmail,
        activityPoints: user.activityPoints
      };
    });

    return NextResponse.json(maskedUsers);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
