const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const tags = await prisma.vocabularyTag.findMany({
      where: { userId: 'some-fake-id-that-doesnt-exist' },
      include: { vocabulary: true }
    });
    console.log(tags);
  } catch (e) {
    console.error(e);
  }
}
run();
