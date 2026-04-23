import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { role, tier } = session.user as any;
    
    // Only Members / PRO / ULTRA get Toeic Stars for daily login.
    if (role === 'member' || tier === 'PRO' || tier === 'ULTRA') {
        const { awardToeicStars, TOEIC_STAR_KEYS } = await import('@/lib/toeicStars');
        const dateStr = new Date().toISOString().split('T')[0];
        
        try {
            const result = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.dailyCheckin,
                referenceKey: `TOEIC_DAILY_LOGIN_${userId}_${dateStr}`
            });

            if (result.awardedStars > 0) {
                return NextResponse.json({ 
                    success: true, 
                    awardedStars: result.awardedStars,
                    awardReason: `Chào mừng trở lại! Bạn được thưởng ${result.awardedStars} ⭐.`
                });
            }
        } catch (error) {
            console.error('Error awarding daily login stars:', error);
            return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
        }
    }

    return NextResponse.json({ success: true, awardedStars: 0 });
}
