import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { driveLink, sessionNumber } = body
    const { id: lectureNoteId } = await context.params

    // Check if lecture note exists
    const lectureNote = await prisma.lectureNote.findUnique({
      where: { id: lectureNoteId }
    })

    if (!lectureNote) {
      return NextResponse.json({ error: 'Lecture note not found' }, { status: 404 })
    }

    const parsedSessionNumber = Number(sessionNumber)
    if (!Number.isInteger(parsedSessionNumber) || parsedSessionNumber < 1 || parsedSessionNumber > 30) {
      return NextResponse.json({ error: 'sessionNumber must be between 1 and 30' }, { status: 400 })
    }

    const duplicateSession = await prisma.lectureNote.findFirst({
      where: {
        courseId: lectureNote.courseId,
        sessionNumber: parsedSessionNumber,
        id: { not: lectureNoteId }
      }
    })

    if (duplicateSession) {
      return NextResponse.json({ error: 'Session already exists for this course' }, { status: 409 })
    }

    // Update lecture note
    const updated = await prisma.lectureNote.update({
      where: { id: lectureNoteId },
      data: {
        sessionNumber: parsedSessionNumber,
        driveLink: driveLink || null
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating lecture note:', error)
    return NextResponse.json({ error: 'Failed to update lecture note' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: lectureNoteId } = await context.params

    // Check if lecture note exists
    const lectureNote = await prisma.lectureNote.findUnique({
      where: { id: lectureNoteId }
    })

    if (!lectureNote) {
      return NextResponse.json({ error: 'Lecture note not found' }, { status: 404 })
    }

    // Delete lecture note
    await prisma.lectureNote.delete({
      where: { id: lectureNoteId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lecture note:', error)
    return NextResponse.json({ error: 'Failed to delete lecture note' }, { status: 500 })
  }
}
