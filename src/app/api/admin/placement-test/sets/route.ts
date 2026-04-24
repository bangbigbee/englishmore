import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const sets = await prisma.toeicPlacementSet.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        });
        return NextResponse.json(sets);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description } = body;
        
        // If it's the first set, make it active
        const count = await prisma.toeicPlacementSet.count();
        const isActive = count === 0;

        const set = await prisma.toeicPlacementSet.create({
            data: {
                title,
                description,
                isActive
            }
        });
        return NextResponse.json(set);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, title, description, isActive } = body;

        const set = await prisma.toeicPlacementSet.update({
            where: { id },
            data: { title, description, isActive }
        });
        return NextResponse.json(set);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        await prisma.toeicPlacementSet.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
