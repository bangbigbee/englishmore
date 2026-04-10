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
      // Find the lesson for this question
      const question = await prisma.toeicQuestion.findUnique({
        where: { id: questionId },
        select: { lessonId: true }
      })

      if (question) {
        const lessonId = question.lessonId
        
        // Count total questions in lesson
        const totalQuestions = await prisma.toeicQuestion.count({
          where: { lessonId }
        })

        // Count user's unique answers in this lesson
        const userAnswersCount = await prisma.toeicAnswer.count({
          where: {
            userId,
            question: { lessonId }
          }
        })

        // If completed (all questions answered at least once)
        if (userAnswersCount >= totalQuestions && totalQuestions > 0) {
          const referenceKey = `TOEIC_LESSON_${lessonId}`
          
          // Try to award points (once per lesson)
          const existingLog = await prisma.activityPointLog.findUnique({
            where: { referenceKey }
          })

          if (!existingLog) {
            // Award points
            const pointsToAdd = 10
            await prisma.$transaction([
              prisma.user.update({
                where: { id: userId },
                data: { activityPoints: { increment: pointsToAdd } }
              }),
              prisma.activityPointLog.create({
                data: {
                  userId,
                  activityKey: 'TOEIC_PRACTICE',
                  points: pointsToAdd,
                  referenceKey
                }
              })
            ])
            return NextResponse.json({ success: true, awardedPoints: pointsToAdd })
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
