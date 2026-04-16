import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { lessonId, questions } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'questions array is required and must not be empty' }, { status: 400 })
    }

    // Use a transaction for bulk creation
    const createdQuestions = await prisma.$transaction(
      questions.map((q: any) =>
        prisma.toeicQuestion.create({
          data: {
            lessonId,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD || null,
            correctOption: q.correctOption,
            explanation: q.explanation || null,
            translation: q.translation || null,
            tips: q.tips || null,
            vocabulary: q.vocabulary && q.vocabulary.length > 0 ? q.vocabulary : null
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions
    })
  } catch (error) {
    console.error('Error batch creating TOEIC questions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
