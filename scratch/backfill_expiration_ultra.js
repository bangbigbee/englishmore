const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: {
      tier: 'ULTRA',
      tierExpiresAt: null
    },
    include: {
      enrollments: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  console.log(`Found ${users.length} ULTRA users without expiration.`)

  for (const user of users) {
    let baseDate = user.createdAt
    if (user.enrollments.length > 0) {
      baseDate = user.enrollments[0].createdAt
    }
    const expiresAt = new Date(baseDate)
    expiresAt.setFullYear(expiresAt.getFullYear() + 2)

    await prisma.user.update({
      where: { id: user.id },
      data: { tierExpiresAt: expiresAt }
    })
    
    console.log(`Updated user ${user.name || user.email}: set expiration to ${expiresAt.toISOString()}`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
