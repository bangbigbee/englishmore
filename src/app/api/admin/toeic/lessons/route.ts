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
		const topicId = searchParams.get('topicId')

		if (!topicId) {
			return NextResponse.json({ error: 'topicId is required' }, { status: 400 })
		}

		const lessons = await prisma.toeicGrammarLesson.findMany({
			where: { topicId },
			include: {
				_count: {
					select: { questions: true }
				}
			},
			orderBy: { order: 'asc' }
		})

		return NextResponse.json(lessons)
	} catch (error) {
		console.error('Error fetching TOEIC lessons:', error)
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
		const { topicId, title, order, content } = body

		if (!topicId || !title || order === undefined) {
			return NextResponse.json({ error: 'topicId, title, and order are required' }, { status: 400 })
		}

		const lesson = await prisma.toeicGrammarLesson.create({
			data: {
				topicId,
				title,
				order: Number(order),
				content
			}
		})

		return NextResponse.json(lesson)
	} catch (error) {
		console.error('Error creating TOEIC lesson:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
