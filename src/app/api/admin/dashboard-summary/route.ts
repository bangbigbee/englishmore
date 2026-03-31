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

const historicalCourseBreakdown = [
  { courseNumber: 1, title: 'Khóa 1', studentCount: 7, status: 'closed' },
  { courseNumber: 2, title: 'Khóa 2', studentCount: 8, status: 'closed' },
  { courseNumber: 3, title: 'Khóa 3', studentCount: 8, status: 'closed' },
  { courseNumber: 4, title: 'Khóa 4', studentCount: 8, status: 'closed' }
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const totalUsers = await prisma.user.count()
  const liveCourses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      isPublished: true,
      isActive: true,
      enrollments: {
        where: { status: 'active' },
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const liveCourseBreakdown = liveCourses.map((course, index) => ({
    courseNumber: historicalCourseBreakdown.length + index + 1,
    title: course.title,
    studentCount: course.enrollments.length,
    status: course.isPublished && course.isActive ? 'recruiting' : 'closed'
  }))

  const liveTotal = liveCourseBreakdown.reduce((sum, course) => sum + course.studentCount, 0)
  const historicalTotal = historicalCourseBreakdown
    .filter(c => c.status === 'closed')
    .reduce((sum, c) => sum + c.studentCount, 0)

  let unreadStudentMessageCount = 0
  let pendingTeacherReplyCount = 0

  try {
    const submissions = await prisma.homeworkSubmission.findMany({
      select: {
        id: true,
        submittedAt: true,
        note: true,
        teacherComment: true,
        teacherLastReadAt: true,
        messages: {
          select: {
            senderRole: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    unreadStudentMessageCount = submissions.reduce((total, submission) => {
      const readAt = submission.teacherLastReadAt || null
      const unreadInSubmission = submission.messages.filter((message) => {
        if (message.senderRole !== 'student') return false
        if (!readAt) return true
        return message.createdAt.getTime() > readAt.getTime()
      }).length
      return total + unreadInSubmission
    }, 0)

    pendingTeacherReplyCount = submissions.reduce((total, submission) => {
      const latestStudent = [...submission.messages].reverse().find((message) => message.senderRole === 'student')
      const latestTeacher = [...submission.messages].reverse().find((message) => message.senderRole === 'teacher')
      if (!latestStudent) return total
      if (!latestTeacher || latestTeacher.createdAt.getTime() < latestStudent.createdAt.getTime()) {
        return total + 1
      }
      return total
    }, 0)
  } catch (error) {
    if (!isHomeworkMessageStorageMissing(error)) {
      throw error
    }

    const submissions = await prisma.homeworkSubmission.findMany({
      select: {
        id: true,
        submittedAt: true,
        updatedAt: true,
        note: true,
        teacherComment: true,
        teacherLastReadAt: true
      }
    })

    unreadStudentMessageCount = submissions.reduce((total, submission) => {
      if (!submission.note || !submission.note.trim()) return total
      const studentMessageAt = submission.submittedAt
      const isUnread = !submission.teacherLastReadAt || studentMessageAt.getTime() > submission.teacherLastReadAt.getTime()
      return total + (isUnread ? 1 : 0)
    }, 0)

    pendingTeacherReplyCount = submissions.reduce((total, submission) => {
      if (!submission.note || !submission.note.trim()) return total
      const studentMessageAt = submission.submittedAt
      const teacherMessageAt = submission.teacherComment && submission.teacherComment.trim() ? submission.updatedAt : null
      const pendingReply = !teacherMessageAt || teacherMessageAt.getTime() < studentMessageAt.getTime()
      return total + (pendingReply ? 1 : 0)
    }, 0)
  }

  return NextResponse.json({
    totalUsers,
    totalStudents: liveTotal + historicalTotal,
    unreadStudentMessageCount,
    pendingTeacherReplyCount,
    courseBreakdown: [...historicalCourseBreakdown, ...liveCourseBreakdown]
  })
}
