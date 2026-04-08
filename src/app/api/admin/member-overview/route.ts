import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    where: { role: 'user' },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const activeEnrollments = await prisma.enrollment.findMany({
    where: { status: 'active' },
    include: {
      user: {
        select: { id: true, name: true, phone: true, email: true }
      },
      course: {
        select: { id: true, title: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const members = await Promise.all(
    activeEnrollments.map(async (enrollment) => {
      const [totalHomework, submittedHomework] = await Promise.all([
        prisma.courseHomework.count({ where: { courseId: enrollment.courseId } }),
        prisma.homeworkSubmission.count({
          where: {
            userId: enrollment.userId,
            homework: { courseId: enrollment.courseId }
          }
        })
      ])

      return {
        id: enrollment.user.id,
        name: enrollment.user.name,
        phone: enrollment.user.phone,
        email: enrollment.user.email,
        registeredAt: enrollment.createdAt,
        courseTitle: enrollment.course.title,
        isPaid: enrollment.isPaid,
        submittedHomework,
        totalHomework
      }
    })
  )

  return NextResponse.json({ users, members })
}
