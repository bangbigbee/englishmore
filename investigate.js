const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigate() {
    const users = await prisma.user.findMany({
        where: { tier: 'PRO' },
        select: { id: true, email: true, createdAt: true, updatedAt: true, role: true }
    });
    
    console.log(`Total PRO users: ${users.length}`);
    const sorted = users.sort((a,b) => b.updatedAt - a.updatedAt);
    console.log('Most recently updated:', sorted.slice(0, 5));
    
    const members = users.filter(u => u.role === 'member');
    console.log(`PRO users with role 'member': ${members.length}`);
}

investigate().catch(console.error).finally(() => prisma.$disconnect());
