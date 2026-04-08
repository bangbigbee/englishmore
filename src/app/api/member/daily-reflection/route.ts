import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ACTIVITY_POINT_KEYS, awardActivityPoints } from '@/lib/activityPoints'

const DAILY_ACTIVITY_ROLES = new Set(['member', 'admin'])
const REFLECTION_AFTER_5PM_MESSAGE = 'You should reflect your day after 5 PM.'

const prismaExt = prisma as typeof prisma & {
  dailyGreetingCheckin: {
    findFirst: (...args: unknown[]) => Promise<unknown>
  }
  dailyReflection: {
    findFirst: (...args: unknown[]) => Promise<unknown>
    upsert: (...args: unknown[]) => Promise<unknown>
  }
}

const getUtcDayStart = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const getUtcNextDayStart = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1))

const COURSE_SCOPE_PREFIX = '[course:'

const encodeScopedMessage = (courseId: string, content: string) => `${COURSE_SCOPE_PREFIX}${courseId}] ${content}`

const parseScopedMessage = (rawMessage: string) => {
  const text = String(rawMessage || '')
  if (!text.startsWith(COURSE_SCOPE_PREFIX)) {
    return { courseId: null as string | null, message: text }
  }

  const endIndex = text.indexOf('] ')
  if (endIndex <= COURSE_SCOPE_PREFIX.length) {
    return { courseId: null as string | null, message: text }
  }

  const courseId = text.slice(COURSE_SCOPE_PREFIX.length, endIndex).trim()
  const message = text.slice(endIndex + 2)
  return {
    courseId: courseId || null,
    message
  }
}

const canReflectNow = () => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    }).formatToParts(new Date())

    const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0')
    return hour >= 17
  } catch {
    return new Date().getHours() >= 17
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!currentUser || !DAILY_ACTIVITY_ROLES.has(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const courseId = String(request.nextUrl.searchParams.get('courseId') || '').trim()
    if (currentUser.role === 'admin' && !courseId) {
      return NextResponse.json({ hasReflection: false, reflection: null })
    }

    const dayStart = getUtcDayStart()
    const nextDayStart = getUtcNextDayStart(dayStart)

    const reflectionRaw = await prismaExt.dailyReflection.findFirst({
      where: {
        userId: currentUser.id,
        responseDate: { gte: dayStart, lt: nextDayStart }
      },
      select: { id: true, message: true, responseDate: true, updatedAt: true }
    }) as { id: string; message: string; responseDate: Date; updatedAt: Date } | null

    const parsedReflection = reflectionRaw ? parseScopedMessage(reflectionRaw.message) : null
    const reflectionMatchesCourse =
      currentUser.role !== 'admin' || (parsedReflection?.courseId && parsedReflection.courseId === courseId)

    const reflection = reflectionRaw && reflectionMatchesCourse
      ? { ...reflectionRaw, message: parsedReflection?.message || reflectionRaw.message }
      : null

    return NextResponse.json({
      hasReflection: Boolean(reflection),
      reflection: reflection || null
    })
  } catch (error) {
    console.error('Error fetching daily reflection:', error)
    return NextResponse.json({ error: 'Failed to fetch reflection' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!currentUser || !DAILY_ACTIVITY_ROLES.has(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const courseId = String(body?.courseId || '').trim()
    if (currentUser.role === 'admin' && !courseId) {
      return NextResponse.json({ error: 'Please choose a course before submitting.' }, { status: 400 })
    }

    if (!canReflectNow()) {
      return NextResponse.json({ error: REFLECTION_AFTER_5PM_MESSAGE }, { status: 400 })
    }

    const dayStart = getUtcDayStart()
    const nextDayStart = getUtcNextDayStart(dayStart)

    // Must have checked in today first
    const checkin = await prismaExt.dailyGreetingCheckin.findFirst({
      where: {
        userId: currentUser.id,
        responseDate: { gte: dayStart, lt: nextDayStart }
      },
      select: { id: true }
    }) as { id: string } | null

    if (!checkin) {
      return NextResponse.json({ error: 'You need to complete your check-in before writing a reflection.' }, { status: 400 })
    }

    const message = String(body?.message || '').trim()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message must be 1000 characters or fewer' }, { status: 400 })
    }

    const messageToSave = currentUser.role === 'admin' && courseId
      ? encodeScopedMessage(courseId, message)
      : message

    const existingReflectionRaw = await prismaExt.dailyReflection.findFirst({
      where: {
        userId: currentUser.id,
        responseDate: { gte: dayStart, lt: nextDayStart }
      },
      select: { id: true }
    }) as { id: string } | null

    const reflection = await prismaExt.dailyReflection.upsert({
      where: {
        userId_responseDate: {
          userId: currentUser.id,
          responseDate: dayStart
        }
      },
      update: { message: messageToSave },
      create: {
        userId: currentUser.id,
        responseDate: dayStart,
        message: messageToSave
      },
      select: { id: true, message: true, responseDate: true, updatedAt: true }
    })

    let awardedAp = 0
    let totalAp = 0

    if (!existingReflectionRaw && currentUser.role === 'member') {
      const dayKey = dayStart.toISOString().slice(0, 10)
      const awardResult = await awardActivityPoints({
        userId: currentUser.id,
        activityKey: ACTIVITY_POINT_KEYS.dailyReflection,
        referenceKey: `${ACTIVITY_POINT_KEYS.dailyReflection}:${currentUser.id}:${dayKey}`
      })

      awardedAp = awardResult.awardedAp
      totalAp = awardResult.totalAp
    }

    return NextResponse.json({ success: true, reflection, awardedAp, totalAp })
  } catch (error) {
    console.error('Error saving daily reflection:', error)
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 })
  }
}
