import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const topics = await prisma.toeicGrammarTopic.findMany({
            where: { title: { contains: 'ETS' } }, // Simple matcher for now
            include: {
                lessons: {
                    select: { id: true, title: true, order: true }
                }
            }
        });

        // Group by Collection (e.g. ETS 2024, ETS 2023)
        // Group by Lesson Title (e.g. Test 01)
        const collections: Record<string, Record<string, any>> = {};

        topics.forEach(topic => {
            const collectionMatch = topic.title.match(/(ETS)\s*(\d{4})/i);
            const collectionName = collectionMatch ? `${collectionMatch[1].toUpperCase()} ${collectionMatch[2]}` : 'Other';
            
            if (!collections[collectionName]) collections[collectionName] = {};

            topic.lessons.forEach(lesson => {
                const lessonTitle = lesson.title.trim();
                if (!collections[collectionName][lessonTitle]) {
                    collections[collectionName][lessonTitle] = {
                        id: `${collectionName}-${lessonTitle}`.replace(/\s+/g, '-').toLowerCase(),
                        title: lessonTitle,
                        collection: collectionName,
                        parts: []
                    };
                }
                collections[collectionName][lessonTitle].parts.push({
                    partId: topic.part,
                    lessonId: lesson.id,
                    topicId: topic.id
                });
            });
        });

        // Convert to array format
        const responseData = Object.keys(collections).map(col => ({
            collection: col,
            tests: Object.values(collections[col]).sort((a, b) => a.title.localeCompare(b.title))
        }));

        return NextResponse.json(responseData);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
