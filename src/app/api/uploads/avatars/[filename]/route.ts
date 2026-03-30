import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const baseDir = process.cwd()
    const filePath = path.join(baseDir, 'uploads', 'avatars', filename)

    // Additional security check: ensure resolved path is within uploads directory
    const resolved = path.resolve(filePath)
    const uploadsDir = path.resolve(path.join(baseDir, 'uploads', 'avatars'))
    if (!resolved.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    try {
      const file = await readFile(filePath)
      
      // Determine content type from extension
      let contentType = 'image/jpeg'
      if (filename.endsWith('.png')) contentType = 'image/png'
      else if (filename.endsWith('.gif')) contentType = 'image/gif'
      else if (filename.endsWith('.webp')) contentType = 'image/webp'

      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error serving avatar:', error)
    return NextResponse.json({ error: 'Failed to serve avatar' }, { status: 500 })
  }
}
