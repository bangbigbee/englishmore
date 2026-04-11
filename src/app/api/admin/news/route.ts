import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: {
      role: true
    }
  })
  if (!user || user.role !== 'admin') {
    return { status: 403, body: { error: 'Forbidden' } }
  }

  return { status: 200, session }
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  const news = await prisma.landingNews.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(news)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  try {
    const body = await request.json()
    const { title, description, imageUrl, linkUrl, isActive } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const news = await prisma.landingNews.create({
      data: {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
