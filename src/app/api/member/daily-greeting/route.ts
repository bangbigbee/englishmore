import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ACTIVITY_POINT_KEYS, awardAchievementBadgePoints, awardActivityPoints, type ApRewardItem } from '@/lib/activityPoints'

const DAILY_ACTIVITY_ROLES = new Set(['member', 'admin'])

const prismaWithGreeting = prisma as typeof prisma & {
  dailyGreetingCheckin: {
    findFirst: (...args: unknown[]) => Promise<unknown>
    findMany: (...args: unknown[]) => Promise<unknown>
    upsert: (...args: unknown[]) => Promise<unknown>
  }
  dailyReflection: {
    findMany: (...args: unknown[]) => Promise<unknown>
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

export async function GET(request: NextRequest) {
  try {
    const shouldMarkAsRead = request.nextUrl.searchParams.get('markAsRead') === '1'
    const requestedCourseId = String(request.nextUrl.searchParams.get('courseId') || '').trim()

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, classActivityLastReadAt: true }
    })

    if (!currentUser || !DAILY_ACTIVITY_ROLES.has(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dayStart = getUtcDayStart()
    const nextDayStart = getUtcNextDayStart(dayStart)

    const checkinRaw = await prismaWithGreeting.dailyGreetingCheckin.findFirst({
      where: {
        userId: currentUser.id,
        responseDate: {
          gte: dayStart,
          lt: nextDayStart
        }
      },
      select: {
        id: true,
        message: true,
        inputMethod: true,
        responseDate: true,
        updatedAt: true
      }
    }) as {
      id: string
      message: string
      inputMethod: 'text' | 'voice'
      responseDate: Date
      updatedAt: Date
    } | null
    const parsedSelfCheckin = checkinRaw ? parseScopedMessage(checkinRaw.message) : null
    const checkin = checkinRaw
      ? {
          ...checkinRaw,
          message: parsedSelfCheckin?.message || checkinRaw.message
        }
      : null

    let targetCourseId = ''

    if (currentUser.role === 'member') {
      const activeEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: currentUser.id,
          status: 'active'
        },
        select: {
          courseId: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      targetCourseId = String(activeEnrollment?.courseId || '')
    } else {
      targetCourseId = requestedCourseId
    }

    const hasScopedMatchForAdmin =
      currentUser.role !== 'admin' || (parsedSelfCheckin?.courseId && parsedSelfCheckin.courseId === targetCourseId)

    if (!targetCourseId) {
      return NextResponse.json({
        hasResponse: false,
        response: null,
        conversation: [],
        unreadSummary: { checkins: 0, reflections: 0, total: 0 }
      })
    }

    const checkinConversation = await prismaWithGreeting.dailyGreetingCheckin.findMany({
      where: {
        responseDate: {
          gte: dayStart,
          lt: nextDayStart
        },
        user: {
          OR: [
            {
              enrollments: {
                some: {
                  courseId: targetCourseId,
                  status: 'active'
                }
              }
            },
            {
              role: 'admin'
            }
          ]
        }
      },
      select: {
        id: true,
        message: true,
        inputMethod: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      },
      orderBy: [{ updatedAt: 'asc' }]
    })

    const reflectionConversation = await prismaWithGreeting.dailyReflection.findMany({
      where: {
        responseDate: {
          gte: dayStart,
          lt: nextDayStart
        },
        user: {
          OR: [
            {
              enrollments: {
                some: {
                  courseId: targetCourseId,
                  status: 'active'
                }
              }
            },
            {
              role: 'admin'
            }
          ]
        }
      },
      select: {
        id: true,
        message: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      },
      orderBy: [{ updatedAt: 'asc' }]
    })

    const checkinConversationItems = checkinConversation as Array<{
      id: string
      message: string
      inputMethod: 'text' | 'voice'
      updatedAt: Date
      user: { id: string; name: string | null; email: string; image: string | null; role: 'member' | 'admin' | 'user' }
    }>

    const reflectionConversationItems = reflectionConversation as Array<{
      id: string
      message: string
      updatedAt: Date
      user: { id: string; name: string | null; email: string; image: string | null; role: 'member' | 'admin' | 'user' }
    }>

    const conversationItems = [
      ...checkinConversationItems.map((item) => ({
        id: `checkin-${item.id}`,
        sourceId: item.id,
        userId: item.user.id,
        studentName: item.user.name || item.user.email,
        studentImage: item.user.image,
        message: item.message,
        senderRole: item.user.role,
        inputMethod: item.inputMethod,
        updatedAt: item.updatedAt,
        entryType: 'checkin' as const
      })),
      ...reflectionConversationItems.map((item) => ({
        id: `reflection-${item.id}`,
        sourceId: item.id,
        userId: item.user.id,
        studentName: item.user.name || item.user.email,
        studentImage: item.user.image,
        message: item.message,
        senderRole: item.user.role,
        inputMethod: null,
        updatedAt: item.updatedAt,
        entryType: 'reflection' as const
      }))
    ]
      .map((item) => {
        if (item.senderRole !== 'admin') {
          return { ...item, scopedCourseId: null as string | null }
        }

        const parsed = parseScopedMessage(item.message)
        return {
          ...item,
          scopedCourseId: parsed.courseId,
          message: parsed.message
        }
      })
      .filter((item) => item.senderRole !== 'admin' || item.scopedCourseId === targetCourseId)
      .sort((left, right) => new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime())

    const unreadSummary = conversationItems.reduce(
      (summary, item) => {
        const isFromOtherUser = item.userId !== currentUser.id
        const isUnread = !currentUser.classActivityLastReadAt || new Date(item.updatedAt).getTime() > currentUser.classActivityLastReadAt.getTime()

        if (!isFromOtherUser || !isUnread) {
          return summary
        }

        if (item.entryType === 'checkin') {
          summary.checkins += 1
        }

        if (item.entryType === 'reflection') {
          summary.reflections += 1
        }

        summary.total += 1
        return summary
      },
      { checkins: 0, reflections: 0, total: 0 }
    )

    if (shouldMarkAsRead) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { classActivityLastReadAt: new Date() }
      })
    }

    return NextResponse.json({
      hasResponse: Boolean(checkin) && hasScopedMatchForAdmin,
      response: hasScopedMatchForAdmin ? (checkin || null) : null,
      conversation: conversationItems,
      unreadSummary: shouldMarkAsRead ? { checkins: 0, reflections: 0, total: 0 } : unreadSummary
    })
  } catch (error) {
    console.error('Error fetching daily greeting checkin:', error)
    return NextResponse.json({ error: 'Failed to fetch daily greeting checkin' }, { status: 500 })
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
    const inputMethod = body?.inputMethod === 'voice' ? 'voice' : body?.inputMethod === 'text' ? 'text' : null
    const message = String(body?.message || '').trim()

    if (currentUser.role === 'admin' && !courseId) {
      return NextResponse.json({ error: 'Please choose a course before submitting.' }, { status: 400 })
    }

    if (!inputMethod) {
      return NextResponse.json({ error: 'inputMethod must be text or voice' }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message must be 500 characters or fewer' }, { status: 400 })
    }

    const dayStart = getUtcDayStart()

    const messageToSave = currentUser.role === 'admin' && courseId
      ? encodeScopedMessage(courseId, message)
      : message

    const existingCheckinRaw = await prismaWithGreeting.dailyGreetingCheckin.findFirst({
      where: {
        userId: currentUser.id,
        responseDate: {
          gte: dayStart,
          lt: getUtcNextDayStart(dayStart)
        }
      },
      select: { id: true }
    }) as { id: string } | null

    const checkin = await prismaWithGreeting.dailyGreetingCheckin.upsert({
      where: {
        userId_responseDate: {
          userId: currentUser.id,
          responseDate: dayStart
        }
      },
      update: {
        message: messageToSave,
        inputMethod
      },
      create: {
        userId: currentUser.id,
        responseDate: dayStart,
        message: messageToSave,
        inputMethod
      },
      select: {
        id: true,
        message: true,
        inputMethod: true,
        responseDate: true,
        updatedAt: true
      }
    })

    let awardedAp = 0
    let totalAp = 0
    const apRewards: ApRewardItem[] = []

    if (!existingCheckinRaw && currentUser.role === 'member') {
      try {
        const dayKey = dayStart.toISOString().slice(0, 10)
        const awardResult = await awardActivityPoints({
          userId: currentUser.id,
          activityKey: ACTIVITY_POINT_KEYS.dailyCheckin,
          referenceKey: `${ACTIVITY_POINT_KEYS.dailyCheckin}:${currentUser.id}:${dayKey}`
        })

        awardedAp = awardResult.awardedAp
        totalAp = awardResult.totalAp
        if (awardResult.awardedAp > 0) {
          apRewards.push({
            points: awardResult.awardedAp,
            reason: 'for Daily Check-in.'
          })
        }
      } catch (apError) {
        console.warn('AP awarding skipped for check-in because AP schema is not ready.', apError)
      }
    }

    if (currentUser.role === 'member') {
      try {
        const badgeRewards = await awardAchievementBadgePoints(currentUser.id)
        if (badgeRewards.length > 0) {
          apRewards.push(...badgeRewards)
          awardedAp += badgeRewards.reduce((sum, item) => sum + item.points, 0)
        }
      } catch (badgeApError) {
        console.warn('Achievement AP awarding skipped for check-in.', badgeApError)
      }
    }

    return NextResponse.json({ success: true, checkin, awardedAp, totalAp, apRewards })
  } catch (error) {
    console.error('Error saving daily greeting checkin:', error)
    return NextResponse.json({ error: 'Failed to save daily greeting checkin' }, { status: 500 })
  }
}
