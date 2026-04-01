import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import os from 'os'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'video/mp4': 'mp4',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

function getExtensionFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (!ext) return null

  const allowedExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp3', 'm4a', 'wav', 'ogg', 'webm', 'mp4', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'])
  return allowedExts.has(ext) ? ext : null
}

async function requireAdminUser() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  // Prefer role from session token to avoid extra DB call in upload route.
  if (session.user.role === 'admin') {
    return { ok: true as const, status: 200, error: '' }
  }

  return { ok: false as const, status: 403, error: 'Forbidden' }
}

async function saveFileInFirstWritableDir(fileName: string, buffer: Buffer) {
  const preferredDir = process.env.HOMEWORK_UPLOAD_DIR
  const publicDir = path.join(process.cwd(), 'public', 'uploads', 'homework')
  const tempDir = path.join(os.tmpdir(), 'englishmore', 'uploads', 'homework')

  const candidates = [preferredDir, publicDir, tempDir].filter((dir): dir is string => Boolean(dir))
  let lastError: unknown = null

  for (const dir of candidates) {
    try {
      await mkdir(dir, { recursive: true })
      const fullPath = path.join(dir, fileName)
      await writeFile(fullPath, buffer)

      if (dir === publicDir) {
        return { url: `/uploads/homework/${fileName}` }
      }

      return { url: `/api/homework/files/${fileName}` }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('No writable upload directory available')
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
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: images, audio, PDF, Word, PowerPoint, Excel.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 20 MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = `${crypto.randomBytes(10).toString('hex')}_${Date.now()}.${ext}`
    const saved = await saveFileInFirstWritableDir(safeName, buffer)

    return NextResponse.json({ url: saved.url })
  } catch (error) {
    console.error('[Homework Upload] Error:', error)
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Failed to upload file', details: detail }, { status: 500 })
  }
}
