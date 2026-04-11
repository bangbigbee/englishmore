import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const image = await prisma.courseReviewImage.findUnique({
      where: { id: params.id }
    })

    if (!image) {
      return new NextResponse('Not found', { status: 404 })
    }

    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 })
  }
}
