import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteFileFromR2 } from '@/lib/r2'

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		const existingQuestion = await prisma.toeicQuestion.findUnique({ where: { id } })
		if (!existingQuestion) {
		    return NextResponse.json({ error: 'Not found' }, { status: 404 })
		}

		if (body.audioUrl && existingQuestion.audioUrl && body.audioUrl !== existingQuestion.audioUrl) {
		    await deleteFileFromR2(existingQuestion.audioUrl)
		}
		if (body.imageUrl && existingQuestion.imageUrl && body.imageUrl !== existingQuestion.imageUrl) {
		    await deleteFileFromR2(existingQuestion.imageUrl)
		}

		const question = await prisma.toeicQuestion.update({
			where: { id: id },
			data: body
		})

		return NextResponse.json(question)
	} catch (error) {
		console.error('Error updating TOEIC question:', error)
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

		const existingQuestion = await prisma.toeicQuestion.findUnique({ where: { id } })
		if (existingQuestion) {
		    if (existingQuestion.audioUrl) await deleteFileFromR2(existingQuestion.audioUrl)
		    if (existingQuestion.imageUrl) await deleteFileFromR2(existingQuestion.imageUrl)
		}

		await prisma.toeicQuestion.delete({
			where: { id: id }
		})

		return NextResponse.json({ message: 'Deleted successfully' })
	} catch (error) {
		console.error('Error deleting TOEIC question:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
