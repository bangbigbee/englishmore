const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const counts = await prisma.user.groupBy({
        by: ['tier'],
        _count: { tier: true }
    });
    console.log(counts);
}

check().catch(console.error).finally(() => prisma.$disconnect());
