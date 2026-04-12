import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params
    
    // Validate id format to prevent basic errors
    if (!id || typeof id !== 'string') {
      return new NextResponse('Invalid ID', { status: 400 })
    }

    const image = await prisma.landingGalleryImage.findUnique({
      where: { id },
      select: { mimeType: true, data: true, isActive: true },
    })

    if (!image || !image.data) {
      return new NextResponse('Not found', { status: 404 })
    }

    // You might want to allow serving inactive images only to admins, 
    // but for simplicity, we serve it if it exists since the ID is a long CUID and hard to guess.
    
    // Add caching headers
    const headers = new Headers()
    headers.set('Content-Type', image.mimeType || 'application/octet-stream')
    // Cache for 1 year since the content won't change for a given CUID, 
    // if replaced, a new upload creates a new CUID.
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    const payload = new Uint8Array(image.data)
    
    // Support Range request for video
    const range = request.headers.get('range')
    if (range && image.mimeType?.startsWith('video/')) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : payload.length - 1
      const chunksize = (end - start) + 1
      
      headers.set('Content-Range', `bytes ${start}-${end}/${payload.length}`)
      headers.set('Accept-Ranges', 'bytes')
      headers.set('Content-Length', chunksize.toString())
      return new NextResponse(payload.slice(start, end + 1), {
        status: 206,
        headers,
      })
    }

    headers.set('Content-Length', payload.length.toString())
    return new NextResponse(payload, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error serving gallery image', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
