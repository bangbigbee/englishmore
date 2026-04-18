const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAudio() {
  const questions = await prisma.toeicQuestion.findMany({
    where: {
      question: { contains: 'Look at the picture' } // Just an example to find Part 1 questions
    },
    take: 10,
    select: {
      id: true,
      question: true,
      audioUrl: true,
      imageUrl: true,
      lessonId: true
    }
  });
  console.log(JSON.stringify(questions, null, 2));
}

checkAudio().catch(console.error).finally(() => prisma.$disconnect());
