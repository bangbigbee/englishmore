import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaWithVocabulary = prisma as typeof prisma & {
  vocabularyItem: {
    findMany: (...args: unknown[]) => Promise<unknown>
    findFirst: (...args: unknown[]) => Promise<unknown>
    createMany: (...args: unknown[]) => Promise<unknown>
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

const normalizeText = (value: string | null | undefined) =>
  String(value || '').trim().toLowerCase()

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const sourceCourseId = String(body?.sourceCourseId || '').trim()
  const targetCourseId = String(body?.targetCourseId || '').trim()

  if (!sourceCourseId || !targetCourseId) {
    return NextResponse.json({ error: 'sourceCourseId and targetCourseId are required' }, { status: 400 })
  }

  if (sourceCourseId === targetCourseId) {
    return NextResponse.json({ error: 'Source and target course must be different' }, { status: 400 })
  }

  const courses = await prisma.course.findMany({
    where: { id: { in: [sourceCourseId, targetCourseId] } },
    select: { id: true }
  })

  if (courses.length !== 2) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const sourceItems = await prismaWithVocabulary.vocabularyItem.findMany({
    where: { courseId: sourceCourseId },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      word: true,
      phonetic: true,
      englishDefinition: true,
      meaning: true,
      example: true,
      isActive: true
    }
  }) as Array<{
    word: string
    phonetic: string | null
    englishDefinition: string | null
    meaning: string
    example: string | null
    isActive: boolean
  }>

  if (sourceItems.length === 0) {
    return NextResponse.json({ error: 'Source course has no vocabulary to import' }, { status: 400 })
  }

  const targetItems = await prismaWithVocabulary.vocabularyItem.findMany({
    where: { courseId: targetCourseId },
    select: { word: true, meaning: true }
  }) as Array<{ word: string; meaning: string }>

  const existingPairSet = new Set(
    targetItems.map((item) => `${normalizeText(item.word)}||${normalizeText(item.meaning)}`)
  )

  const filteredSourceItems = sourceItems.filter((item) => {
    const key = `${normalizeText(item.word)}||${normalizeText(item.meaning)}`
    if (existingPairSet.has(key)) {
      return false
    }
    existingPairSet.add(key)
    return true
  })

  if (filteredSourceItems.length === 0) {
    return NextResponse.json({ createdCount: 0, skippedCount: sourceItems.length })
  }

  const lastTargetItem = await prismaWithVocabulary.vocabularyItem.findFirst({
    where: { courseId: targetCourseId },
    select: { displayOrder: true },
    orderBy: { displayOrder: 'desc' }
  }) as { displayOrder: number } | null

  const baseOrder = lastTargetItem?.displayOrder || 0

  const created = await prismaWithVocabulary.vocabularyItem.createMany({
    data: filteredSourceItems.map((item, index) => ({
      courseId: targetCourseId,
      word: item.word,
      phonetic: item.phonetic,
      englishDefinition: item.englishDefinition,
      meaning: item.meaning,
      example: item.example,
      isActive: item.isActive,
      displayOrder: baseOrder + index + 1
    }))
  }) as { count: number }

  return NextResponse.json({
    createdCount: Number(created?.count || filteredSourceItems.length),
    skippedCount: sourceItems.length - filteredSourceItems.length
  })
}
