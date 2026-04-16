import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    // Ensure order is a number if provided
    if (body.order !== undefined) {
      body.order = Number(body.order)
    }

    // If they send empty string for tiers, it means they want to fallback to master config
    if (body.theoryAccessTier === '' || body.explanationAccessTier === '' || body.translationAccessTier === '' || body.bookmarkAccessTier === '') {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
      const master = setting?.value as any
      const masterGrammar = master?.grammar || {}
      
      const currentLesson = await prisma.toeicGrammarLesson.findUnique({ where: { id: id }, include: { topic: true } })
      const isReading = currentLesson?.topic?.type === 'READING'
      const defaultBookmarkAccessTier = isReading 
        ? (masterGrammar.readingBookmarkAccessTier || 'PRO') 
        : (masterGrammar.grammarBookmarkAccessTier || 'PRO')

      if (body.theoryAccessTier === '') body.theoryAccessTier = masterGrammar.theoryAccessTier || 'FREE'
      if (body.explanationAccessTier === '') body.explanationAccessTier = masterGrammar.explanationAccessTier || 'FREE'
      if (body.translationAccessTier === '') body.translationAccessTier = masterGrammar.translationAccessTier || 'FREE'
      if (body.bookmarkAccessTier === '') body.bookmarkAccessTier = defaultBookmarkAccessTier
    }

		const lesson = await prisma.toeicGrammarLesson.update({
			where: { id: id },
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
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const session = await getServerSession(authOptions)
		if (!session || session.user.role !== 'admin') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		await prisma.toeicGrammarLesson.delete({
			where: { id: id }
		})

		return NextResponse.json({ message: 'Deleted successfully' })
	} catch (error) {
		console.error('Error deleting TOEIC lesson:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
