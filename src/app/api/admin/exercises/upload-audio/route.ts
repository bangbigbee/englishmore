import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm'
}

// Keep under serverless payload limits on deployment platforms.
const MAX_SIZE = 4 * 1024 * 1024

function getExtensionFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (!ext) return null

  const allowedExts = new Set(['mp3', 'm4a', 'wav', 'ogg', 'webm'])
  return allowedExts.has(ext) ? ext : null
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
      return NextResponse.json({ error: 'Unsupported audio type. Allowed: MP3, M4A, WAV, OGG, WEBM.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File audio quá lớn. Vui lòng dùng file tối đa 4MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const saved = await prisma.exerciseAudioFile.create({
      data: {
        originalName: file.name || `exercise-audio.${ext}`,
        mimeType: file.type || 'application/octet-stream',
        data: buffer
      },
      select: { id: true, originalName: true }
    })

    return NextResponse.json({
      url: `/api/exercises/audio/${saved.id}`,
      fileName: saved.originalName
    })
  } catch (error) {
    console.error('[Exercise Audio Upload] Error:', error)
    const detail = error instanceof Error ? error.message : String(error)
    if (detail.includes('FUNCTION_PAYLOAD_TOO_LARGE') || detail.includes('Payload Too Large')) {
      return NextResponse.json({ error: 'File audio vượt quá giới hạn upload của hệ thống. Vui lòng giảm kích thước xuống <= 4MB.' }, { status: 413 })
    }
    return NextResponse.json({ error: 'Failed to upload audio file', details: detail }, { status: 500 })
  }
}