import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Khóa học này đã đạt số lượng tối đa. Vui lòng chọn khóa học khác.' }, { status: 400 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId: session.user?.id as string } }
  })

  if (existing) {
    return NextResponse.json({ error: 'Bạn đã đăng ký khóa học này trước đó', enrollment: existing }, { status: 409 })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      courseId,
      userId: session.user?.id as string,
      status: 'pending'
    }
  })

  // Update user role to student if they were a member
  await prisma.user.updateMany({
    where: { id: session.user?.id as string, role: 'member' },
    data: { role: 'student' }
  })

  return NextResponse.json({ message: 'Đăng ký thành công. Vui lòng chuyển khoản 4,000,000 VND vào TK Techcombank Nguyễn Trí Bằng', enrollment })
}