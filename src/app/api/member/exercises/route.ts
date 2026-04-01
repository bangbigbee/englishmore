import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!currentUser || currentUser.role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id, status: 'active' },
    include: {
      course: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!activeEnrollment) {
    return NextResponse.json({ hasActiveCourse: false, exercises: [] })
  }

  const exercises = await prisma.courseExercise.findMany({
    where: { courseId: activeEnrollment.courseId, isDraft: false },
    select: {
      id: true,
      order: true,
      title: true,
      description: true,
      questions: {
        select: {
          id: true,
          order: true,
          question: true,
          optionA: true,
          optionB: true,
          optionC: true
        },
        orderBy: { order: 'asc' }
      },
      submissions: {
        where: { userId: session.user.id },
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
        },
        take: 1
      }
    },
    orderBy: { order: 'asc' }
  })

  return NextResponse.json({
    hasActiveCourse: true,
    courseTitle: activeEnrollment.course.title,
    exercises: exercises.map((exercise) => ({
      id: exercise.id,
      order: exercise.order,
      title: exercise.title,
      description: exercise.description,
      questions: exercise.questions,
      submission: exercise.submissions[0] || null
    }))
  })
}