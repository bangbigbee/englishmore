import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const topics = await prisma.toeicGrammarTopic.findMany({
      include: {
        _count: {
          select: { lessons: true }
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
