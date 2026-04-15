import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns distinct topics from VocabularyItem where category = 'TOEIC', with word counts
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups = await (prisma as any).vocabularyItem.groupBy({
      by: ['topic'],
      where: { category: 'TOEIC', isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    })

    const topics = (groups as { topic: string; _count: { id: number } }[]).map((g) => ({
      topic: g.topic,
      wordCount: g._count.id
    }))

    return NextResponse.json({ topics })
  } catch (err) {
    console.error('[GET /api/toeic/vocabulary/topics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
