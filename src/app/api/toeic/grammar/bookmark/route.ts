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
