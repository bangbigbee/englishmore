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

        // Group by part to match the expected format for the frontend
        const groupedParts: Record<number, any> = {};
        questions.forEach((q: any) => {
            if (!groupedParts[q.part]) {
                groupedParts[q.part] = {
                    part: q.part,
                    questions: []
                };
            }
            // Add a clean copy without correctOption for the frontend to take test
            const { correctOption, createdAt, updatedAt, ...cleanQ } = q;
            groupedParts[q.part].questions.push(cleanQ);
        });
        
        const parts = Object.values(groupedParts).sort((a: any, b: any) => a.part - b.part);

        return NextResponse.json({
            success: true,
            title: "Bài Test Đánh Giá Năng Lực Đầu Vào",
            parts
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
