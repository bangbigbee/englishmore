import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const search = ''
    const courseId = null
    const tier = null

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

    console.log('baseWhereCondition:', JSON.stringify(baseWhereCondition, null, 2))
    console.log('whereCondition:', JSON.stringify(whereCondition, null, 2))

    const [totalCount, freeCount, proCount, ultraCount] = await Promise.all([
      prisma.user.count({ where: baseWhereCondition }),
      prisma.user.count({ where: { AND: [baseWhereCondition, { OR: [{ tier: 'FREE' }, { tier: null }] }] } }),
      prisma.user.count({ where: { AND: [baseWhereCondition, { tier: 'PRO' }] } }),
      prisma.user.count({ where: { AND: [baseWhereCondition, { tier: 'ULTRA' }] } })
    ])
    
    console.log('counts:', totalCount, freeCount, proCount, ultraCount)

  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
