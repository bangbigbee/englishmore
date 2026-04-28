import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const items = await prisma.vocabularyItem.groupBy({
    by: ['topic', 'category'],
    _count: { id: true }
  })
  console.log(items)
  
  const configs = await prisma.vocabularyTopicConfig.findMany()
  console.log(configs)
}
main().finally(() => prisma.$disconnect())
