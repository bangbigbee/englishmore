import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }
  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }
  return { ok: true, status: 200 }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const { exerciseIds, targetCourseId } = body as { exerciseIds?: unknown; targetCourseId?: unknown }

  if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
    return NextResponse.json({ error: 'exerciseIds phải là mảng không rỗng' }, { status: 400 })
  }
  if (!targetCourseId || typeof targetCourseId !== 'string') {
    return NextResponse.json({ error: 'targetCourseId là bắt buộc' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({ where: { id: targetCourseId }, select: { id: true } })
  if (!course) {
    return NextResponse.json({ error: 'Khóa học đích không tồn tại' }, { status: 404 })
  }

  const sources = await prisma.courseExercise.findMany({
    where: { id: { in: exerciseIds as string[] } },
    include: { questions: { orderBy: { order: 'asc' } } }
  })

  if (sources.length === 0) {
    return NextResponse.json({ error: 'Không tìm thấy exercise nào để copy' }, { status: 404 })
  }

  const latestExercise = await prisma.courseExercise.findFirst({
    where: { courseId: targetCourseId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })

  let nextOrder = (latestExercise?.order ?? 0) + 1

  const created = []
  for (const src of sources) {
    const exercise = await prisma.courseExercise.create({
      data: {
        courseId: targetCourseId,
        order: nextOrder++,
        title: src.title,
        description: src.description,
        exerciseType: src.exerciseType,
        audioFileUrl: src.audioFileUrl,
        attachmentFileUrl: src.attachmentFileUrl,
        isDraft: true,
        sourceFormUrl: src.sourceFormUrl,
        questions: {
          create: src.questions.map((q) => ({
            order: q.order,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption
          }))
        }
      },
      include: {
        course: { select: { title: true } },
        questions: { orderBy: { order: 'asc' } }
      }
    })
    created.push(exercise)
  }

  return NextResponse.json({ copied: created.length, exercises: created }, { status: 201 })
}
