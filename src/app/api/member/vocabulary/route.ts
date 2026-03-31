import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaWithVocabulary = prisma as typeof prisma & {
  vocabularyItem: {
    findMany: (...args: unknown[]) => Promise<unknown>
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!currentUser || currentUser.role !== 'member') {
    return NextResponse.json({ items: [], courseTitle: '' })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: currentUser.id,
      status: 'active'
    },
    include: {
      course: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!activeEnrollment) {
    return NextResponse.json({ items: [], courseTitle: '' })
  }

  const items = await prismaWithVocabulary.vocabularyItem.findMany({
    where: {
      courseId: activeEnrollment.courseId,
      isActive: true
    },
    select: {
      id: true,
      word: true,
      phonetic: true,
      meaning: true,
      example: true,
      displayOrder: true
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'asc' }
    ]
  })

  return NextResponse.json({
    courseTitle: activeEnrollment.course.title,
    items
  })
}
