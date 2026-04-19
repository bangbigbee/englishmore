import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteFileFromR2 } from '@/lib/r2'

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

		// Look up all questions
		const questions = await prisma.toeicQuestion.findMany({
			where: { lessonId: id }
		})

		// Clean up R2 media
		for (const q of questions) {
			if (q.audioUrl) await deleteFileFromR2(q.audioUrl);
			if (q.imageUrl) await deleteFileFromR2(q.imageUrl);
		}

		// Delete from DB
		await prisma.toeicQuestion.deleteMany({
			where: { lessonId: id }
		})

		return NextResponse.json({ message: 'Deleted all questions successfully' })
	} catch (error) {
		console.error('Error deleting TOEIC questions:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
