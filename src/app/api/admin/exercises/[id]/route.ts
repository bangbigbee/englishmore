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

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await request.json()
  const { description, questions, isDraft, sourceFormUrl } = body as {
    description?: string
    questions?: ExerciseQuestionInput[]
    isDraft?: boolean
    sourceFormUrl?: string
  }

  const targetExercise = await prisma.courseExercise.findUnique({
    where: { id },
    select: { isDraft: true }
  })

  if (!targetExercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  const savingDraft = typeof isDraft === 'boolean' ? isDraft : targetExercise.isDraft
  const normalizedQuestions = normalizeDraftQuestions(questions || [])
  if (!savingDraft) {
    const questionError = validateQuestions(normalizedQuestions)
    if (questionError) {
      return NextResponse.json({ error: questionError }, { status: 400 })
    }
  }

  try {
    const exercise = await prisma.$transaction(async (tx) => {
      await tx.exerciseSubmission.deleteMany({ where: { exerciseId: id } })
      await tx.exerciseQuestion.deleteMany({ where: { exerciseId: id } })

      return tx.courseExercise.update({
        where: { id },
        data: {
          description: String(description || '').trim() || null,
          isDraft: savingDraft,
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
    })

    return NextResponse.json(exercise)
  } catch {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }
}