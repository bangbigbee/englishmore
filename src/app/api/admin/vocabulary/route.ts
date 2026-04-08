import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaWithVocabulary = prisma as typeof prisma & {
  vocabularyItem: {
    findMany: (...args: unknown[]) => Promise<unknown>
    findFirst: (...args: unknown[]) => Promise<unknown>
    create: (...args: unknown[]) => Promise<unknown>
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const courseId = request.nextUrl.searchParams.get('courseId') || ''

  const items = await prismaWithVocabulary.vocabularyItem.findMany({
    where: {
      ...(courseId ? { courseId } : {})
    },
    include: {
      course: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: [
      { courseId: 'asc' },
      { displayOrder: 'asc' },
      { createdAt: 'asc' }
    ]
  })

  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const courseId = String(body?.courseId || '').trim()
  const word = String(body?.word || '').trim()
  const phonetic = String(body?.phonetic || '').trim()
  const englishDefinition = String(body?.englishDefinition || '').trim()
  const meaning = String(body?.meaning || '').trim()
  const example = String(body?.example || '').trim()

  if (!courseId || !word || !meaning) {
    return NextResponse.json({ error: 'courseId, word, meaning are required' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const lastItem = await prismaWithVocabulary.vocabularyItem.findFirst({
    where: { courseId },
    select: { displayOrder: true },
    orderBy: { displayOrder: 'desc' }
  }) as { displayOrder: number } | null

  const displayOrder = (lastItem?.displayOrder || 0) + 1

  const item = await prismaWithVocabulary.vocabularyItem.create({
    data: {
      courseId,
      word,
      phonetic: phonetic || null,
      englishDefinition: englishDefinition || null,
      meaning,
      example: example || null,
      displayOrder,
      isActive: true
    },
    include: {
      course: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })

  return NextResponse.json({ item }, { status: 201 })
}
