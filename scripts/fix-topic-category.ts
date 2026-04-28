import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.vocabularyItem.updateMany({
    where: { topic: "Real Estate & Housing - Bất động sản & Nhà ở" },
    data: { category: "TOEIC" }
  })
  
  // also create config if needed
  await prisma.vocabularyTopicConfig.upsert({
    where: { topic: "Real Estate & Housing - Bất động sản & Nhà ở" },
    update: { packageType: "ADVANCED" },
    create: { topic: "Real Estate & Housing - Bất động sản & Nhà ở", packageType: "ADVANCED" }
  })

  console.log("Updated category to TOEIC. Count:", result.count)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
