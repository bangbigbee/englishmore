import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type LectureNoteRow = {
  id: string
  courseId: string
  sessionNumber: number
  driveLink: string | null
  description: string | null
  updatedAt: Date
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true
    }
  })
  if (!currentUser || currentUser.role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const activeEnrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id, status: 'active' },
    select: {
      courseId: true,
      course: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (activeEnrollments.length === 0) {
    return NextResponse.json({ hasActiveCourse: false, courses: [] })
  }

  const courseIds = activeEnrollments.map((enrollment) => enrollment.courseId)

  const notes = await prisma.lectureNote.findMany({
    where: {
      courseId: { in: courseIds },
      driveLink: { not: null }
    },
    select: {
      id: true,
      courseId: true,
      sessionNumber: true,
      driveLink: true,
      description: true,
      updatedAt: true
    },
    orderBy: [{ courseId: 'asc' }, { sessionNumber: 'asc' }]
  })

  const notesByCourse = new Map<string, LectureNoteRow[]>()
  for (const note of notes) {
    const bucket = notesByCourse.get(note.courseId) || []
    bucket.push(note)
    notesByCourse.set(note.courseId, bucket)
  }

  const courses = activeEnrollments.map((enrollment) => ({
    courseId: enrollment.courseId,
    courseTitle: enrollment.course.title,
    notes: (notesByCourse.get(enrollment.courseId) || []).map((note) => ({
      id: note.id,
      sessionNumber: note.sessionNumber,
      driveLink: note.driveLink,
      description: note.description,
      updatedAt: note.updatedAt
    }))
  }))

  return NextResponse.json({
    hasActiveCourse: true,
    courses
  })
}
