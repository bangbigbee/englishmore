import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const topic = await prisma.toeicGrammarTopic.update({
			where: { id: params.id },
			data: body
		})

		return NextResponse.json(topic)
	} catch (error) {
		console.error('Error updating TOEIC topic:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		await prisma.toeicGrammarTopic.delete({
			where: { id: id }
		})

		return NextResponse.json({ message: 'Deleted successfully' })
	} catch (error) {
		console.error('Error deleting TOEIC topic:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
