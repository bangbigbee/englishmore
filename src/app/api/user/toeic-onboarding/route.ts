import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { toeicLevel, toeicTarget, level, score } = body

    const finalLevel = toeicLevel || level;

    if (!finalLevel) {
      return NextResponse.json({ error: 'Missing level' }, { status: 400 })
    }

    const updateData: any = {
      toeicLevel: finalLevel
    };

    if (toeicTarget) {
      updateData.toeicTarget = parseInt(toeicTarget);
    }
    
    if (score) {
      updateData.toeicPlacementScore = score;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    })

    // Sync roadmap to database
    if (finalLevel) {
      const { generateRoadmapForUser } = await import('@/lib/roadmapGenerator');
      await generateRoadmapForUser(updatedUser.id, finalLevel, score || '');
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
