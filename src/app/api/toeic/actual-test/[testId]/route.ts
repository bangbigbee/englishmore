import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
    try {
        const resolvedParams = await params;
        const testId = resolvedParams.testId; // format: ets-2024-test-01
        
        const topics = await prisma.toeicGrammarTopic.findMany({
            where: { title: { contains: 'ETS' } },
            include: {
                lessons: {
                    include: {
                        questions: {
                            orderBy: { id: 'asc' }
                        }
                    }
                }
            }
        });

        const testData: any[] = [];
        let matchedCollection = 'N/A';
        let matchedTitle = 'N/A';

        topics.forEach(topic => {
            const collectionMatch = topic.title.match(/(ETS)\s*(\d{4})/i);
            const collectionName = collectionMatch ? `${collectionMatch[1].toUpperCase()} ${collectionMatch[2]}` : 'Other';
            
            topic.lessons.forEach(lesson => {
                const lessonTitle = lesson.title.trim();
                const id = `${collectionName}-${lessonTitle}`.replace(/\s+/g, '-').toLowerCase();
                
                if (id === testId) {
                    matchedCollection = collectionName;
                    matchedTitle = lessonTitle;
                    
                    testData.push({
                        part: topic.part,
                        topicId: topic.id,
                        lessonId: lesson.id,
                        questions: lesson.questions
                    });
                }
            });
        });

        testData.sort((a, b) => (a.part || 0) - (b.part || 0));

        return NextResponse.json({
            id: testId,
            collection: matchedCollection,
            title: matchedTitle,
            parts: testData,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
