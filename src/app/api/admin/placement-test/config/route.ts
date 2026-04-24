import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

const DEFAULT_CONFIG = {
    difficulty: {
        BEGINNER: { beginner: 8, intermediate: 5, advanced: 2 },
        INTERMEDIATE: { beginner: 6, intermediate: 5, advanced: 4 },
        ADVANCED: { beginner: 4, intermediate: 5, advanced: 6 }
    },
    skill: {
        listening: 5,
        reading: 7,
        image: 3
    }
};

export async function GET(req: NextRequest) {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'PLACEMENT_TEST_CONFIG' }
        });
        if (setting) {
            return NextResponse.json({ success: true, config: setting.value });
        }
        return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        await prisma.systemSetting.upsert({
            where: { key: 'PLACEMENT_TEST_CONFIG' },
            update: { value: body.config as any },
            create: { key: 'PLACEMENT_TEST_CONFIG', value: body.config as any, description: 'Cấu hình thuật toán sinh đề Placement Test' }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
