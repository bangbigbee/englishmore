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
  const { questions } = body as { questions?: ExerciseQuestionInput[] }

  const questionError = validateQuestions(questions || [])
  if (questionError) {
    return NextResponse.json({ error: questionError }, { status: 400 })
  }

  try {
    const exercise = await prisma.$transaction(async (tx) => {
      await tx.exerciseQuestion.deleteMany({ where: { exerciseId: id } })

      return tx.courseExercise.update({
        where: { id },
        data: {
          questions: {
            create: questions!.map((item, index) => ({
              order: index + 1,
              question: item.question.trim(),
              optionA: item.optionA.trim(),
              optionB: item.optionB.trim(),
              optionC: item.optionC.trim(),
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