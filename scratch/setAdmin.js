const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updatedUser = await prisma.user.updateMany({
    where: { email: 'bangdtbk@gmail.com' },
    data: { role: 'admin' },
  });
  console.log('Updated user:', updatedUser);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
