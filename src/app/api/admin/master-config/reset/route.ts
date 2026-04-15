import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { DEFAULT_MASTER_CONFIG } from '../route'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
  const config = (setting?.value as any) || DEFAULT_MASTER_CONFIG

  if (config.grammar) {
    await prisma.toeicGrammarLesson.updateMany({
      data: {
        theoryAccessTier: config.grammar.theoryAccessTier,
        explanationAccessTier: config.grammar.explanationAccessTier,
        translationAccessTier: config.grammar.translationAccessTier,
      }
    })
  }

  if (config.vocabulary) {
    await prisma.vocabularyTopicConfig.updateMany({
      data: {
        proFields: JSON.stringify(config.vocabulary.proFields),
        ultraFields: JSON.stringify(config.vocabulary.ultraFields)
      }
    })
  }

  return NextResponse.json({ success: true })
}
