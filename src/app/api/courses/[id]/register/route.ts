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

  const body = await request.json().catch(() => ({})) as { referrer?: string }
  const referralInput = String(body?.referrer || '').trim()

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

  // Check if user already has ANY active enrollment (not just pending - checking pending, active, completed, suspended)
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      status: {
        in: ['pending', 'active', 'completed', 'suspended']
      }
    },
    include: { course: true }
  })
  if (existingEnrollment) {
    return NextResponse.json({
      error: 'Bạn đã đăng ký một khóa học rồi. Vui lòng liên hệ giáo viên để trao đổi thêm.'
    }, { status: 409 })
  }

  let referrerUserId: string | null = null
  if (referralInput) {
    const normalizedReferralEmail = referralInput.toLowerCase()
    const referrerByEmail = await prisma.user.findUnique({
      where: { email: normalizedReferralEmail },
      select: { id: true, email: true }
    })

    const referrerByStudentId = referrerByEmail
      ? null
      : await prisma.enrollment.findFirst({
          where: { studentId: referralInput },
          select: { userId: true, user: { select: { email: true } } }
        })

    referrerUserId = referrerByEmail?.id || referrerByStudentId?.userId || null

    if (!referrerUserId) {
      return NextResponse.json({ error: 'Referrer not found. Please enter a valid student ID or email, or leave it blank.' }, { status: 400 })
    }

    if (referrerUserId === currentUser.id) {
      return NextResponse.json({ error: 'You cannot refer yourself.' }, { status: 400 })
    }
  }

  const courseCodePart = (course.code || course.id)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8)
  const userCodePart = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-6)
  const nonce = Date.now().toString().slice(-4)
  const referenceCode = `EM${courseCodePart}${userCodePart}${nonce}`
  const transferAmount = course.price > 0 ? course.price : 3800000

  // Generate unique 6-digit student ID
  let studentId = ''
  let isUnique = false
  let attempts = 0
  while (!isUnique && attempts < 10) {
    studentId = Math.floor(100000 + Math.random() * 900000).toString()
    const existing = await prisma.enrollment.findFirst({ where: { studentId } })
    if (!existing) {
      isUnique = true
    }
    attempts++
  }

  if (!isUnique) {
    return NextResponse.json({ error: 'Failed to generate student ID. Please try again.' }, { status: 500 })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      courseId,
      userId,
      status: 'pending',
      referenceCode,
      studentId
    }
  })

  if (referrerUserId) {
    await prisma.user.update({
      where: { id: userId },
      data: { referrerId: referrerUserId }
    })
  }

  // Promote user to member after course registration and defaults to PRO tier
  if (currentUser.role === 'user' || currentUser.tier === 'FREE') {
    await prisma.user.update({
      where: { id: userId },
      data: { 
         role: currentUser.role === 'user' ? 'member' : undefined,
         tier: currentUser.tier === 'FREE' ? 'PRO' : undefined
      }
    })
  }

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