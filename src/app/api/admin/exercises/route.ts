import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Prisma } from '@prisma/client'
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

const VALID_EXERCISE_TYPES = ['multiple_choice', 'listening_audio'] as const

function normalizeExerciseType(value: unknown) {
  const normalized = String(value || '').trim().toLowerCase()
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

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

function validateQuestions(questions: ExerciseQuestionInput[]) {
  if (!Array.isArray(questions) || questions.length !== 10) {
    return 'Mỗi exercise phải có đúng 10 câu hỏi'
  }

  const invalid = questions.find((item) => {
    const optionD = String(item.optionD || '').trim()
    const correctOption = String(item.correctOption || '').trim().toUpperCase()
    const validCorrectOptions = optionD ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C']

    return !item.question?.trim() || !item.optionA?.trim() || !item.optionB?.trim() || !item.optionC?.trim() || !validCorrectOptions.includes(correctOption)
  })

  if (invalid) {
    return 'Vui lòng nhập đầy đủ nội dung cho cả 10 câu hỏi và chọn đáp án đúng hợp lệ'
  }

  return null
}

const isMissingSpeakYourselfTable = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2021' &&
  String(error.meta?.table || '').includes('SpeakYourselfAttempt')

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
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
          title: true,
          description: true,
          exerciseType: true,
          audioFileUrl: true,
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
              optionD: true,
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

    let speakYourselfAttempts: Array<{
      id: string
      accuracy: number
      passed: boolean
      generatedScript: string
      recognizedText: string
      createdAt: Date
      user: { id: string; name: string | null; email: string }
      course: { id: string; title: string }
    }> = []

    try {
      speakYourselfAttempts = await prisma.speakYourselfAttempt.findMany({
        select: {
          id: true,
          accuracy: true,
          passed: true,
          generatedScript: true,
          recognizedText: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          course: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 300
      })
    } catch (error) {
      if (!isMissingSpeakYourselfTable(error)) {
        throw error
      }
      speakYourselfAttempts = []
    }

    return NextResponse.json({ courses, exercises, speakYourselfAttempts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load exercises.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const { courseId, title, description, questions, isDraft, sourceFormUrl, exerciseType, audioFileUrl } = body as {
    courseId?: string
    title?: string
    description?: string
    questions?: ExerciseQuestionInput[]
    isDraft?: boolean
    sourceFormUrl?: string
    exerciseType?: string
    audioFileUrl?: string
  }

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const normalizedTitle = String(title || '').trim()
  if (!normalizedTitle) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const creatingDraft = Boolean(isDraft)
  const normalizedQuestions = normalizeDraftQuestions(questions || [])
  const normalizedExerciseType = normalizeExerciseType(exerciseType)
  const normalizedAudioFileUrl = String(audioFileUrl || '').trim() || null

  if (!creatingDraft) {
    const questionError = validateQuestions(normalizedQuestions)
    if (questionError) {
      return NextResponse.json({ error: questionError }, { status: 400 })
    }

    if (normalizedExerciseType === 'listening_audio' && !normalizedAudioFileUrl) {
      return NextResponse.json({ error: 'Vui lòng tải lên file audio cho bài listening.' }, { status: 400 })
    }
  }

  try {
    const latestExercise = await prisma.courseExercise.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const exercise = await prisma.courseExercise.create({
      data: {
        courseId,
        order: (latestExercise?.order || 0) + 1,
        title: normalizedTitle,
        description: String(description || '').trim() || null,
        exerciseType: normalizedExerciseType,
        audioFileUrl: normalizedAudioFileUrl,
        isDraft: creatingDraft,
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

    return NextResponse.json(exercise, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create exercise.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}