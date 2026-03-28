import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is already admin
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user?.id as string }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can perform this action' }, { status: 403 })
    }

    const body = await request.json()
    const { targetEmail } = body

    if (!targetEmail) {
      return NextResponse.json({ error: 'targetEmail is required' }, { status: 400 })
    }

    const targetUser = await prisma.user.update({
      where: { email: targetEmail },
      data: { role: 'admin' },
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({
      message: 'User promoted to admin',
      user: targetUser
    })
  } catch (error) {
    console.error('Error promoting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
