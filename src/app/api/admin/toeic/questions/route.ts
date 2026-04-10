import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const lessonId = searchParams.get('lessonId')

		if (!lessonId) {
			return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
		}

		const questions = await prisma.toeicQuestion.findMany({
			where: { lessonId },
			orderBy: { createdAt: 'asc' }
		})

		return NextResponse.json(questions)
	} catch (error) {
		console.error('Error fetching TOEIC questions:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { lessonId, question, optionA, optionB, optionC, optionD, correctOption, explanation } = body

		if (!lessonId || !question || !optionA || !optionB || !optionC || !correctOption) {
			return NextResponse.json({ error: 'lessonId, question, options A, B, C and correctOption are required' }, { status: 400 })
		}

		const createdQuestion = await prisma.toeicQuestion.create({
			data: {
				lessonId,
				question,
				optionA,
				optionB,
				optionC,
				optionD,
				correctOption,
				explanation
			}
		})

		return NextResponse.json(createdQuestion)
	} catch (error) {
		console.error('Error creating TOEIC question:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
