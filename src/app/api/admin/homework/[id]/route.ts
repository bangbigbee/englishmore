import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await request.json()
  const { courseId, title, description, attachmentUrl, dueDate } = body

  const data: {
    courseId?: string
    title?: string
    description?: string | null
    attachmentUrl?: string | null
    dueDate?: Date
  } = {}

  if (courseId !== undefined) data.courseId = String(courseId)
  if (title !== undefined) {
    const normalizedTitle = String(title).trim()
    if (!normalizedTitle) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    data.title = normalizedTitle
  }
  if (description !== undefined) {
    const normalizedDescription = String(description).trim()
    data.description = normalizedDescription || null
  }
  if (attachmentUrl !== undefined) {
    const normalizedUrl = String(attachmentUrl).trim()
    data.attachmentUrl = normalizedUrl || null
  }
  if (dueDate !== undefined) {
    const parsedDueDate = new Date(dueDate)
    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
    }
    data.dueDate = parsedDueDate
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const homework = await prisma.courseHomework.update({
      where: { id },
      data,
      include: {
        course: { select: { title: true } },
        _count: { select: { submissions: true } }
      }
    })

    return NextResponse.json(homework)
  } catch {
    return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params

  try {
    await prisma.courseHomework.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
  }
}
