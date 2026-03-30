import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: true,
      course: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(enrollments)
}