import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { toeicLevel, toeicTarget } = body

    if (!toeicLevel) {
      return NextResponse.json({ error: 'Missing level' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        toeicLevel,
        toeicTarget: toeicTarget ? parseInt(toeicTarget) : null
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
