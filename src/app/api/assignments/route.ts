import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description } = await request.json()
  if (!title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const assignment = await prisma.assignment.create({
    data: {
      userId: session.user.id,
      title,
      description: description || '',
      method: 'homework'
    }
  })

  return NextResponse.json({ message: 'Assignment submitted', assignment })
}