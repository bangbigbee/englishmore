import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaExt = prisma as typeof prisma & {
  dailyReflection: {
    findMany: (...args: unknown[]) => Promise<unknown>
  }
}

type ReflectionRecord = {
  userId: string
  message: string
  responseDate: Date
  updatedAt: Date
  user: { id: string; name: string | null; email: string; phone: string | null }
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

  // Get active enrollments (optionally filtered by course)
  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: 'active',
      ...(courseId ? { courseId } : {})
    },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true } },
      course: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const userIds = Array.from(new Set(enrollments.map((e) => e.userId)))

  if (userIds.length === 0) {
    return NextResponse.json({ rows: [], summary: { totalStudents: 0, reflectedToday: 0 } })
  }

  const reflectionsRaw = await prismaExt.dailyReflection.findMany({
    where: {
      userId: { in: userIds },
      responseDate: { gte: dayStart, lt: nextDayStart }
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } }
    },
    orderBy: { updatedAt: 'asc' }
  }) as ReflectionRecord[]

  const reflectionByUser = new Map(reflectionsRaw.map((r) => [r.userId, r]))

  // Deduplicate by userId (one row per student)
  const seen = new Set<string>()
  const rows = enrollments
    .filter((e) => {
      if (seen.has(e.userId)) return false
      seen.add(e.userId)
      return true
    })
    .map((e) => {
      const ref = reflectionByUser.get(e.userId)
      return {
        enrollmentId: e.id,
        userId: e.userId,
        studentName: e.user.name || e.user.email,
        phone: e.user.phone || '',
        email: e.user.email,
        courseId: e.courseId,
        courseTitle: e.course.title,
        reflectedToday: Boolean(ref),
        message: ref?.message || '',
        updatedAt: ref?.updatedAt?.toISOString() || null
      }
    })

  const reflectedToday = rows.filter((r) => r.reflectedToday).length

  return NextResponse.json({
    summary: { totalStudents: rows.length, reflectedToday },
    rows
  })
}
