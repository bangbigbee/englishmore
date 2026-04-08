import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaWithGreeting = prisma as typeof prisma & {
  dailyGreetingCheckin: {
    findMany: (...args: unknown[]) => Promise<unknown>
  }
}

type GreetingCheckinRecord = {
  userId: string
  message: string
  inputMethod: 'text' | 'voice'
  responseDate: Date
  updatedAt: Date
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

const getUtcDayStart = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const courseId = request.nextUrl.searchParams.get('courseId') || ''
  const dayStart = getUtcDayStart()
  const nextDayStart = new Date(Date.UTC(dayStart.getUTCFullYear(), dayStart.getUTCMonth(), dayStart.getUTCDate() + 1))
  const weekStart = new Date(Date.UTC(dayStart.getUTCFullYear(), dayStart.getUTCMonth(), dayStart.getUTCDate() - 6))

  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: 'active',
      ...(courseId ? { courseId } : {})
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
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
    orderBy: {
      createdAt: 'desc'
    }
  })

  const userIds = Array.from(new Set(enrollments.map((item) => item.userId)))

  if (userIds.length === 0) {
    return NextResponse.json({
      summary: {
        totalStudents: 0,
        checkedInToday: 0
      },
      rows: []
    })
  }

  const checkinsRaw = await prismaWithGreeting.dailyGreetingCheckin.findMany({
    where: {
      userId: { in: userIds },
      responseDate: {
        gte: weekStart,
        lt: nextDayStart
      }
    },
    orderBy: [
      { responseDate: 'desc' },
      { updatedAt: 'desc' }
    ],
    select: {
      userId: true,
      message: true,
      inputMethod: true,
      responseDate: true,
      updatedAt: true
    }
  })

  const checkins = (Array.isArray(checkinsRaw) ? checkinsRaw : []) as GreetingCheckinRecord[]
  const latestByUser = new Map<string, GreetingCheckinRecord>()
  const weeklyCountByUser = new Map<string, number>()
  const checkedInTodaySet = new Set<string>()

  for (const item of checkins) {
    if (!latestByUser.has(item.userId)) {
      latestByUser.set(item.userId, item)
    }

    weeklyCountByUser.set(item.userId, (weeklyCountByUser.get(item.userId) || 0) + 1)

    if (item.responseDate >= dayStart && item.responseDate < nextDayStart) {
      checkedInTodaySet.add(item.userId)
    }
  }

  const rows = enrollments.map((enrollment) => {
    const latest = latestByUser.get(enrollment.userId)
    return {
      enrollmentId: enrollment.id,
      userId: enrollment.user.id,
      studentName: enrollment.user.name || '',
      phone: enrollment.user.phone || '',
      email: enrollment.user.email,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      checkedInToday: checkedInTodaySet.has(enrollment.userId),
      checkinCount7d: weeklyCountByUser.get(enrollment.userId) || 0,
      latestMessage: latest?.message || '',
      latestInputMethod: latest?.inputMethod || null,
      latestUpdatedAt: latest?.updatedAt || null
    }
  })

  return NextResponse.json({
    summary: {
      totalStudents: enrollments.length,
      checkedInToday: checkedInTodaySet.size
    },
    rows
  })
}
