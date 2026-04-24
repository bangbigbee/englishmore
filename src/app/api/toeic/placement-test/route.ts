import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Get the active set
        const activeSet = await prisma.toeicPlacementSet.findFirst({
            where: { isActive: true }
        });

        if (!activeSet) {
            return NextResponse.json({ success: false, parts: [] });
        }

        // @ts-ignore
        const questions = await prisma.toeicPlacementQuestion.findMany({
            where: { setId: activeSet.id },
            orderBy: { order: 'asc' }
        });

        // Group by category to match the expected format for the frontend
        const groupedCategories: Record<string, any> = {};
        questions.forEach((q: any) => {
            const cat = q.category || 'Grammar';
            if (!groupedCategories[cat]) {
                groupedCategories[cat] = {
                    category: cat,
                    questions: []
                };
            }
            // Add a clean copy without correctOption for the frontend to take test
            const { correctOption, createdAt, updatedAt, ...cleanQ } = q;
            groupedCategories[cat].questions.push(cleanQ);
        });
        
        const parts = Object.values(groupedCategories);

        return NextResponse.json({
            success: true,
            title: "Bài Test Đánh Giá Năng Lực Đầu Vào",
            parts
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
