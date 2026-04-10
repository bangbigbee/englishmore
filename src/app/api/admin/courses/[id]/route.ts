import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
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
  const { 
    title, description, shortDescription, registrationDeadline, isPublished, maxStudents, 
    completedSessions, price, currency,
    sebDiscountPercent, ebDiscountPercent, sebThresholdDays, ebThresholdDays 
  } = body

  const data: {
    title?: string
    description?: string | null
    shortDescription?: string | null
    price?: number
    currency?: string
    registrationDeadline?: Date
    isPublished?: boolean
    maxStudents?: number
    completedSessions?: number
    sebDiscountPercent?: number
    ebDiscountPercent?: number
    sebThresholdDays?: number
    ebThresholdDays?: number
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

  if (shortDescription !== undefined) {
    const normalizedShortDescription = String(shortDescription).trim()
    data.shortDescription = normalizedShortDescription || null
  }

  if (price !== undefined) {
    const parsedPrice = Number(price)
    if (!Number.isInteger(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a non-negative integer' }, { status: 400 })
    }
    data.price = parsedPrice
  }

  if (currency !== undefined) {
    const normalizedCurrency = String(currency).trim().toUpperCase()
    if (!normalizedCurrency) {
      return NextResponse.json({ error: 'Currency is required when provided' }, { status: 400 })
    }
    data.currency = normalizedCurrency
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

  if (maxStudents !== undefined) {
    const parsedMaxStudents = Number(maxStudents)
    if (!Number.isInteger(parsedMaxStudents) || parsedMaxStudents < 1 || parsedMaxStudents > 10) {
      return NextResponse.json({ error: 'Seat count must be an integer between 1 and 10' }, { status: 400 })
    }
    data.maxStudents = parsedMaxStudents
  }

  if (completedSessions !== undefined) {
    const parsedCompletedSessions = Number(completedSessions)
    if (!Number.isInteger(parsedCompletedSessions) || parsedCompletedSessions < 0 || parsedCompletedSessions > 30) {
      return NextResponse.json({ error: 'Course progress must be an integer between 0 and 30' }, { status: 400 })
    }
    data.completedSessions = parsedCompletedSessions
  }

  if (sebDiscountPercent !== undefined) data.sebDiscountPercent = Number(sebDiscountPercent)
  if (ebDiscountPercent !== undefined) data.ebDiscountPercent = Number(ebDiscountPercent)
  if (sebThresholdDays !== undefined) data.sebThresholdDays = Number(sebThresholdDays)
  if (ebThresholdDays !== undefined) data.ebThresholdDays = Number(ebThresholdDays)

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
