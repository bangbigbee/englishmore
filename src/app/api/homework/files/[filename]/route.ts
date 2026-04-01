import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'
import os from 'os'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

function sanitizeFilename(raw: string) {
  return raw.replace(/[^a-zA-Z0-9._-]/g, '')
}

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename } = await context.params
  const safeName = sanitizeFilename(filename)
  if (!safeName) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const baseName = path.basename(safeName)

  // Primary source: database-backed attachment storage (persistent across serverless instances).
  const dbFile = await prisma.homeworkAttachmentFile.findUnique({
    where: { id: baseName },
    select: { originalName: true, mimeType: true, data: true }
  })

  if (dbFile) {
    const payload = new Uint8Array(dbFile.data)
    const safeDownloadName = sanitizeFilename(dbFile.originalName) || 'attachment.bin'

    return new NextResponse(payload, {
      headers: {
        'Content-Type': dbFile.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeDownloadName}"`,
        'Cache-Control': 'private, max-age=60'
      }
    })
  }

  // Legacy fallback for old files that were stored on disk.
  const publicPath = path.join(process.cwd(), 'public', 'uploads', 'homework', baseName)
  const tempPath = path.join(os.tmpdir(), 'englishmore', 'uploads', 'homework', baseName)

  let buffer: Buffer | null = null
  try {
    buffer = await readFile(publicPath)
  } catch {
    try {
      buffer = await readFile(tempPath)
    } catch {
      // Compatibility path for legacy records that stored plain filenames.
      // If static hosting has the file, this redirect will resolve it.
      return NextResponse.redirect(new URL(`/uploads/homework/${baseName}`, _request.url), { status: 307 })
    }
  }

  const ext = baseName.split('.').pop()?.toLowerCase() || ''
  const contentType = MIME_BY_EXT[ext] || 'application/octet-stream'

  const payload = new Uint8Array(buffer)

  return new NextResponse(payload, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${baseName}"`,
      'Cache-Control': 'private, max-age=60'
    }
  })
}
