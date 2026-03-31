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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const { id } = await context.params
  const body = await request.json()
  const teacherComment = typeof body.teacherComment === 'string' ? body.teacherComment.trim() : ''
  if (!teacherComment) {
    return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 })
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const submission = await tx.homeworkSubmission.update({
        where: { id },
        data: {
          teacherComment
        }
      })

      await tx.homeworkMessage.create({
        data: {
          submissionId: submission.id,
          senderRole: 'teacher',
          content: teacherComment
        }
      })

      return submission
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }
}
