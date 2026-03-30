import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== 'member' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id, status: 'active' },
    include: {
      course: {
        select: { id: true, title: true, completedSessions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!activeEnrollment) {
    return NextResponse.json({
      hasActiveCourse: false,
      courseTitle: '',
      completedSessions: 0,
      totalSessions: 30,
      totalHomework: 0,
      submittedHomework: 0,
      pendingHomework: []
    })
  }

  const homeworks = await prisma.courseHomework.findMany({
    where: { courseId: activeEnrollment.courseId },
    include: {
      submissions: {
        where: { userId: session.user.id },
        select: { submittedAt: true, note: true, teacherComment: true }
      }
    },
    orderBy: { dueDate: 'asc' }
  })

  const pendingHomework = homeworks
    .filter((homework) => homework.submissions.length === 0)
    .map((homework) => ({
      id: homework.id,
      title: homework.title,
      description: homework.description,
      dueDate: homework.dueDate
    }))

  return NextResponse.json({
    hasActiveCourse: true,
    courseId: activeEnrollment.course.id,
    courseTitle: activeEnrollment.course.title,
    completedSessions: activeEnrollment.course.completedSessions,
    totalSessions: 30,
    totalHomework: homeworks.length,
    submittedHomework: homeworks.length - pendingHomework.length,
    pendingHomework,
    allHomework: homeworks.map((homework) => ({
      id: homework.id,
      title: homework.title,
      description: homework.description,
      dueDate: homework.dueDate,
      submitted: homework.submissions.length > 0,
      submittedAt: homework.submissions[0]?.submittedAt || null,
      note: homework.submissions[0]?.note || '',
      teacherComment: homework.submissions[0]?.teacherComment || ''
    }))
  })
}
