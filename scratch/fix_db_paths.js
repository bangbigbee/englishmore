const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const taskToTab = {
    'GRAMMAR': 'grammar',
    'VOCAB': 'vocabulary',
    'LISTENING': 'listening',
    'READING': 'reading',
    'TEST': 'actual-test',
    'REVIEW': 'actual-test'
};

async function fixPaths() {
    console.log("Fixing paths in database...");
    const tasks = await prisma.dailyTask.findMany();
    let count = 0;
    for (const task of tasks) {
        const tab = taskToTab[task.taskType];
        if (tab && (!task.referencePath || !task.referencePath.includes('tab=' + tab))) {
            await prisma.dailyTask.update({
                where: { id: task.id },
                data: { referencePath: '/toeic-practice?tab=' + tab }
            });
            count++;
        }
    }
    console.log(`Updated ${count} tasks.`);
}

fixPaths().then(() => prisma.$disconnect()).catch(console.error);
