const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'bangblockchain@gmail.com' }
  });
  console.log("Before:", user.totalStudySeconds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totalStudySeconds: {
        increment: 60
      }
    }
  });

  const userAfter = await prisma.user.findUnique({
    where: { email: 'bangblockchain@gmail.com' }
  });
  console.log("After:", userAfter.totalStudySeconds);
}
main().catch(console.error).finally(() => prisma.$disconnect());
