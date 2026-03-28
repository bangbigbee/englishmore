import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') {
    return { status: 403, body: { error: 'Forbidden' } }
  }

  return { status: 200, session }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  const { id } = await context.params
  const body = await request.json()
  const { title, description, registrationDeadline, isPublished } = body

  const data: {
    title?: string
    description?: string | null
    registrationDeadline?: Date
    isPublished?: boolean
  } = {}

  if (title !== undefined) {
    const normalizedTitle = String(title).trim()
    if (!normalizedTitle) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    data.title = normalizedTitle
  }

  if (description !== undefined) {
    const normalizedDescription = String(description).trim()
    data.description = normalizedDescription || null
  }

  if (registrationDeadline !== undefined) {
    const parsedDate = new Date(registrationDeadline)
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid registration deadline' }, { status: 400 })
    }
    data.registrationDeadline = parsedDate
  }

  if (isPublished !== undefined) {
    if (typeof isPublished !== 'boolean') {
      return NextResponse.json({ error: 'isPublished must be a boolean' }, { status: 400 })
    }
    data.isPublished = isPublished
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const updatedCourse = await prisma.course.update({
      where: { id },
      data,
      include: {
        enrollments: {
          include: { user: true }
        }
      }
    })

    return NextResponse.json(updatedCourse)
  } catch {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }
}
