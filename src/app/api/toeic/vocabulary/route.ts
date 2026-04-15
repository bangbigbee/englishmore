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

  // Determine if user has ULTRA or PRO tier
  let isUltra = false
  let isPro = false
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true }
    })
    isUltra = user?.tier === 'ULTRA'
    isPro = user?.tier === 'ULTRA' || user?.tier === 'PRO'
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
      exampleVi: true,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config = await (prisma as any).vocabularyTopicConfig.findUnique({
    where: { topic }
  })

  if (!config) {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
    const master = setting?.value as any
    config = {
      proFields: JSON.stringify(master?.vocabulary?.proFields || []),
      ultraFields: JSON.stringify(master?.vocabulary?.ultraFields || [])
    }
  }

  return NextResponse.json({
    topic,
    isUltra,
    isPro,
    topicConfig: config,
    total: all.length,
    items: all
  })
}
