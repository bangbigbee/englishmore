import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const body = await request.json()
    const { answers } = body

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    // Process each answer (Upsert)
    // We do them individually or in a transaction. Upsert in a loop is safer for unique constraints but slow.
    // However, for a small number of questions (10-30), it's fine.
    const results = await Promise.all(
      answers.map((ans: any) =>
        prisma.toeicAnswer.upsert({
          where: {
            userId_questionId: {
              userId,
              questionId: ans.questionId
            }
          },
          create: {
            userId,
            questionId: ans.questionId,
            selectedOption: ans.selectedOption,
            isCorrect: ans.isCorrect
          },
          update: {
            selectedOption: ans.selectedOption,
            isCorrect: ans.isCorrect,
            updatedAt: new Date()
          }
        })
      )
    )

    // After sync, we don't necessarily need to trigger AP here immediately 
    // because the user will likely answer one more question or reload to trigger the check.
    // But for a better experience, we can check completion for all unique lessons affected.
    
    return NextResponse.json({
      success: true,
      count: results.length
    })
  } catch (error) {
    console.error('Error syncing TOEIC progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
