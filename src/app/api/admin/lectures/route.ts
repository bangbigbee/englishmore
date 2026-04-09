import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const courseId = request.nextUrl.searchParams.get('courseId')
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    // Get all lecture notes for the course
    const lectureNotes = await prisma.lectureNote.findMany({
      where: { courseId },
      orderBy: { sessionNumber: 'asc' }
    })

    return NextResponse.json(lectureNotes)
  } catch (error) {
    console.error('Error fetching lecture notes:', error)
    return NextResponse.json({ error: 'Failed to fetch lecture notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { courseId, sessionNumber, driveLink, description } = body

    // Validate input
    if (!courseId || sessionNumber === undefined) {
      return NextResponse.json({ error: 'courseId and sessionNumber are required' }, { status: 400 })
    }

    if (sessionNumber < 1 || sessionNumber > 30) {
      return NextResponse.json({ error: 'sessionNumber must be between 1 and 30' }, { status: 400 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if lecture note already exists for this session
    const existing = await prisma.lectureNote.findUnique({
      where: {
        courseId_sessionNumber: {
          courseId,
          sessionNumber
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Lecture note already exists for this session' }, { status: 409 })
    }

    // Create lecture note
    const lectureNote = await prisma.lectureNote.create({
      data: {
        courseId,
        sessionNumber,
        driveLink: driveLink || null,
        description: description || null
      }
    })

    return NextResponse.json(lectureNote, { status: 201 })
  } catch (error) {
    console.error('Error creating lecture note:', error)
    return NextResponse.json({ error: 'Failed to create lecture note' }, { status: 500 })
  }
}
