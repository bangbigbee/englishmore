import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const reviews = await prisma.courseReviewImage.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, courseId: true, displayOrder: true, createdAt: true }
    })
    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
