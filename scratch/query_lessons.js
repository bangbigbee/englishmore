const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const topic = await prisma.toeicGrammarTopic.findFirst({
        where: { title: { contains: 'ETS2024 Part 2' } },
        include: { lessons: true }
    });
    console.log(topic);
}
main().finally(() => prisma.$disconnect());
