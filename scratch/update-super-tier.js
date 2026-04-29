const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: 'bangdtbk@gmail.com' },
    data: { tier: 'SUPER' }
  });
  console.log('Successfully updated bangdtbk@gmail.com to SUPER tier');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
