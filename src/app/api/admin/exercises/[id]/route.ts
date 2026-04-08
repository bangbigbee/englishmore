import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ExerciseQuestionInput = {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD?: string
  correctOption: string
}

const VALID_EXERCISE_TYPES = ['multiple_choice', 'question_response', 'conversation'] as const

function normalizeExerciseType(value: unknown) {
  const normalized = String(value || '').trim().toLowerCase()
  // Legacy alias: listening_audio → question_response
  if (normalized === 'listening_audio') return 'question_response'
  return VALID_EXERCISE_TYPES.includes(normalized as (typeof VALID_EXERCISE_TYPES)[number])
    ? normalized
    : 'multiple_choice'
}

const normalizeDraftQuestions = (questions: ExerciseQuestionInput[]) => {
  const rows = Array.from({ length: 10 }, (_, index) => {
    const item = questions[index]
    const optionD = String(item?.optionD || '').trim()
    const normalizedCorrectOption = String(item?.correctOption || '').toUpperCase()
    const availableCorrectOptions = optionD ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C']

    return {
      question: String(item?.question || '').trim(),
      optionA: String(item?.optionA || '').trim(),
      optionB: String(item?.optionB || '').trim(),
      optionC: String(item?.optionC || '').trim(),
      optionD,
      correctOption: availableCorrectOptions.includes(normalizedCorrectOption) ? normalizedCorrectOption : 'A'
    }
  })

  return rows
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

function validateQuestions(questions: ExerciseQuestionInput[], exerciseType: string) {
  if (!Array.isArray(questions) || questions.length !== 10) {
    return 'Mỗi exercise phải có đúng 10 câu hỏi'
  }

  const invalid = questions.find((item) => {
    const questionText = String(item.question || '').trim()
    const optionAText = String(item.optionA || '').trim()
    const optionBText = String(item.optionB || '').trim()
    const optionCText = String(item.optionC || '').trim()
    const optionD = String(item.optionD || '').trim()
    const correctOption = String(item.correctOption || '').trim().toUpperCase()

    let validCorrectOptions: string[]
    if (exerciseType === 'conversation') {
      if (!optionD) return true
      validCorrectOptions = ['A', 'B', 'C', 'D']
    } else if (exerciseType === 'question_response') {
      validCorrectOptions = ['A', 'B', 'C']
    } else {
      validCorrectOptions = optionD ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C']
    }

    const questionRequired = exerciseType !== 'question_response'
    const optionsRequired = exerciseType !== 'question_response'

    return (questionRequired && !questionText) || (optionsRequired && (!optionAText || !optionBText || !optionCText)) || !validCorrectOptions.includes(correctOption)
  })

  if (invalid) {
    return 'Vui lòng nhập đầy đủ nội dung cho cả 10 câu hỏi và chọn đáp án đúng hợp lệ'
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
  const { title, description, questions, isDraft, sourceFormUrl, exerciseType, audioFileUrl, attachmentFileUrl } = body as {
    title?: string
    description?: string
    questions?: ExerciseQuestionInput[]
    isDraft?: boolean
    sourceFormUrl?: string
    exerciseType?: string
    audioFileUrl?: string
    attachmentFileUrl?: string
  }

  const normalizedTitle = String(title || '').trim()
  if (!normalizedTitle) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
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
  const normalizedExerciseType = normalizeExerciseType(exerciseType)
  const normalizedAudioFileUrl = String(audioFileUrl || '').trim() || null
  const normalizedAttachmentFileUrl = String(attachmentFileUrl || '').trim() || null
  if (!savingDraft) {
    const questionError = validateQuestions(normalizedQuestions, normalizedExerciseType)
    if (questionError) {
      return NextResponse.json({ error: questionError }, { status: 400 })
    }

    if ((normalizedExerciseType === 'question_response' || normalizedExerciseType === 'conversation') && !normalizedAudioFileUrl) {
      return NextResponse.json({ error: 'Vui lòng tải lên file audio cho loại bài này.' }, { status: 400 })
    }
  }

  try {
    const exercise = await prisma.$transaction(async (tx) => {
      await tx.exerciseSubmission.deleteMany({ where: { exerciseId: id } })
      await tx.exerciseQuestion.deleteMany({ where: { exerciseId: id } })

      return tx.courseExercise.update({
        where: { id },
        data: {
          title: normalizedTitle,
          description: String(description || '').trim() || null,
          exerciseType: normalizedExerciseType,
          audioFileUrl: normalizedAudioFileUrl,
          attachmentFileUrl: normalizedAttachmentFileUrl,
          isDraft: savingDraft,
          sourceFormUrl: String(sourceFormUrl || '').trim() || null,
          questions: {
            create: normalizedQuestions.map((item, index) => ({
              order: index + 1,
              question: item.question,
              optionA: item.optionA,
              optionB: item.optionB,
              optionC: item.optionC,
              optionD: item.optionD || null,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update exercise.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params

  try {
    await prisma.courseExercise.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }
}