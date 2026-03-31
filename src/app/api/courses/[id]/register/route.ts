import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (currentUser.role === 'admin') {
    return NextResponse.json({ error: 'Admin accounts cannot register for courses' }, { status: 403 })
  }

  const { id: courseId } = await context.params
  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { enrollments: true }
  })

  if (!course || !course.isPublished) {
    return NextResponse.json({ error: 'Course not found or not published' }, { status: 404 })
  }

  // Check capacity
  if (course.enrollments.length >= course.maxStudents) {
    return NextResponse.json({ error: 'This course is already full. Please choose another course.' }, { status: 400 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user?.id as string } }
  })

  if (existing) {
    return NextResponse.json({ error: 'You have already registered for this course', enrollment: existing }, { status: 409 })
  }

  const userId = session.user?.id as string

  // Block if user already has a pending enrollment for any course
  const pendingEnrollment = await prisma.enrollment.findFirst({
    where: { userId, status: 'pending' }
  })
  if (pendingEnrollment) {
    return NextResponse.json({
      error: 'You already have a pending enrollment. Please wait for admin confirmation before registering for a new course.'
    }, { status: 409 })
  }

  const courseCodePart = (course.code || course.id)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8)
  const userCodePart = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-6)
  const nonce = Date.now().toString().slice(-4)
  const referenceCode = `EM${courseCodePart}${userCodePart}${nonce}`
  const transferAmount = 3800000

  const enrollment = await prisma.enrollment.create({
    data: {
      courseId,
      userId,
      status: 'pending',
      referenceCode
    }
  })

  // Promote user to member after course registration
  await prisma.user.updateMany({
    where: { id: userId, role: 'user' },
    data: { role: 'member' }
  })

  return NextResponse.json({
    message: 'Please use the transfer details below so the admin can confirm your tuition payment.',
    enrollment,
    paymentInstruction: {
      bankName: 'Techcombank',
      accountNumber: '19033113602011',
      accountName: 'Nguyen Tri Bang',
      amount: transferAmount,
      transferContent: 'Your Full Name - Phone Number'
    }
  })
}