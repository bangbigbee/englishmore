import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sanitizeFilename(raw: string) {
  return raw.replace(/[^a-zA-Z0-9._-]/g, '')
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const file = await prisma.userAvatarFile.findUnique({
    where: { id },
    select: { originalName: true, mimeType: true, data: true }
  })

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const payload = new Uint8Array(file.data)
  const safeName = sanitizeFilename(file.originalName) || 'avatar.jpg'

  return new NextResponse(payload, {
    headers: {
      'Content-Type': file.mimeType || 'image/jpeg',
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
