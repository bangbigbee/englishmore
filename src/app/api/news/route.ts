import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const news = await prisma.landingNews.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching landing news:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
