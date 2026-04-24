const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bumpMembersToUltra() {
    // Find all users with role 'member' and tier 'PRO'
    const members = await prisma.user.findMany({
        where: { role: 'member', tier: 'PRO' }
    });

    let count = 0;
    for (const member of members) {
        await prisma.user.update({
            where: { id: member.id },
            data: { tier: 'ULTRA' }
        });
        count++;
    }

    console.log(`Successfully bumped ${count} 'member' users from PRO to ULTRA.`);
}

bumpMembersToUltra().catch(console.error).finally(() => prisma.$disconnect());
