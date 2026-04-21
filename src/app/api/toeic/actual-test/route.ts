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
            const collectionMatch = topic.title.match(/(ETS\s*\d{4})/i);
            const collectionName = collectionMatch ? collectionMatch[1].replace(/\s/g, ' ') : 'Other'; // Normalize spaces
            
            if (!collections[collectionName]) collections[collectionName] = {};

            topic.lessons.forEach(lesson => {
                if (!collections[collectionName][lesson.title]) {
                    collections[collectionName][lesson.title] = {
                        id: `${collectionName}-${lesson.title}`.replace(/\s+/g, '-').toLowerCase(),
                        title: lesson.title,
                        collection: collectionName,
                        parts: []
                    };
                }
                collections[collectionName][lesson.title].parts.push({
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
