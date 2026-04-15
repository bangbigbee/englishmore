import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Returns vocabulary items for a given TOEIC topic
// - FREE words (first 5 per topic) visible to all logged-in users
// - All words visible only if user is ULTRA tier
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')

  if (!topic) {
    return NextResponse.json({ error: 'Missing topic parameter' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)

  // Determine if user has ULTRA tier
  let isUltra = false
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true }
    })
    isUltra = user?.tier === 'ULTRA'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = await (prisma as any).vocabularyItem.findMany({
    where: { category: 'TOEIC', topic, isActive: true },
    select: {
      id: true,
      word: true,
      phonetic: true,
      englishDefinition: true,
      meaning: true,
      example: true,
      topic: true,
      synonyms: true,
      antonyms: true,
      collocations: true,
      toeicTrap: true,
      mnemonicUrl: true,
      displayOrder: true
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }]
  })

  return NextResponse.json({
    topic,
    isUltra,
    total: all.length,
    items: isUltra ? all : all.slice(0, 5)
  })
}
