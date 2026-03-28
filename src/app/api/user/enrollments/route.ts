import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user?.id as string },
    include: { course: true },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(enrollments)
}
