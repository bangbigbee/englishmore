import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ACTIVITY_POINT_KEYS, awardActivityPoints } from '@/lib/activityPoints'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const { wordId } = await request.json()

    if (!wordId || typeof wordId !== 'string') {
      return NextResponse.json({ error: 'Invalid wordId' }, { status: 400 })
    }

    // Award Activity Points for vocabulary pronunciation mastery
    // The reference key ensures they only get points ONCE per word per user
    const awardResult = await awardActivityPoints({
      userId,
      activityKey: ACTIVITY_POINT_KEYS.vocabPronunciation,
      referenceKey: `vocab_pronunciation:${wordId}:${userId}`
    })

    return NextResponse.json({
      success: true,
      awardedAp: awardResult.awardedAp,
      totalAp: awardResult.totalAp
    })

  } catch (error) {
    console.error('Error awarding vocab pronunciation AP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
