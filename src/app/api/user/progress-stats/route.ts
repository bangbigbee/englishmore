import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Vocabulary stats
    const userTags = await prisma.vocabularyTag.findMany({
      where: { userId },
      select: { isLearned: true, isHard: true, isBookmarked: true, updatedAt: true }
    })

    let vocabLearned = 0, vocabHard = 0, vocabBookmarked = 0
    const activityMap: Record<string, number> = {}

    userTags.forEach(tag => {
      if (tag.isLearned) vocabLearned++
      if (tag.isHard) vocabHard++
      if (tag.isBookmarked) vocabBookmarked++

      const day = tag.updatedAt.toISOString().split('T')[0];
      activityMap[day] = (activityMap[day] || 0) + 1;
    })

    // Generate last 14 days for Heatmap
    const heatMapDays = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      heatMapDays.push({
        date: ds,
        dayLabel: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: activityMap[ds] || 0
      });
    }

    const totalWords = await (prisma as any).vocabularyItem.count({
      where: { category: 'TOEIC', isActive: true }
    })

    // Quiz answers for grammar, reading, listening, actual-test
    const answers = await prisma.toeicAnswer.findMany({
      where: { userId },
      include: { question: { include: { lesson: { include: { topic: true } } } } }
    })

    const quizStats = {
      grammar: { correct: 0, incorrect: 0, total: 0 },
      reading: { correct: 0, incorrect: 0, total: 0 },
      listening: { correct: 0, incorrect: 0, total: 0 },
      'actual-test': { correct: 0, incorrect: 0, total: 0 }
    }

    answers.forEach(a => {
      const type = a.question?.lesson?.topic?.type
      let key = 'grammar'
      if (type === 'READING') key = 'reading'
      else if (type === 'LISTENING') key = 'listening'
      else if (type === 'ACTUAL_TEST') key = 'actual-test'
      else if (type !== 'GRAMMAR') return

      const bucket = quizStats[key as keyof typeof quizStats]
      bucket.total++
      if (a.isCorrect) bucket.correct++
      else bucket.incorrect++
    })

    return NextResponse.json({
      vocabulary: {
        learned: vocabLearned,
        hard: vocabHard,
        bookmarked: vocabBookmarked,
        total: totalWords,
        completionRate: totalWords > 0 ? Math.round((vocabLearned / totalWords) * 100) : 0,
        heatmap: heatMapDays
      },
      grammar: quizStats.grammar,
      reading: quizStats.reading,
      listening: quizStats.listening,
      actualTest: quizStats['actual-test']
    })
  } catch (error) {
    console.error('Error fetching user progress stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
