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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const courseId = request.nextUrl.searchParams.get('courseId')
  const homeworkId = request.nextUrl.searchParams.get('homeworkId')

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
}
