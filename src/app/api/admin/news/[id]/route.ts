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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, imageUrl, linkUrl, isActive } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const news = await prisma.landingNews.update({
      where: { id },
      data: {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth.status !== 200) return NextResponse.json(auth.body, { status: auth.status })

  try {
    const { id } = await params
    await prisma.landingNews.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
