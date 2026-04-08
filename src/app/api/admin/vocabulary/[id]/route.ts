import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaWithVocabulary = prisma as typeof prisma & {
  vocabularyItem: {
    update: (...args: unknown[]) => Promise<unknown>
    delete: (...args: unknown[]) => Promise<unknown>
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

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params

  try {
    await prismaWithVocabulary.vocabularyItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Vocabulary item not found' }, { status: 404 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await request.json()

  const courseId = String(body?.courseId || '').trim()
  const word = String(body?.word || '').trim()
  const phonetic = String(body?.phonetic || '').trim()
  const englishDefinition = String(body?.englishDefinition || '').trim()
  const meaning = String(body?.meaning || '').trim()
  const example = String(body?.example || '').trim()
  const displayOrderRaw = body?.displayOrder

  if (!courseId || !word || !meaning) {
    return NextResponse.json({ error: 'courseId, word, meaning are required' }, { status: 400 })
  }

  if (displayOrderRaw !== undefined && displayOrderRaw !== null && displayOrderRaw !== '') {
    const displayOrder = Number(displayOrderRaw)
    if (!Number.isInteger(displayOrder) || displayOrder < 1 || displayOrder > 9999) {
      return NextResponse.json({ error: 'displayOrder must be an integer between 1 and 9999' }, { status: 400 })
    }
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  try {
    const displayOrder = Number(displayOrderRaw)
    const item = await prismaWithVocabulary.vocabularyItem.update({
      where: { id },
      data: {
        courseId,
        word,
        phonetic: phonetic || null,
        englishDefinition: englishDefinition || null,
        meaning,
        example: example || null,
        ...(displayOrderRaw !== undefined && displayOrderRaw !== null && displayOrderRaw !== ''
          ? { displayOrder }
          : {})
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

    return NextResponse.json({ item })
  } catch {
    return NextResponse.json({ error: 'Vocabulary item not found' }, { status: 404 })
  }
}
