import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { awardToeicStars, TOEIC_STAR_KEYS } from '@/lib/toeicStars';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    if (type === 'sentence') {
      const result = await awardToeicStars({
        userId: session.user.id,
        activityKey: TOEIC_STAR_KEYS.dictationSentenceCorrect,
      });
      return NextResponse.json(result);
    } 
    else if (type === 'complete') {
      const result = await awardToeicStars({
        userId: session.user.id,
        activityKey: TOEIC_STAR_KEYS.dictationComplete,
      });
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('Dictation reward error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
