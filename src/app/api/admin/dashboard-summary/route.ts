import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const fixedCourseBreakdown = [
  { courseNumber: 1, title: 'Khóa 1', studentCount: 7, status: 'closed' },
  { courseNumber: 2, title: 'Khóa 2', studentCount: 8, status: 'closed' },
  { courseNumber: 3, title: 'Khóa 3', studentCount: 8, status: 'closed' },
  { courseNumber: 4, title: 'Khóa 4', studentCount: 8, status: 'closed' },
  { courseNumber: 5, title: 'Khóa 5', studentCount: 0, status: 'recruiting' },
  { courseNumber: 6, title: 'Khóa 6', studentCount: 0, status: 'recruiting' }
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const totalUsers = await prisma.user.count()
  const totalStudents = fixedCourseBreakdown.reduce((sum, item) => sum + item.studentCount, 0)

  return NextResponse.json({
    totalUsers,
    totalStudents,
    courseBreakdown: fixedCourseBreakdown
  })
}
