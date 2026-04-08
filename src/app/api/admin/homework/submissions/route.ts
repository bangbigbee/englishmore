import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const courseId = request.nextUrl.searchParams.get('courseId')
  const homeworkId = request.nextUrl.searchParams.get('homeworkId')
  const shouldMarkAsRead = request.nextUrl.searchParams.get('markAsRead') === '1'

  const where: {
    homework?: {
      courseId?: string
      id?: string
    }
  } = {}

  if (courseId || homeworkId) {
    where.homework = {}
    if (courseId) where.homework.courseId = courseId
    if (homeworkId) where.homework.id = homeworkId
  }

  if (shouldMarkAsRead) {
    await prisma.homeworkSubmission.updateMany({
      where,
      data: {
        teacherLastReadAt: new Date()
      }
    })
  }

  try {
    const submissions = await prisma.homeworkSubmission.findMany({
      where,
      include: {
        messages: {
          select: {
            id: true,
            senderRole: true,
            content: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        homework: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    if (!isHomeworkMessageStorageMissing(error)) {
      throw error
    }

    const submissions = await prisma.homeworkSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        homework: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    const normalized = submissions.map((submission) => {
      const messages = [] as Array<{
        id: string
        senderRole: 'student' | 'teacher'
        content: string
        createdAt: Date
      }>

      if (submission.note && submission.note.trim()) {
        messages.push({
          id: `legacy-student-${submission.id}`,
          senderRole: 'student',
          content: submission.note,
          createdAt: submission.submittedAt
        })
      }
      if (submission.teacherComment && submission.teacherComment.trim()) {
        messages.push({
          id: `legacy-teacher-${submission.id}`,
          senderRole: 'teacher',
          content: submission.teacherComment,
          createdAt: submission.submittedAt
        })
      }

      return { ...submission, messages }
    })

    return NextResponse.json({ submissions: normalized })
  }
}
