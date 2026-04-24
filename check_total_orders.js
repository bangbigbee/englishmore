const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const orders = await prisma.upgradeOrder.count();
    console.log('Total Upgrade Orders:', orders);
}

check().catch(console.error).finally(() => prisma.$disconnect());
