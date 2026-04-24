import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.user.updateMany({
        where: { tier: 'FREE' },
        data: { tier: 'PRO' }
    });
    console.log(`Updated ${res.count} users to PRO.`);
}

main().finally(() => prisma.$disconnect());
