const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const orders = await prisma.upgradeOrder.findMany({
        where: { targetTier: 'PRO', status: 'COMPLETED' },
        include: { user: true }
    });
    console.log('Orders:', orders.length);
    
    // Now also check if there's any user whose tier is PRO but updatedAt is before today?
    // Wait, the updateMany did not change updatedAt. So I can't rely on updatedAt.
    // What if I check the users with role = 'member'? The original app had 'user', 'member', 'admin'.
    // Maybe member = PRO?
    const members = await prisma.user.count({ where: { role: 'member' } });
    console.log('Members:', members);
}

check().catch(console.error).finally(() => prisma.$disconnect());
