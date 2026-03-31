import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isHomeworkMessageStorageMissing(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybeCode = (error as { code?: unknown }).code
  const maybeMessage = (error as { message?: unknown }).message
  return (
    (maybeCode === 'P2021' || maybeCode === 'P2022') &&
    typeof maybeMessage === 'string' &&
    maybeMessage.toLowerCase().includes('homeworkmessage')
  )
}

type NormalizedHomeworkMessage = {
  id: string
  senderRole: 'student' | 'teacher'
  content: string
  createdAt: Date
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

function getWeekStart(date: Date) {
  const d = new Date(date)
  const jsDay = d.getDay() // 0 = Sunday
  const daysFromMonday = (jsDay + 6) % 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - daysFromMonday)
  return d
}

function toMondayFirstIndex(date: Date) {
  return (date.getDay() + 6) % 7
}

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
      feedbackNoticeCount: 0,
      pendingHomework: [],
      totalExercises: 0,
      pendingExercisesCount: 0,
      weeklyActivity: WEEK_DAYS.map((day) => ({ day, minutes: 0 }))
    })
  }

  let homeworksRaw: Array<{
    id: string
    title: string
    description: string | null
    dueDate: Date
    submissions: Array<{
      submittedAt: Date
      note: string | null
      teacherComment: string | null
      messages?: Array<{
        id: string
        senderRole: 'student' | 'teacher'
        content: string
        createdAt: Date
      }>
    }>
  }>

  try {
    homeworksRaw = (await prisma.courseHomework.findMany({
      where: { courseId: activeEnrollment.courseId },
      include: {
        submissions: {
          where: { userId: session.user.id },
          select: {
            submittedAt: true,
            note: true,
            teacherComment: true,
            messages: {
              select: {
                id: true,
                senderRole: true,
                content: true,
                createdAt: true
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    })) as typeof homeworksRaw
  } catch (error) {
    if (!isHomeworkMessageStorageMissing(error)) {
      throw error
    }

    homeworksRaw = (await prisma.courseHomework.findMany({
      where: { courseId: activeEnrollment.courseId },
      include: {
        submissions: {
          where: { userId: session.user.id },
          select: {
            submittedAt: true,
            note: true,
            teacherComment: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    })) as typeof homeworksRaw
  }

  const homeworks = homeworksRaw.map((homework) => ({
    ...homework,
    submissions: homework.submissions.map((submission) => {
      const fallbackMessages: NormalizedHomeworkMessage[] = []
      if (submission.note && submission.note.trim()) {
        fallbackMessages.push({
          id: `legacy-student-${homework.id}`,
          senderRole: 'student',
          content: submission.note,
          createdAt: submission.submittedAt
        })
      }
      if (submission.teacherComment && submission.teacherComment.trim()) {
        fallbackMessages.push({
          id: `legacy-teacher-${homework.id}`,
          senderRole: 'teacher',
          content: submission.teacherComment,
          createdAt: submission.submittedAt
        })
      }

      return {
        ...submission,
        messages: (submission.messages || fallbackMessages) as NormalizedHomeworkMessage[]
      }
    })
  }))

  const pendingHomework = homeworks
    .filter((homework) => homework.submissions.length === 0)
    .map((homework) => ({
      id: homework.id,
      title: homework.title,
      description: homework.description,
      dueDate: homework.dueDate
    }))

  const feedbackNoticeCount = homeworks.filter((homework) =>
    (homework.submissions[0]?.messages || []).some((message) => message.senderRole === 'teacher')
  ).length

  const exercises = await prisma.courseExercise.findMany({
    where: { courseId: activeEnrollment.courseId, isDraft: false },
    include: {
      submissions: {
        where: { userId: session.user.id },
        select: { id: true }
      }
    }
  })

  const pendingExercises = exercises.filter((exercise) => exercise.submissions.length === 0)

  const weekStart = getWeekStart(new Date())
  const prismaWithGreeting = prisma as typeof prisma & {
    dailyGreetingCheckin: {
      findMany: (...args: unknown[]) => Promise<unknown>
    }
  }

  const [weeklyHomeworkSubmissions, weeklyExerciseSubmissions, weeklyGreetingCheckins] = await Promise.all([
    prisma.homeworkSubmission.findMany({
      where: {
        userId: session.user.id,
        homework: { courseId: activeEnrollment.courseId },
        submittedAt: { gte: weekStart }
      },
      select: { submittedAt: true }
    }),
    prisma.exerciseSubmission.findMany({
      where: {
        userId: session.user.id,
        exercise: { courseId: activeEnrollment.courseId },
        submittedAt: { gte: weekStart }
      },
      select: { submittedAt: true, durationSeconds: true, totalQuestions: true }
    }),
    prismaWithGreeting.dailyGreetingCheckin.findMany({
      where: {
        userId: session.user.id,
        responseDate: { gte: weekStart }
      },
      select: { responseDate: true }
    })
  ])

  const minutesByDay = Array.from({ length: 7 }, () => 0)

  for (const submission of weeklyHomeworkSubmissions) {
    const dayIndex = toMondayFirstIndex(submission.submittedAt)
    minutesByDay[dayIndex] += 20
  }

  for (const submission of weeklyExerciseSubmissions) {
    const dayIndex = toMondayFirstIndex(submission.submittedAt)
    const derivedMinutes = submission.durationSeconds
      ? Math.max(1, Math.round(submission.durationSeconds / 60))
      : Math.max(8, submission.totalQuestions * 2)
    minutesByDay[dayIndex] += derivedMinutes
  }

  for (const checkin of weeklyGreetingCheckins as Array<{ responseDate: Date }>) {
    const dayIndex = toMondayFirstIndex(checkin.responseDate)
    minutesByDay[dayIndex] += 5
  }

  const weeklyActivity = WEEK_DAYS.map((day, index) => ({
    day,
    minutes: minutesByDay[index]
  }))

  return NextResponse.json({
    hasActiveCourse: true,
    courseId: activeEnrollment.course.id,
    courseTitle: activeEnrollment.course.title,
    completedSessions: activeEnrollment.course.completedSessions,
    totalSessions: 30,
    totalHomework: homeworks.length,
    submittedHomework: homeworks.length - pendingHomework.length,
    feedbackNoticeCount,
    pendingHomework,
    totalExercises: exercises.length,
    pendingExercisesCount: pendingExercises.length,
    weeklyActivity,
    allHomework: homeworks.map((homework) => {
      const submission = homework.submissions[0]
      const messages = submission?.messages || []
      const latestStudentMessage = [...messages].reverse().find((message) => message.senderRole === 'student')
      const latestTeacherMessage = [...messages].reverse().find((message) => message.senderRole === 'teacher')

      return {
        id: homework.id,
        title: homework.title,
        description: homework.description,
        dueDate: homework.dueDate,
        submitted: homework.submissions.length > 0,
        submittedAt: submission?.submittedAt || null,
        note: latestStudentMessage?.content || submission?.note || '',
        teacherComment: latestTeacherMessage?.content || submission?.teacherComment || '',
        messages: messages.map((message) => ({
          id: message.id,
          senderRole: message.senderRole,
          content: message.content,
          createdAt: message.createdAt
        }))
      }
    })
  })
}
