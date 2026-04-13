import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const keysToDelete = ['toeic_correct_streak', 'toeic_practice']
  
  const result = await prisma.activityPointRule.deleteMany({
    where: {
      activityKey: {
        in: keysToDelete
      }
    }
  })
  
  console.log(`Deleted ${result.count} deprecated rules.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
