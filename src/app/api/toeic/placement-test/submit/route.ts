import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { answers } = body;
        
        // Fetch all correct answers from active set
        const activeSet = await prisma.toeicPlacementSet.findFirst({
            where: { isActive: true }
        });

        if (!activeSet) {
            return NextResponse.json({ error: 'Không tìm thấy bộ đề' }, { status: 400 });
        }

        // @ts-ignore
        const questions = await prisma.toeicPlacementQuestion.findMany({
            where: { setId: activeSet.id }
        });
        
        let correctAnswersCount = 0;
        
        questions.forEach((q: any) => {
            if (answers[q.order] === q.correctOption) {
                correctAnswersCount++;
            }
        });
        
        const total = questions.length;
        const percentage = total > 0 ? (correctAnswersCount / total) : 0;
        
        let level = 'BEGINNER';
        if (percentage >= 0.8) {
            level = 'ADVANCED';
        } else if (percentage >= 0.4) {
            level = 'INTERMEDIATE';
        }

        return NextResponse.json({
            success: true,
            totalCorrect: correctAnswersCount,
            totalQuestions: total,
            level
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
