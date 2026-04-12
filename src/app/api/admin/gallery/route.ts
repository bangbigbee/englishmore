import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

async function requireAdminUser() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Forbidden' }
  }
  return { ok: true as const, status: 200, error: '' }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminUser()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const images = await prisma.landingGalleryImage.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        originalName: true,
        displayOrder: true,
        isActive: true,
        createdAt: true,
        courseId: true,
        course: { select: { title: true, galleryAnimation: true } }
      }
    })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminUser()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    const courseId = formData.get('courseId') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const savedImages = []

    for (const file of files) {
      const ext = ALLOWED_TYPES[file.type]
      if (!ext) continue

      if (file.size > MAX_SIZE) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const saved = await prisma.landingGalleryImage.create({
        data: {
          originalName: file.name || `image.${ext}`,
          mimeType: file.type || 'application/octet-stream',
          data: buffer,
          courseId: courseId || null,
        },
        select: { id: true }
      })
      savedImages.push(saved)
    }

    return NextResponse.json({ success: true, count: savedImages.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
