import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
    try {
        const resolvedParams = await params;
        const testId = resolvedParams.testId; // format: ets-2024-test-01
        
        // This is a naive parsing. In production you might want a better ID mapping or DB table.
        // Assuming testId = "ets-2024-test-01" -> collectionName="ets 2024", lessonTitle="Test 01"
        const parts = testId.split('-');
        if (parts.length < 3) return NextResponse.json({ error: 'Invalid test id' }, { status: 400 });

        const testNum = parts.pop();   // "01"
        const testText = parts.pop();  // "test"
        const collection = parts.join(' ').toUpperCase(); // "ETS 2024"
        const lessonTitle = `${testText!.charAt(0).toUpperCase() + testText!.slice(1)} ${testNum}`; // "Test 01"

        const topics = await prisma.toeicGrammarTopic.findMany({
            where: { title: { contains: collection.replace(' ', '') } }, // Need to match ETS2024, ETS 2024 etc.
            include: {
                lessons: {
                    where: { title: lessonTitle },
                    include: {
                        questions: {
                            orderBy: { id: 'asc' } // Questions are usually ordered. Or order implicitly.
                        }
                    }
                }
            }
        });

        const testData: any[] = [];
        topics.forEach(topic => {
            if (topic.lessons.length > 0) {
                testData.push({
                    part: topic.part,
                    topicId: topic.id,
                    lessonId: topic.lessons[0].id,
                    questions: topic.lessons[0].questions
                });
            }
        });

        testData.sort((a, b) => (a.part || 0) - (b.part || 0));

        return NextResponse.json({
            id: testId,
            collection,
            title: lessonTitle,
            parts: testData,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
