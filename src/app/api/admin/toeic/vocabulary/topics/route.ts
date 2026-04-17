import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaVocab = prisma as typeof prisma & {
  vocabularyItem: {
    groupBy: (...args: unknown[]) => Promise<unknown>
    deleteMany: (...args: unknown[]) => Promise<{ count: number }>
    findMany: (...args: unknown[]) => Promise<unknown>
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

// GET /api/admin/toeic/vocabulary/topics
// Returns all TOEIC vocab topics with word counts + sample words
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const groups = await prismaVocab.vocabularyItem.groupBy({
      by: ['topic'],
      where: { category: 'TOEIC', isActive: true },
      _count: { id: true },
      orderBy: { topic: 'asc' }
    }) as { topic: string; _count: { id: number } }[]

    const topicsNames = groups.map(g => g.topic)
    const configs = await prisma.vocabularyTopicConfig.findMany({
      where: { topic: { in: topicsNames } }
    })
    const configMap = new Map(configs.map(c => [c.topic, c]))

    const topics = groups.map((g) => ({
      topic: g.topic,
      wordCount: g._count.id,
      packageType: configMap.get(g.topic)?.packageType || 'ADVANCED'
    }))

    return NextResponse.json({ topics })
  } catch (err) {
    console.error('[GET /api/admin/toeic/vocabulary/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/toeic/vocabulary/topics?topic=xxx
// Deletes ALL vocabulary items under that topic (category=TOEIC)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')

  if (!topic || !topic.trim()) {
    return NextResponse.json({ error: 'Missing topic parameter' }, { status: 400 })
  }

  try {
    const result = await prismaVocab.vocabularyItem.deleteMany({
      where: { category: 'TOEIC', topic: topic.trim() }
    })

    return NextResponse.json({ deletedCount: result.count })
  } catch (err) {
    console.error('[DELETE /api/admin/toeic/vocabulary/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
