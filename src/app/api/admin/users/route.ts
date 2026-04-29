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
    
    const baseWhereCondition: any = {}
    
    if (search) {
      baseWhereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    if (courseId) {
      baseWhereCondition.enrollments = {
        some: { courseId }
      }
    }

    const whereCondition = { ...baseWhereCondition }

    if (tier) {
      if (tier === 'FREE') {
        whereCondition.AND = [
          baseWhereCondition.OR ? { OR: baseWhereCondition.OR } : {},
          { OR: [{ tier: 'FREE' }, { tier: null }] }
        ]
        delete whereCondition.OR
      } else {
        whereCondition.tier = tier
      }
    }

    // Compute stats independent of the `tier` filter
    const [totalCount, freeCount, proCount, ultraCount] = await Promise.all([
      prisma.user.count({ where: baseWhereCondition }),
      prisma.user.count({ where: { AND: [baseWhereCondition, { OR: [{ tier: 'FREE' }, { tier: null }] }] } }),
      prisma.user.count({ where: { AND: [baseWhereCondition, { tier: 'PRO' }] } }),
      prisma.user.count({ where: { AND: [baseWhereCondition, { tier: 'ULTRA' }] } })
    ])

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

    return NextResponse.json({ 
      users,
      stats: { total: totalCount, free: freeCount, pro: proCount, ultra: ultraCount }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
