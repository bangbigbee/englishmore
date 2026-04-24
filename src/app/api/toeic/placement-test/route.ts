import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Get all active sets
        const activeSets = await prisma.toeicPlacementSet.findMany({
            where: { isActive: true },
            select: { id: true }
        });

        if (activeSets.length === 0) {
            return NextResponse.json({ success: false, parts: [] });
        }

        const activeSetIds = activeSets.map(s => s.id);

        // Fetch all questions from all active sets
        // @ts-ignore
        const allQuestions = await prisma.toeicPlacementQuestion.findMany({
            where: { setId: { in: activeSetIds } }
        });

        // Separate into levels
        const beginnerQs = allQuestions.filter((q: any) => q.category.toLowerCase().includes('beginner'));
        const intermediateQs = allQuestions.filter((q: any) => q.category.toLowerCase().includes('intermediate'));
        const advancedQs = allQuestions.filter((q: any) => q.category.toLowerCase().includes('advanced'));

        // Helper to shuffle and pick N
        const pickRandom = (arr: any[], n: number) => {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, n);
        };

        // If there are not enough questions of a level, it will just take all it has
        const selectedQuestions = [
            ...pickRandom(beginnerQs, 6),
            ...pickRandom(intermediateQs, 2),
            ...pickRandom(advancedQs, 2)
        ];

        // Shuffle the final selection to mix them up (optional, but good)
        // Re-assign order 1 to 10
        const finalQuestions = selectedQuestions
            // .sort(() => 0.5 - Math.random()) // Uncomment to shuffle mixed levels
            .map((q: any, idx: number) => {
                const { correctOption, createdAt, updatedAt, ...cleanQ } = q;
                cleanQ.order = idx + 1; // force order 1 to 10
                return cleanQ;
            });

        return NextResponse.json({
            success: true,
            title: "Bài Test Đánh Giá Năng Lực Đầu Vào",
            parts: [{
                category: "Mixed",
                questions: finalQuestions
            }]
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
