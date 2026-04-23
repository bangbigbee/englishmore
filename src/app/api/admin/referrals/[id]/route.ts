import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user?.id as string },
      select: { role: true }
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { action } = body // 'approve' or 'reject'

    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!targetUser || !targetUser.toeicReferrerId) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    if (action === 'approve') {
      await prisma.$transaction([
          prisma.user.update({
              where: { id: targetUser.id },
              data: {
                  toeicReferralStatus: 'ACTIVE',
                  toeicStars: { increment: 50 }
              }
          }),
          prisma.user.update({
              where: { id: targetUser.toeicReferrerId },
              data: {
                  toeicStars: { increment: 100 }
              }
          })
      ])
      return NextResponse.json({ success: true, status: 'ACTIVE' })
    } else if (action === 'reject') {
      // Just mark as REJECTED so we don't process it again
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { toeicReferralStatus: 'REJECTED' }
      })
      return NextResponse.json({ success: true, status: 'REJECTED' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
