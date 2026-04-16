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
    const readingTopics = await prisma.toeicGrammarTopic.findMany({
      where: { type: 'READING' },
      select: { id: true }
    })
    const grammarTopics = await prisma.toeicGrammarTopic.findMany({
      where: { type: 'GRAMMAR' },
      select: { id: true }
    })

    const readingTopicIds = readingTopics.map(t => t.id)
    const grammarTopicIds = grammarTopics.map(t => t.id)

    if (grammarTopicIds.length > 0) {
      await prisma.toeicGrammarLesson.updateMany({
        where: { topicId: { in: grammarTopicIds } },
        data: {
          theoryAccessTier: config.grammar.theoryAccessTier,
          explanationAccessTier: config.grammar.explanationAccessTier,
          translationAccessTier: config.grammar.translationAccessTier,
          bookmarkAccessTier: config.grammar.grammarBookmarkAccessTier || 'PRO',
        }
      })
    }
    
    if (readingTopicIds.length > 0) {
      await prisma.toeicGrammarLesson.updateMany({
        where: { topicId: { in: readingTopicIds } },
        data: {
          theoryAccessTier: config.grammar.theoryAccessTier,
          explanationAccessTier: config.grammar.explanationAccessTier,
          translationAccessTier: config.grammar.translationAccessTier,
          bookmarkAccessTier: config.grammar.readingBookmarkAccessTier || 'PRO',
        }
      })
    }
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
