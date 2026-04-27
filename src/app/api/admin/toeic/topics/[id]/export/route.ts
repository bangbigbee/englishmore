import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx'

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const topic = await prisma.toeicGrammarTopic.findUnique({
			where: { id },
			include: {
				lessons: {
					include: {
						questions: {
							orderBy: { createdAt: 'asc' }
						}
					},
					orderBy: { order: 'asc' }
				}
			}
		})

		if (!topic) {
			return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
		}

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: `Chủ đề: ${topic.title} - Level: ${topic.level || 'Cơ Bản'}`,
                            heading: HeadingLevel.TITLE,
                            spacing: { after: 400 },
                        }),
                        ...topic.lessons.flatMap((lesson, index) => {
                            const lessonTitle = new Paragraph({
                                text: `Bài ${index + 1}: ${lesson.title}`,
                                heading: HeadingLevel.HEADING_1,
                                spacing: { before: 400, after: 200 },
                            });

                            const questions = lesson.questions.flatMap((q, qIndex) => {
                                return [
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: `Câu ${qIndex + 1}: `, bold: true }),
                                            new TextRun({ text: q.question || '' }),
                                        ],
                                        spacing: { before: 200 },
                                    }),
                                    new Paragraph({ text: `A. ${q.optionA}` }),
                                    new Paragraph({ text: `B. ${q.optionB}` }),
                                    new Paragraph({ text: `C. ${q.optionC}` }),
                                    q.optionD ? new Paragraph({ text: `D. ${q.optionD}` }) : null,
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: 'Đáp án: ', bold: true, color: '008000' }),
                                            new TextRun({ text: q.correctOption, color: '008000', bold: true }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: 'Giải thích: ', bold: true, color: '0000FF' }),
                                            new TextRun({ text: q.explanation || '', color: '0000FF' }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: 'Dịch nghĩa: ', bold: true, color: '666666' }),
                                            new TextRun({ text: q.translation || '', color: '666666' }),
                                        ],
                                        spacing: { after: 200 },
                                    }),
                                ].filter(Boolean) as Paragraph[];
                            });

                            return [lessonTitle, ...questions];
                        }),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'Content-Disposition': `attachment; filename="Topic_${topic.slug}.docx"`,
			},
		})
	} catch (error) {
		console.error('Error exporting topic:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
