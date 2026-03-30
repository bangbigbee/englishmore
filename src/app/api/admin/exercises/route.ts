import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ExerciseQuestionInput = {
  question: string
  optionA: string
  optionB: string
  optionC: string
  correctOption: string
}

const normalizeDraftQuestions = (questions: ExerciseQuestionInput[]) => {
  const rows = Array.from({ length: 10 }, (_, index) => {
    const item = questions[index]
    return {
      question: String(item?.question || '').trim(),
      optionA: String(item?.optionA || '').trim(),
      optionB: String(item?.optionB || '').trim(),
      optionC: String(item?.optionC || '').trim(),
      correctOption: ['A', 'B', 'C'].includes(String(item?.correctOption || '').toUpperCase()) ? String(item.correctOption).toUpperCase() : 'A'
    }
  })

  return rows
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

function validateQuestions(questions: ExerciseQuestionInput[]) {
  if (!Array.isArray(questions) || questions.length !== 10) {
    return 'Mỗi exercise phải có đúng 10 câu hỏi'
  }

  const invalid = questions.find((item) => {
    return !item.question?.trim() || !item.optionA?.trim() || !item.optionB?.trim() || !item.optionC?.trim() || !['A', 'B', 'C'].includes(item.correctOption)
  })

  if (invalid) {
    return 'Vui lòng nhập đầy đủ nội dung cho cả 10 câu hỏi và chọn đáp án đúng'
  }

  return null
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const [courses, exercises] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.courseExercise.findMany({
      select: {
        id: true,
        courseId: true,
        order: true,
        description: true,
        isDraft: true,
        sourceFormUrl: true,
        course: { select: { title: true } },
        questions: {
          select: {
            id: true,
            order: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            correctOption: true
          },
          orderBy: { order: 'asc' }
        },
        submissions: {
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            durationSeconds: true,
            submittedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            answers: {
              select: {
                id: true,
                selectedOption: true,
                isCorrect: true,
                question: {
                  select: {
                    id: true,
                    order: true,
                    question: true,
                    correctOption: true
                  }
                }
              },
              orderBy: {
                question: {
                  order: 'asc'
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      },
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }]
    })
  ])

  return NextResponse.json({ courses, exercises })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const { courseId, description, questions, isDraft, sourceFormUrl } = body as {
    courseId?: string
    description?: string
    questions?: ExerciseQuestionInput[]
    isDraft?: boolean
    sourceFormUrl?: string
  }

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const creatingDraft = Boolean(isDraft)
  const normalizedQuestions = normalizeDraftQuestions(questions || [])

  if (!creatingDraft) {
    const questionError = validateQuestions(normalizedQuestions)
    if (questionError) {
      return NextResponse.json({ error: questionError }, { status: 400 })
    }
  }

  const latestExercise = await prisma.courseExercise.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  const exercise = await prisma.courseExercise.create({
    data: {
      courseId,
      order: (latestExercise?.order || 0) + 1,
      description: String(description || '').trim() || null,
      isDraft: creatingDraft,
      sourceFormUrl: String(sourceFormUrl || '').trim() || null,
      questions: {
        create: normalizedQuestions.map((item, index) => ({
          order: index + 1,
          question: item.question,
          optionA: item.optionA,
          optionB: item.optionB,
          optionC: item.optionC,
          correctOption: item.correctOption
        }))
      }
    },
    include: {
      course: { select: { title: true } },
      questions: { orderBy: { order: 'asc' } }
    }
  })

  return NextResponse.json(exercise, { status: 201 })
}