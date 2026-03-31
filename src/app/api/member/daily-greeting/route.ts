import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const prismaWithGreeting = prisma as typeof prisma & {
  dailyGreetingCheckin: {
    findFirst: (...args: unknown[]) => Promise<unknown>
    findMany: (...args: unknown[]) => Promise<unknown>
    upsert: (...args: unknown[]) => Promise<unknown>
  }
}

const getUtcDayStart = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

const getUtcNextDayStart = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1))

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!currentUser || currentUser.role !== 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dayStart = getUtcDayStart()
    const nextDayStart = getUtcNextDayStart(dayStart)

    const checkin = await prismaWithGreeting.dailyGreetingCheckin.findFirst({
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
    })

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

    const conversation = activeEnrollment
      ? await prismaWithGreeting.dailyGreetingCheckin.findMany({
          where: {
            responseDate: {
              gte: dayStart,
              lt: nextDayStart
            },
            user: {
              enrollments: {
                some: {
                  courseId: activeEnrollment.courseId,
                  status: 'active'
                }
              }
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
                email: true
              }
            }
          },
          orderBy: [{ updatedAt: 'asc' }]
        })
      : []

    const conversationItems = conversation as Array<{
      id: string
      message: string
      inputMethod: 'text' | 'voice'
      updatedAt: Date
      user: { id: string; name: string | null; email: string }
    }>

    return NextResponse.json({
      hasResponse: Boolean(checkin),
      response: checkin || null,
      conversation: conversationItems.map((item) => ({
        id: item.id,
        userId: item.user.id,
        studentName: item.user.name || item.user.email,
        message: item.message,
        inputMethod: item.inputMethod,
        updatedAt: item.updatedAt
      }))
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

    if (!currentUser || currentUser.role !== 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const inputMethod = body?.inputMethod === 'voice' ? 'voice' : body?.inputMethod === 'text' ? 'text' : null
    const message = String(body?.message || '').trim()

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

    const checkin = await prismaWithGreeting.dailyGreetingCheckin.upsert({
      where: {
        userId_responseDate: {
          userId: currentUser.id,
          responseDate: dayStart
        }
      },
      update: {
        message,
        inputMethod
      },
      create: {
        userId: currentUser.id,
        responseDate: dayStart,
        message,
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

    return NextResponse.json({ success: true, checkin })
  } catch (error) {
    console.error('Error saving daily greeting checkin:', error)
    return NextResponse.json({ error: 'Failed to save daily greeting checkin' }, { status: 500 })
  }
}
