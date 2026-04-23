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
    const { questionId, selectedOption, isCorrect, currentStreak } = body

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

    // 2. Check for Lesson Completion & Toeic Stars
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, tier: true }
    })

    if (user) {
      const question = await prisma.toeicQuestion.findUnique({
        where: { id: questionId },
        select: { lessonId: true }
      })

      if (question) {
        let totalAwardedStars = 0;
        const { awardToeicStars, TOEIC_STAR_KEYS } = await import('@/lib/toeicStars')

        let awardReason = "";
        const dateStr = new Date().toISOString().split('T')[0]
        
        // Check for first correct question
        if (isCorrect && currentStreak === 1) {
          const firstQuestionResult = await awardToeicStars({
            userId,
            activityKey: TOEIC_STAR_KEYS.firstQuestion,
            referenceKey: `TOEIC_FIRST_Q_${userId}_${questionId}_${dateStr}`
          })
          if (firstQuestionResult.awardedStars > 0) {
            totalAwardedStars += firstQuestionResult.awardedStars;
            awardReason = `Great! Bạn được tặng ${firstQuestionResult.awardedStars} ⭐ cho câu đúng đầu tiên.`;
          }
        }
        
        // Award for specific streaks
        let streakKeyToAdd: (typeof TOEIC_STAR_KEYS)[keyof typeof TOEIC_STAR_KEYS] | null = null;
        if (isCorrect) {
          if (currentStreak === 3) streakKeyToAdd = TOEIC_STAR_KEYS.correctStreak3;
          else if (currentStreak === 5) streakKeyToAdd = TOEIC_STAR_KEYS.correctStreak5;
          else if (currentStreak === 10) streakKeyToAdd = TOEIC_STAR_KEYS.correctStreak10;
        }

        if (streakKeyToAdd) {
           const streakResult = await awardToeicStars({
             userId,
             activityKey: streakKeyToAdd,
             referenceKey: `TOEIC_STREAK_${streakKeyToAdd}_${userId}_${questionId}_${dateStr}`
           })
           if (streakResult.awardedStars > 0) {
             totalAwardedStars += streakResult.awardedStars;
             const prefix = awardReason ? awardReason + " " : "";
             awardReason = prefix + `Xuất sắc! Nhận ${streakResult.awardedStars} ⭐ vì đúng ${currentStreak} câu liên tiếp.`;
           }
        }

        const lessonId = question.lessonId
        const totalQuestions = await prisma.toeicQuestion.count({ where: { lessonId } })
        const userAnswersCount = await prisma.toeicAnswer.count({
          where: { userId, question: { lessonId } }
        })

        if (userAnswersCount >= totalQuestions && totalQuestions > 0) {
          // Check if all correct
          const correctAnswersCount = await prisma.toeicAnswer.count({
            where: { userId, question: { lessonId }, isCorrect: true }
          })
          
          if (correctAnswersCount === totalQuestions) {
            const perfectResult = await awardToeicStars({
              userId,
              activityKey: TOEIC_STAR_KEYS.allCorrect,
              referenceKey: `TOEIC_ALL_CORRECT_${lessonId}_${userId}_${dateStr}`
            })
            if (perfectResult.awardedStars > 0) {
              totalAwardedStars += perfectResult.awardedStars;
              const prefix = awardReason ? awardReason + " " : "";
              awardReason = prefix + `Perfect! Thưởng ${perfectResult.awardedStars} ⭐ vì đúng toàn bộ.`;
            }
          }
          
          const result = await awardToeicStars({
            userId,
            activityKey: TOEIC_STAR_KEYS.completePart, // Or a generic complete key
            referenceKey: `TOEIC_QUIZ_COMPLETE_${lessonId}_${userId}_${dateStr}`
          })
          if (result.awardedStars > 0) {
            totalAwardedStars += result.awardedStars;
            const prefix = awardReason ? awardReason + " " : "";
            awardReason = prefix + `Chúc mừng hoàn thành bài tập! Nhận ${result.awardedStars} ⭐.`;
          }
        }
        
        if (totalAwardedStars > 0) {
           return NextResponse.json({ success: true, awardedPoints: totalAwardedStars, awardReason })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving TOEIC progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    // Delete all answers for this user in this lesson
    await prisma.toeicAnswer.deleteMany({
      where: {
        userId: session.user.id,
        question: {
          lessonId: lessonId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting TOEIC progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
