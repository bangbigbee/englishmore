const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const topics = await prisma.toeicGrammarTopic.findMany({ select: { id: true, title: true, type: true, part: true }});
    console.log(topics.filter(t => t.title.includes('ETS')).slice(0, 10));
}
main().finally(() => prisma.$disconnect());
