import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
    try {
        const resolvedParams = await params;
        const testId = resolvedParams.testId;
        const session = await getServerSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const body = await req.json();
        const { answers, isActual, initialTimeSeconds, timeLeft } = body;

        const duration = initialTimeSeconds - timeLeft;

        // Grade logic would go here. For now we just save.
        const record = await prisma.toeicTestRecord.create({
            data: {
                userId: user.id,
                testId: testId,
                mode: isActual ? 'actual' : 'practice',
                totalTimeStart: initialTimeSeconds,
                totalTimeEnd: timeLeft,
                duration: duration > 0 ? duration : 0,
                correctAnswers: 0,
                totalQuestions: Object.keys(answers).length,
                answersData: answers,
            }
        });

        return NextResponse.json({ success: true, recordId: record.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
