import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const courseId = searchParams.get('courseId')
    const tier = searchParams.get('tier')
    
    const whereCondition: any = {}
    
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    if (courseId) {
      whereCondition.enrollments = {
        some: { courseId }
      }
    }

    if (tier) {
      if (tier === 'FREE') {
        // FREE tier could be 'FREE' or null
        const currentSearchOR = whereCondition.OR
        whereCondition.OR = undefined
        whereCondition.AND = [
          currentSearchOR ? { OR: currentSearchOR } : {},
          { OR: [{ tier: 'FREE' }, { tier: null }] }
        ]
      } else {
        whereCondition.tier = tier
      }
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        tier: true,
        tierExpiresAt: true,
        createdAt: true,
        totalStudySeconds: true,
        toeicStars: true,
        currentStreak: true,
        enrollments: {
          include: {
            course: {
              select: { title: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
