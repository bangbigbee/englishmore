import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const typeFilter = searchParams.get('type') || 'GRAMMAR'

    const topics = await prisma.toeicGrammarTopic.findMany({
      where: { type: typeFilter },
      include: {
        _count: {
          select: { lessons: true }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            accessTier: true,
            _count: {
              select: { questions: true }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching toeic topics:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
