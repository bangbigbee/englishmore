import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const reflection = await prismaExt.dailyReflection.findFirst({
      where: {
        userId: currentUser.id,
        responseDate: { gte: dayStart, lt: nextDayStart }
      },
      select: { id: true, message: true, responseDate: true, updatedAt: true }
    }) as { id: string; message: string; responseDate: Date; updatedAt: Date } | null

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

    if (!currentUser || currentUser.role !== 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    const body = await request.json()
    const message = String(body?.message || '').trim()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message must be 1000 characters or fewer' }, { status: 400 })
    }

    const reflection = await prismaExt.dailyReflection.upsert({
      where: {
        userId_responseDate: {
          userId: currentUser.id,
          responseDate: dayStart
        }
      },
      update: { message },
      create: {
        userId: currentUser.id,
        responseDate: dayStart,
        message
      },
      select: { id: true, message: true, responseDate: true, updatedAt: true }
    })

    return NextResponse.json({ success: true, reflection })
  } catch (error) {
    console.error('Error saving daily reflection:', error)
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 })
  }
}
