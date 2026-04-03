import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type SubmittedAnswer = {
  questionId: string
  selectedOption: string
}

function normalizeAnswers(input: SubmittedAnswer[]) {
  if (!Array.isArray(input) || input.length === 0) {
    return null
  }

  const normalized = input.map((item) => ({
    questionId: String(item.questionId || '').trim(),
    selectedOption: String(item.selectedOption || '').trim().toUpperCase()
  }))

  const invalid = normalized.find((item) => !item.questionId || !['A', 'B', 'C'].includes(item.selectedOption))
  return invalid ? null : normalized
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!currentUser || currentUser.role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params
  const body = await request.json()
  const answers = normalizeAnswers(body?.answers || [])
  const durationSecondsRaw = Number(body?.durationSeconds)
  const durationSeconds = Number.isFinite(durationSecondsRaw) && durationSecondsRaw > 0
    ? Math.floor(durationSecondsRaw)
    : null

  if (!answers) {
    return NextResponse.json({ error: 'Invalid answer list' }, { status: 400 })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id, status: 'active' },
    orderBy: { createdAt: 'desc' }
  })

  if (!activeEnrollment) {
    return NextResponse.json({ error: 'You do not have an active course yet' }, { status: 400 })
  }

  const exercise = await prisma.courseExercise.findFirst({
    where: {
      id,
      courseId: activeEnrollment.courseId
    },
    select: {
      id: true,
      order: true,
      questions: {
        select: {
          id: true,
          order: true,
          correctOption: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!exercise) {
    return NextResponse.json({ error: 'This exercise does not belong to your course' }, { status: 404 })
  }

  const latestSpeakAttempt = await prisma.speakYourselfAttempt.findFirst({
    where: {
      userId: session.user.id,
      courseId: activeEnrollment.courseId
    },
    orderBy: { createdAt: 'desc' },
    select: { passed: true }
  })

  if (!latestSpeakAttempt?.passed) {
    return NextResponse.json({ error: 'Please pass Speak Yourself (>= 80%) before submitting exercises.' }, { status: 403 })
  }

  if (answers.length !== exercise.questions.length) {
    return NextResponse.json({ error: `Please select all ${exercise.questions.length} answers before submitting` }, { status: 400 })
  }

  const answerMap = new Map(answers.map((item) => [item.questionId, item.selectedOption]))
  const missingAnswer = exercise.questions.find((question) => !answerMap.has(question.id))
  if (missingAnswer) {
    return NextResponse.json({ error: 'At least one question is still unanswered' }, { status: 400 })
  }

  const questionIds = new Set(exercise.questions.map((question) => question.id))
  const invalidAnswer = answers.find((item) => !questionIds.has(item.questionId))
  if (invalidAnswer) {
    return NextResponse.json({ error: 'One or more answers do not belong to this exercise' }, { status: 400 })
  }

  const evaluatedAnswers = exercise.questions.map((question) => {
    const selectedOption = answerMap.get(question.id) || ''
    return {
      questionId: question.id,
      selectedOption,
      isCorrect: selectedOption === question.correctOption,
      order: question.order
    }
  })

  const score = evaluatedAnswers.filter((item) => item.isCorrect).length

  const submission = await prisma.$transaction(async (tx) => {
    const existing = await tx.exerciseSubmission.findUnique({
      where: {
        exerciseId_userId: {
          exerciseId: exercise.id,
          userId: session.user.id
        }
      }
    })

    if (existing) {
      await tx.exerciseSubmissionAnswer.deleteMany({ where: { submissionId: existing.id } })

      return tx.exerciseSubmission.update({
        where: { id: existing.id },
        data: {
          score,
          totalQuestions: exercise.questions.length,
          durationSeconds,
          submittedAt: new Date(),
          answers: {
            create: evaluatedAnswers.map((item) => ({
              questionId: item.questionId,
              selectedOption: item.selectedOption,
              isCorrect: item.isCorrect
            }))
          }
        },
        select: {
          id: true,
          score: true,
          totalQuestions: true,
          durationSeconds: true,
          submittedAt: true,
          answers: {
            select: {
              questionId: true,
              selectedOption: true,
              isCorrect: true
            }
          }
        }
      })
    }

    return tx.exerciseSubmission.create({
      data: {
        exerciseId: exercise.id,
        userId: session.user.id,
        score,
        totalQuestions: exercise.questions.length,
        durationSeconds,
        answers: {
          create: evaluatedAnswers.map((item) => ({
            questionId: item.questionId,
            selectedOption: item.selectedOption,
            isCorrect: item.isCorrect
          }))
        }
      },
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        durationSeconds: true,
        submittedAt: true,
        answers: {
          select: {
            questionId: true,
            selectedOption: true,
            isCorrect: true
          }
        }
      }
    })
  })

  return NextResponse.json({
    message: 'Exercise submitted successfully',
    submission
  })
}