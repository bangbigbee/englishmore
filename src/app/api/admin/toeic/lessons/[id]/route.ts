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
    // Ensure order is a number if provided
    if (body.order !== undefined) {
      body.order = Number(body.order)
    }

		const lesson = await prisma.toeicGrammarLesson.update({
			where: { id: params.id },
			data: body
		})

		return NextResponse.json(lesson)
	} catch (error) {
		console.error('Error updating TOEIC lesson:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		await prisma.toeicGrammarLesson.delete({
			where: { id: params.id }
		})

		return NextResponse.json({ message: 'Deleted successfully' })
	} catch (error) {
		console.error('Error deleting TOEIC lesson:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
