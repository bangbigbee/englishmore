import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

const prisma = new PrismaClient();

// Proposed Format:
// [Grammar]
// Câu 1: The ______ of the new policy will take effect next month.
// A) implement
// B) implementation
// C) implemented
// D) implements
// Đáp án: B

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const setId = formData.get('setId') as string;

        if (!file || !setId) {
            return NextResponse.json({ error: 'Missing file or setId' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert DOCX to raw text
        const result = await mammoth.extractRawText({ buffer });
        let text = result.value;

        // Clean up text
        text = text.replace(/\r/g, '');
        // Force newlines before options and answers if they were written on the same line
        text = text.replace(/(?:\s+)?([A-D][\)\.])\s+/g, '\n$1 ');
        text = text.replace(/(?:\s+)?(Đáp án[:\.])/ig, '\n$1');
        
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        const questions: any[] = [];
        let currentCategory = 'Grammar';
        let currentQ: any = null;
        let order = 1;

        for (const line of lines) {
            if (line.match(/^\[(.*)\]/i)) {
                const match = line.match(/^\[(.*)\]/i);
                if (match) currentCategory = match[1].trim();
                continue;
            }

            // Match "Câu 1: ..." or "Câu 1. ..."
            const qMatch = line.match(/^Câu\s*(\d+)[:\.]\s*(.*)/i) || line.match(/^(\d+)[\.\:]\s*(.*)/);
            if (qMatch) {
                if (currentQ) {
                    questions.push(currentQ);
                }
                currentQ = {
                    setId,
                    order: order++,
                    category: currentCategory,
                    question: qMatch[2] || "Điền vào chỗ trống",
                    optionA: '',
                    optionB: '',
                    optionC: '',
                    optionD: '',
                    correctOption: 'A',
                    passage: ''
                };
                continue;
            }

            if (line.match(/^Đoạn văn[:\.]\s*(.*)/i)) {
                if (currentQ) {
                    currentQ.passage = line.replace(/^Đoạn văn[:\.]\s*/i, '') + '\n';
                }
                continue;
            }

            if (line.match(/^[A-D][\)\.]/i)) {
                if (!currentQ) continue;
                const optMatch = line.match(/^([A-D])[\)\.]\s*(.*)/i);
                if (optMatch) {
                    const optKey = `option${optMatch[1].toUpperCase()}` as keyof typeof currentQ;
                    currentQ[optKey] = optMatch[2];
                }
                continue;
            }

            if (line.match(/^Đáp án[:\.]\s*([A-D])/i)) {
                if (!currentQ) continue;
                const ansMatch = line.match(/^Đáp án[:\.]\s*([A-D])/i);
                if (ansMatch) {
                    currentQ.correctOption = ansMatch[1].toUpperCase();
                }
                continue;
            }

            // If we are here and currentQ has passage but not options yet, it might be a multi-line passage
            if (currentQ && !currentQ.optionA && !currentQ.question.includes('?')) {
                currentQ.question += ' ' + line;
            }
        }

        if (currentQ) {
            questions.push(currentQ);
        }

        if (questions.length === 0) {
            return NextResponse.json({ error: 'Không tìm thấy câu hỏi nào. Vui lòng kiểm tra lại định dạng file DOCX.' }, { status: 400 });
        }

        // Save to DB
        // @ts-ignore
        await prisma.toeicPlacementQuestion.createMany({
            data: questions
        });

        return NextResponse.json({ success: true, count: questions.length });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
