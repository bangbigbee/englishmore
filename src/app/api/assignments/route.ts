import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (currentUser.role === 'admin') {
    return NextResponse.json({ error: 'Tài khoản admin không được nộp bài tập' }, { status: 403 })
  }

  const { homeworkId, description } = await request.json()
  const note = typeof description === 'string' ? description.trim() : ''
  if (!homeworkId) {
    return NextResponse.json({ error: 'homeworkId is required' }, { status: 400 })
  }

  if (!note) {
    return NextResponse.json({ error: 'Ghi chú không được để trống' }, { status: 400 })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      status: 'active'
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!activeEnrollment) {
    return NextResponse.json({ error: 'Bạn chưa có khóa học đang hoạt động' }, { status: 400 })
  }

  const homework = await prisma.courseHomework.findUnique({ where: { id: homeworkId } })
  if (!homework || homework.courseId !== activeEnrollment.courseId) {
    return NextResponse.json({ error: 'Bài tập không hợp lệ với khóa học của bạn' }, { status: 400 })
  }

  const assignment = await prisma.homeworkSubmission.upsert({
    where: {
      homeworkId_userId: {
        homeworkId,
        userId: session.user.id
      }
    },
    create: {
      homeworkId,
      userId: session.user.id,
      note
    },
    update: {
      note,
      submittedAt: new Date()
    }
  })

  return NextResponse.json({ message: 'Assignment submitted', assignment })
}