import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: targetUserId } = await context.params
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (targetUser.role === 'admin') {
    return NextResponse.json({ error: 'Cannot reject admin account' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    // Reset learning history so user must start over.
    await tx.homeworkSubmission.deleteMany({ where: { userId: targetUserId } })
    await tx.assignment.deleteMany({ where: { userId: targetUserId } })
    await tx.enrollment.deleteMany({ where: { userId: targetUserId } })

    await tx.user.update({
      where: { id: targetUserId },
      data: {
        role: 'user',
        method: null
      }
    })
  })

  return NextResponse.json({ message: 'User has been rejected and reset to initial state' })
}
