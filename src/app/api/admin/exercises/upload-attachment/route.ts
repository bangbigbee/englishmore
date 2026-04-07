import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES: Record<string, string> = {
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/pdf': 'pdf'
}

const ALLOWED_EXTS = new Set(['pptx', 'ppt', 'docx', 'doc', 'pdf'])

const MAX_SIZE = 50 * 1024 * 1024

function getExtensionFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return ALLOWED_EXTS.has(ext) ? ext : null
}

async function requireAdminUser() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  if (session.user.role === 'admin') {
    return { ok: true as const, status: 200, error: '' }
  }

  return { ok: false as const, status: 403, error: 'Forbidden' }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminUser()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const extByMime = ALLOWED_TYPES[file.type]
    const extByName = getExtensionFromName(file.name || '')
    const ext = extByMime || extByName
    if (!ext) {
      return NextResponse.json({ error: 'Unsupported file type. Allowed: PPTX, PPT, DOCX, DOC, PDF.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const saved = await prisma.exerciseAttachmentFile.create({
      data: {
        originalName: file.name || `exercise-attachment.${ext}`,
        mimeType: file.type || 'application/octet-stream',
        data: buffer
      },
      select: { id: true, originalName: true }
    })

    return NextResponse.json({
      url: `/api/exercises/attachment/${saved.id}`,
      fileName: saved.originalName
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not upload attachment file.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
