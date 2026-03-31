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

export async function GET() {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  const courses = await prisma.course.findMany({
    include: {
      enrollments: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(courses)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  const body = await request.json()
  const { title, description, registrationDeadline, maxStudents } = body

  if (!title || !registrationDeadline) {
    return NextResponse.json({ error: 'Title and registrationDeadline are required' }, { status: 400 })
  }

  const parsedMaxStudents = Number(maxStudents ?? 10)
  if (!Number.isInteger(parsedMaxStudents) || parsedMaxStudents < 1 || parsedMaxStudents > 10) {
    return NextResponse.json({ error: 'Seat count must be an integer between 1 and 10' }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: {
      title,
      description: description || null,
      registrationDeadline: new Date(registrationDeadline),
      maxStudents: parsedMaxStudents,
      isPublished: true
    }
  })

  return NextResponse.json(course, { status: 201 })
}