import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: enrollmentId } = await context.params
  const body = await request.json()
  const { status, bankReference } = body

  if (!status || !['pending', 'active', 'completed', 'dropped', 'suspended'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true }
  })

  if (!existing) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  const referenceCode =
    existing.referenceCode ||
    `EM${existing.courseId.slice(-6).toUpperCase()}${existing.userId.slice(-6).toUpperCase()}${enrollmentId.slice(-4).toUpperCase()}`

  const enrollment = await prisma.$transaction(async (tx) => {
    const updated = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        isPaid: status === 'active' ? true : existing.isPaid,
        paidAt: status === 'active' ? new Date() : existing.paidAt,
        referenceCode
      },
      include: { user: true, course: true }
    })

    if (status === 'active') {
      await tx.payment.upsert({
        where: { referenceCode },
        update: {
          amount: 3800000,
          status: 'verified',
          paymentMethod: 'bank_transfer',
          bankReference: bankReference || null,
          transactionDate: new Date(),
          verifiedAt: new Date()
        },
        create: {
          enrollmentId: enrollmentId,
          referenceCode,
          amount: 3800000,
          status: 'verified',
          paymentMethod: 'bank_transfer',
          bankReference: bankReference || null,
          transactionDate: new Date(),
          verifiedAt: new Date()
        }
      })

      // Upgrade user to PRO for 2 years when enrollment is activated
      const twoYearsFromNow = new Date()
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
      
      await tx.user.update({
        where: { id: existing.userId },
        data: {
          role: 'member',
          tier: 'PRO',
          tierExpiresAt: twoYearsFromNow
        }
      })
    }

    return updated
  })

  return NextResponse.json(enrollment)
}
