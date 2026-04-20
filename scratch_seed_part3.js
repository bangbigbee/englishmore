const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding TOEIC Part 3 and Part 4...");

    const part3Topic = await prisma.toeicGrammarTopic.upsert({
        where: { slug: 'ets-2024-part3-test1' },
        update: {},
        create: {
            type: 'LISTENING',
            part: 3,
            title: 'ETS 2024 Part 3 Test 1',
            slug: 'ets-2024-part3-test1',
            lessons: {
                create: [
                    {
                        title: 'Test 01',
                        order: 1,
                        questions: {
                            create: [
                                { question: 'What is the man asking about?', optionA: 'A job', optionB: 'A meeting', optionC: 'A report', optionD: 'A shipment', correctOption: 'B', audioUrl: '/audio/part3-1.mp3' },
                                { question: 'Who most likely is the woman?', optionA: 'A receptionist', optionB: 'A manager', optionC: 'A technician', optionD: 'A client', correctOption: 'A' },
                                { question: 'What does the man offer to do?', optionA: 'Leave a message', optionB: 'Call back later', optionC: 'Wait in the lobby', optionD: 'Send an email', correctOption: 'C' },
                                { question: 'Where are the speakers?', optionA: 'In a bank', optionB: 'In a store', optionC: 'In a restaurant', optionD: 'In a clinic', correctOption: 'D', audioUrl: '/audio/part3-2.mp3' },
                                { question: 'What is the problem?', optionA: 'A machine is broken', optionB: 'An appointment is delayed', optionC: 'A form is missing', optionD: 'A payment is late', correctOption: 'B' },
                                { question: 'What will the woman probably do next?', optionA: 'Fill out paperwork', optionB: 'Talk to the doctor', optionC: 'Reschedule', optionD: 'Read a magazine', correctOption: 'D' },
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log("Done!");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
});
