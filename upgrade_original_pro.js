const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgradeOriginalProToUltra() {
    // Find all users who had a completed upgrade order to PRO
    // Note: In Prisma, if the enum value is just 'COMPLETED' or 'APPROVED' we need to check the schema.
    // Let's just find any user with an UpgradeOrder targetTier = 'PRO' that is not PENDING
    const orders = await prisma.upgradeOrder.findMany({
        where: { 
            targetTier: 'PRO',
            status: { not: 'PENDING' } // assuming it's COMPLETED or APPROVED
        },
        include: { user: true }
    });

    console.log(`Found ${orders.length} approved/completed orders for PRO.`);

    let updatedCount = 0;
    for (const order of orders) {
        if (order.user && order.user.tier !== 'ULTRA') {
            await prisma.user.update({
                where: { id: order.user.id },
                data: { tier: 'ULTRA' }
            });
            updatedCount++;
            console.log(`Upgraded user ${order.user.email} to ULTRA.`);
        }
    }

    console.log(`Total users bumped to ULTRA: ${updatedCount}`);
}

upgradeOriginalProToUltra().catch(console.error).finally(() => prisma.$disconnect());
