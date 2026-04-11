import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const image = await prisma.courseReviewImage.findUnique({
      where: { id: params.id }
    })

    if (!image) {
      return new NextResponse('Not found', { status: 404 })
    }

    const payload = new Uint8Array(image.data)
    
    return new NextResponse(payload, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 })
  }
}
