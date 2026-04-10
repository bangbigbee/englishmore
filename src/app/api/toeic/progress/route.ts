import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const lessonId = searchParams.get('lessonId')

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
  }

  try {
    const answers = await prisma.toeicAnswer.findMany({
      where: {
        userId: session.user.id,
        question: {
          lessonId: lessonId
        }
      },
      select: {
        questionId: true,
        selectedOption: true,
        isCorrect: true
      }
    })

    // Convert to a map for easy frontend usage: { [questionId]: { selected, isCorrect } }
    const progressMap = answers.reduce((acc, curr) => {
      acc[curr.questionId] = {
        selected: curr.selectedOption,
        isCorrect: curr.isCorrect
      }
      return acc
    }, {} as Record<string, { selected: string; isCorrect: boolean }>)

    return NextResponse.json(progressMap)
  } catch (error) {
    console.error('Error fetching TOEIC progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const body = await request.json()
    const { questionId, selectedOption, isCorrect } = body

    if (!questionId || !selectedOption) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // 1. Upsert the answer
    await prisma.toeicAnswer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      create: {
        userId,
        questionId,
        selectedOption,
        isCorrect
      },
      update: {
        selectedOption,
        isCorrect,
        updatedAt: new Date()
      }
    })

    // 2. Check for Lesson Completion & Activity Points (Members only)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (user?.role === 'member') {
      const question = await prisma.toeicQuestion.findUnique({
        where: { id: questionId },
        select: { lessonId: true }
      })

      if (question) {
        const lessonId = question.lessonId
        const totalQuestions = await prisma.toeicQuestion.count({ where: { lessonId } })
        const userAnswersCount = await prisma.toeicAnswer.count({
          where: { userId, question: { lessonId } }
        })

        if (userAnswersCount >= totalQuestions && totalQuestions > 0) {
          const { awardActivityPoints, ACTIVITY_POINT_KEYS } = await import('@/lib/activityPoints')
          const result = await awardActivityPoints({
            userId,
            activityKey: ACTIVITY_POINT_KEYS.toeicPractice,
            referenceKey: `TOEIC_LESSON_${lessonId}`
          })
          
          if (result.awardedAp > 0) {
            return NextResponse.json({ success: true, awardedPoints: result.awardedAp })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving TOEIC progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
