'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getVocabularyBank(topic?: string, tagFilter?: string, query?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    let orClause: any[] = [];
    if (tagFilter === 'learned') orClause.push({ isLearned: true });
    else if (tagFilter === 'hard') orClause.push({ isHard: true });
    else if (tagFilter === 'bookmarked') orClause.push({ isBookmarked: true });
    else {
        orClause = [{ isLearned: true }, { isHard: true }, { isBookmarked: true }];
    }

    let whereClause: any = {
        userId: session.user.id,
        OR: orClause,
        ...(topic && { vocabulary: { topic: topic } }),
    };

    if (query) {
        whereClause.vocabulary = {
            ...whereClause.vocabulary,
            OR: [
                { word: { contains: query, mode: 'insensitive' } },
                { meaning: { contains: query, mode: 'insensitive' } }
            ]
        };
    }

    const tags = await prisma.vocabularyTag.findMany({
        where: whereClause,
        include: {
            vocabulary: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const allUserTags = await prisma.vocabularyTag.findMany({
        where: { userId: session.user.id, OR: [{ isLearned: true }, { isHard: true }, { isBookmarked: true }] },
        include: { vocabulary: { select: { topic: true } } }
    });
    const uniqueTopics = Array.from(new Set(allUserTags.map(t => t.vocabulary.topic))).sort();

    return { tags, uniqueTopics };
}

export async function getNotebookBank(type: string, filter: string, partFilter?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { items: [], records: [] };

    const isMistakes = filter === 'mistakes';
    const isHistory = filter === 'history';

    if (type === 'ACTUAL_TEST' && isHistory) {
        const records = await prisma.toeicTestRecord.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return { items: [], records };
    }

    let items = [];

    if (isMistakes) {
        items = await prisma.toeicAnswer.findMany({
            where: { 
                userId: session.user.id,
                isCorrect: false,
                question: {
                    lesson: {
                        topic: {
                            ...(type === 'ACTUAL_TEST' ? { title: { contains: 'ETS' } } : { type: type as any }),
                            ...(partFilter ? { part: { in: partFilter.split(',').map(Number).filter(n => !isNaN(n)) } } : {})
                        }
                    }
                }
            },
            include: {
                question: {
                    include: {
                        lesson: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 200
        });
    } else {
        items = await prisma.toeicQuestionBookmark.findMany({
            where: { 
                userId: session.user.id,
                question: {
                    lesson: {
                        topic: {
                            ...(type === 'ACTUAL_TEST' ? { title: { contains: 'ETS' } } : { type: type as any }),
                            ...(partFilter ? { part: { in: partFilter.split(',').map(Number).filter(n => !isNaN(n)) } } : {})
                        }
                    }
                }
            },
            include: {
                question: {
                    include: {
                        lesson: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        });
    }

    return { items, records: [] };
}
