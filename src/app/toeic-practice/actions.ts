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
