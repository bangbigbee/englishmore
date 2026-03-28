import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user?.id as string }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all users with their assignment count
    const students = await prisma.user.findMany({
      where: {
        role: 'user' // Only get regular users, not admins
      },
      select: {
        id: true,
        name: true,
        email: true,
        method: true,
        createdAt: true,
        _count: {
          select: { assignments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format response
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      method: student.method,
      assignmentCount: student._count.assignments,
      createdAt: student.createdAt
    }))

    return NextResponse.json(formattedStudents)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
