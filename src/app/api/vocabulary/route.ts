import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const prismaWithVocabulary = prisma as typeof prisma & {
  vocabularyItem: {
    findMany: (...args: unknown[]) => Promise<unknown>
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const requestedCourseId = url.searchParams.get('courseId')

  const selectedCourse = requestedCourseId
    ? await prisma.course.findFirst({
        where: {
          id: requestedCourseId,
          isPublished: true
        },
        select: {
          id: true,
          title: true
        }
      })
    : await prisma.course.findFirst({
        where: {
          isPublished: true
        },
        select: {
          id: true,
          title: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

  if (!selectedCourse) {
    return NextResponse.json({ courseTitle: '', items: [] })
  }

  const items = await prismaWithVocabulary.vocabularyItem.findMany({
    where: {
      courseId: selectedCourse.id,
      isActive: true
    },
    select: {
      id: true,
      word: true,
      phonetic: true,
      englishDefinition: true,
      meaning: true,
      example: true,
      topic: true,
      displayOrder: true
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'asc' }
    ]
  })

  return NextResponse.json({
    courseTitle: selectedCourse.title,
    items
  })
}
