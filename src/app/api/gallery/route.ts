import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const images = await prisma.landingGalleryImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true }
    })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
