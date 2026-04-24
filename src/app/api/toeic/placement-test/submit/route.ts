import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { answers, totalQuestions } = body;
        
        // Extract question IDs from answers
        const questionIds = Object.keys(answers);
        
        // Fetch all correct answers from the database for these specific questions
        // @ts-ignore
        const questions = await prisma.toeicPlacementQuestion.findMany({
            where: { id: { in: questionIds } }
        });
        
        let correctAnswersCount = 0;
        
        questions.forEach((q: any) => {
            if (answers[q.id] === q.correctOption) {
                correctAnswersCount++;
            }
        });
        
        const total = totalQuestions || 10;
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
