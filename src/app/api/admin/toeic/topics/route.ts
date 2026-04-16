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
		const typeFilter = searchParams.get('type') || 'GRAMMAR'

		const topics = await prisma.toeicGrammarTopic.findMany({
			where: { type: typeFilter },
			include: {
				_count: {
					select: { lessons: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return NextResponse.json(topics)
	} catch (error) {
		console.error('Error fetching TOEIC topics:', error)
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
		const { title, subtitle, slug, type } = body

		if (!title || !slug) {
			return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 })
		}

		const topic = await prisma.toeicGrammarTopic.create({
			data: {
				title,
				subtitle,
				slug,
				type: type || 'GRAMMAR'
			}
		})

		return NextResponse.json(topic)
	} catch (error) {
		console.error('Error creating TOEIC topic:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
