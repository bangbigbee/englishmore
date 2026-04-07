import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sanitizeFilename(raw: string) {
  return raw.replace(/[^a-zA-Z0-9._-]/g, '')
}

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename } = await context.params
  const safeName = sanitizeFilename(filename)
  if (!safeName) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const audioUrl = `/api/exercises/audio/${safeName}`

  if (session.user.role !== 'admin') {
    const activeEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      },
      select: {
        courseId: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!activeEnrollment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const linkedExercise = await prisma.courseExercise.findFirst({
      where: {
        courseId: activeEnrollment.courseId,
        isDraft: false,
        audioFileUrl: audioUrl
      },
      select: { id: true }
    })

    if (!linkedExercise) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const audioFile = await prisma.exerciseAudioFile.findUnique({
    where: { id: safeName },
    select: {
      mimeType: true,
      data: true,
      originalName: true
    }
  })

  if (!audioFile) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const payload = new Uint8Array(audioFile.data)

  return new NextResponse(payload, {
    headers: {
      'Content-Type': audioFile.mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${sanitizeFilename(audioFile.originalName) || 'exercise-audio'}"`,
      'Cache-Control': 'private, max-age=60'
    }
  })
}