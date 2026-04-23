import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

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

    let progressMap: Record<string, { answered: number, correct: number }> = {};
    if (userId) {
       const lessonIds = topics.flatMap(t => t.lessons.map(l => l.id));
       const answers = await prisma.toeicAnswer.findMany({
         where: {
            userId: userId,
            question: { lessonId: { in: lessonIds } }
         },
         select: {
            isCorrect: true,
            question: { select: { lessonId: true } }
         }
       });
       
       answers.forEach(ans => {
         const lid = ans.question.lessonId;
         if (!progressMap[lid]) progressMap[lid] = { answered: 0, correct: 0 };
         progressMap[lid].answered += 1;
         if (ans.isCorrect) progressMap[lid].correct += 1;
       });
    }

    const enhancedTopics = topics.map(t => ({
       ...t,
       lessons: t.lessons.map(l => ({
          ...l,
          progress: progressMap[l.id] || null
       }))
    }));

    return NextResponse.json(enhancedTopics)
  } catch (error) {
    console.error('Error fetching toeic topics:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
