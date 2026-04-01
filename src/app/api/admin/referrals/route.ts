import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const referredUsers = await prisma.user.findMany({
    where: { referrerId: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      referrer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          enrollments: {
            where: { studentId: { not: null } },
            select: { studentId: true, course: { select: { title: true } } },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      },
      enrollments: {
        where: { studentId: { not: null } },
        select: { studentId: true, course: { select: { title: true } }, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const rows = referredUsers.map((item) => ({
    referredUserId: item.id,
    referredUserName: item.name,
    referredUserEmail: item.email,
    referredUserPhone: item.phone,
    referredStudentId: item.enrollments[0]?.studentId || null,
    referredCourseTitle: item.enrollments[0]?.course.title || null,
    referredStatus: item.enrollments[0]?.status || null,
    registeredAt: item.createdAt,
    referrerUserId: item.referrer?.id || null,
    referrerName: item.referrer?.name || null,
    referrerEmail: item.referrer?.email || null,
    referrerPhone: item.referrer?.phone || null,
    referrerStudentId: item.referrer?.enrollments[0]?.studentId || null,
    referrerCourseTitle: item.referrer?.enrollments[0]?.course.title || null
  }))

  const summary = {
    totalReferrals: rows.length,
    uniqueReferrers: new Set(rows.map((row) => row.referrerUserId).filter(Boolean)).size,
    referredMembers: rows.filter((row) => row.referredStudentId).length
  }

  return NextResponse.json({ summary, rows })
}
