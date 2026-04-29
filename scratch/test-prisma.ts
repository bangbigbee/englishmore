import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const search = ''
    const courseId = null
    const tier = null

    const buildWhere = (tierCondition?: any) => {
      const conditions: any[] = []
      
      if (search) {
        conditions.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } }
          ]
        })
      }

      if (courseId) {
        conditions.push({
          enrollments: {
            some: { courseId }
          }
        })
      }

      if (tierCondition) {
        conditions.push(tierCondition)
      }

      return conditions.length > 0 ? { AND: conditions } : {}
    }

    const whereCondition = buildWhere(
      tier === 'FREE' ? { OR: [{ tier: 'FREE' }, { tier: null }] } : tier ? { tier } : undefined
    )

    console.log('whereCondition:', JSON.stringify(whereCondition, null, 2))

    const [totalCount, freeCount, proCount, ultraCount] = await Promise.all([
      prisma.user.count({ where: buildWhere() }),
      prisma.user.count({ where: buildWhere({ OR: [{ tier: 'FREE' }, { tier: null }] }) }),
      prisma.user.count({ where: buildWhere({ tier: 'PRO' }) }),
      prisma.user.count({ where: buildWhere({ tier: 'ULTRA' }) })
    ])
    
    console.log('counts:', totalCount, freeCount, proCount, ultraCount)

  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
