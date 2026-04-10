import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const topic = await prisma.toeicGrammarTopic.findUnique({
      where: { slug },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            questions: true,
            _count: {
              select: { questions: true }
            }
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(topic)
  } catch (error) {
    console.error('Error fetching toeic topic:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
