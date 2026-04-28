import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const names = [
    'Bảo trâm Dương',
    'Ngọc Liên Trần',
    'Thuận Huỳnh Nguyễn Minh'
  ];

  for (const name of names) {
    const users = await prisma.user.findMany({
      where: { name: { contains: name } }
    });

    if (users.length > 0) {
      const user = users[0];
      await prisma.user.update({
        where: { id: user.id },
        data: {
          toeicStars: { increment: 100 }
        }
      });
      console.log(`Added 100 stars to ${user.name}`);
    } else {
      console.log(`User not found: ${name}`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
