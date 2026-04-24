import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // @ts-ignore
        const questions = await prisma.toeicPlacementQuestion.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(questions);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // @ts-ignore
        const question = await prisma.toeicPlacementQuestion.create({
            data: {
                order: body.order || 1,
                part: body.part || 5,
                question: body.question,
                optionA: body.optionA,
                optionB: body.optionB,
                optionC: body.optionC,
                optionD: body.optionD,
                correctOption: body.correctOption,
                audioUrl: body.audioUrl,
                imageUrl: body.imageUrl,
                passage: body.passage
            }
        });
        return NextResponse.json(question);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        // @ts-ignore
        const question = await prisma.toeicPlacementQuestion.update({
            where: { id },
            data
        });
        return NextResponse.json(question);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        // @ts-ignore
        await prisma.toeicPlacementQuestion.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
