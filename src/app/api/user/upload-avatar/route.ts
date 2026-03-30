import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, GIF, WebP allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = file.type.split('/')[1] || 'jpg'
    const fileName = `${crypto.randomBytes(8).toString('hex')}_${Date.now()}.${ext}`
    
    // Use public/uploads/avatars - standard Next.js location for public files
    const baseDir = process.cwd()
    const uploadsDir = path.join(baseDir, 'public', 'uploads', 'avatars')
    
    try {
      // Ensure directory exists
      await mkdir(uploadsDir, { recursive: true })
    } catch (mkdirError) {
      console.error('[Avatar Upload] Error creating directory:', uploadsDir, mkdirError)
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 })
    }

    const filePath = path.join(uploadsDir, fileName)
    
    try {
      await writeFile(filePath, buffer)
      console.log('[Avatar Upload] File saved successfully:', filePath)
    } catch (writeError) {
      console.error('[Avatar Upload] Error writing file:', filePath, writeError)
      return NextResponse.json({ error: 'Failed to save file to disk' }, { status: 500 })
    }

    const url = `/uploads/avatars/${fileName}`
    console.log('[Avatar Upload] Upload successful, URL:', url)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[Avatar Upload] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to upload avatar', details: String(error) }, { status: 500 })
  }
}
