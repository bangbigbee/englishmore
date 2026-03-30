import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { enrollments: true },
    orderBy: { createdAt: 'desc' }
  })

  const formatted = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    registrationDeadline: course.registrationDeadline,
    isPublished: course.isPublished,
    createdAt: course.createdAt,
    maxStudents: course.maxStudents,
    enrolledCount: course.enrollments.length,
    pendingCount: course.enrollments.filter(e => e.status === 'pending').length,
     successfulCount: course.enrollments.filter(e => e.status === 'active').length
  }))

  return NextResponse.json(formatted)
}