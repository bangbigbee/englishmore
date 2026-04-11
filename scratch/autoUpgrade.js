const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function pollAndUpgrade() {
  console.log("Waiting for bangdtbk@gmail.com to login...");
  while (true) {
    const user = await prisma.user.findUnique({ where: { email: 'bangdtbk@gmail.com' } });
    if (user && user.role !== 'admin') {
      await prisma.user.update({
        where: { email: 'bangdtbk@gmail.com' },
        data: { role: 'admin' }
      });
      console.log("Upgraded bangdtbk@gmail.com to admin!");
      break;
    } else if (user && user.role === 'admin') {
      console.log("Already admin.");
      break;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

pollAndUpgrade().then(() => prisma.$disconnect()).catch(console.error);
