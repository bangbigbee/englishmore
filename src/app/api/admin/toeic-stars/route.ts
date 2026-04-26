import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureDefaultToeicStarRules } from '@/lib/toeicStars'

const prismaWithToeicStars = prisma as typeof prisma & {
  toeicStarRule: {
    findMany: (...args: unknown[]) => Promise<unknown>
    update: (...args: unknown[]) => Promise<unknown>
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await ensureDefaultToeicStarRules()

    const rulesRaw = await prismaWithToeicStars.toeicStarRule.findMany({
      orderBy: [
        { isActive: 'desc' },
        { points: 'desc' },
        { activityKey: 'asc' }
      ]
    })

    return NextResponse.json(rulesRaw)
  } catch (error) {
    console.error('Error fetching toeic star rules:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id, points, isActive, toastMessage } = await request.json()

    if (!id || typeof points !== 'number') {
      return new NextResponse('Invalid data', { status: 400 })
    }

    const updatedRuleRaw = await prismaWithToeicStars.toeicStarRule.update({
      where: { id },
      data: {
        points,
        isActive: isActive !== undefined ? isActive : true,
        ...(toastMessage !== undefined && { toastMessage })
      }
    })

    return NextResponse.json(updatedRuleRaw)
  } catch (error) {
    console.error('Error updating toeic star rule:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
