import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const bookmarks = await prisma.toeicQuestionBookmark.findMany({
      where: { userId: session.user.id },
      select: { questionId: true }
    })

    return NextResponse.json(bookmarks.map(b => b.questionId))
  } catch (err) {
    console.error('[GET /api/toeic/grammar/bookmark]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { questionId, isBookmarked } = await req.json()
    if (!questionId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

    const question = await prisma.toeicQuestion.findUnique({
      where: { id: questionId },
      include: { lesson: { include: { topic: true } } }
    })
    if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const type = question.lesson?.topic?.type || 'GRAMMAR'

    const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
    const masterConfig = (setting?.value as any) || {}
    
    // Choose which tier to check based on question type
    const requiredTier = type === 'READING' 
        ? (masterConfig.grammar?.readingBookmarkAccessTier || 'PRO') 
        : (masterConfig.grammar?.grammarBookmarkAccessTier || 'PRO')

    const userRole = session.user.role || 'user'
    const userTier = session.user.tier || 'FREE'

    let hasAccess = false
    if (userRole === 'admin') {
      hasAccess = true
    } else if (requiredTier === 'FREE') {
      hasAccess = true
    } else if (requiredTier === 'PRO' && (userTier === 'PRO' || userTier === 'ULTRA')) {
      hasAccess = true
    } else if (requiredTier === 'ULTRA' && userTier === 'ULTRA') {
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden. Premium feature.' }, { status: 403 })
    }



    if (isBookmarked) {
      // Upsert to create bookmark if it doesn't exist
      await prisma.toeicQuestionBookmark.upsert({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId: questionId
          }
        },
        create: {
          userId: session.user.id,
          questionId: questionId
        },
        update: {}
      })
    } else {
      // Delete bookmark
      await prisma.toeicQuestionBookmark.delete({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId: questionId
          }
        }
      }).catch(() => {}) // ignore error if not exists
    }

    return NextResponse.json({ success: true, isBookmarked })
  } catch (err) {
    console.error('[POST /api/toeic/grammar/bookmark]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
