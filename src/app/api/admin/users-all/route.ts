import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user?.id as string }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true }
    })

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
