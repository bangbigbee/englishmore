import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const [courses, homeworks] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, title: true, isPublished: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.courseHomework.findMany({
      include: {
        course: { select: { title: true } },
        _count: { select: { submissions: true } }
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
    })
  ])

  return NextResponse.json({ courses, homeworks })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const { courseId, title, description, attachmentUrl, dueDate } = body

  if (!courseId || !title || !dueDate) {
    return NextResponse.json({ error: 'courseId, title, dueDate are required' }, { status: 400 })
  }

  const parsedDueDate = new Date(dueDate)
  if (Number.isNaN(parsedDueDate.getTime())) {
    return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
  }

  const homework = await prisma.courseHomework.create({
    data: {
      courseId,
      title: String(title).trim(),
      description: String(description || '').trim() || null,
      attachmentUrl: String(attachmentUrl || '').trim() || null,
      dueDate: parsedDueDate
    },
    include: {
      course: { select: { title: true } },
      _count: { select: { submissions: true } }
    }
  })

  return NextResponse.json(homework, { status: 201 })
}
