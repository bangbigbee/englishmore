import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { awardToeicStars, TOEIC_STAR_KEYS } from '@/lib/toeicStars';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role === 'guest') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { wordId, streak, isTopicComplete } = body;

        if (!wordId) {
            return NextResponse.json({ success: false, message: 'Missing wordId' }, { status: 400 });
        }

        let totalAwardedStars = 0;
        let reasons: string[] = [];

        const userId = session.user.id;

        // 1. Base rule: 1 correct pronunciation = 1 star
        const baseResult = await awardToeicStars({
            userId,
            activityKey: TOEIC_STAR_KEYS.pronunciationCorrect,
            referenceKey: `pronunciation_${wordId}_${new Date().toISOString().split('T')[0]}` // Daily limit per word
        });
        if (baseResult.awardedStars > 0) {
            totalAwardedStars += baseResult.awardedStars;
            reasons.push(baseResult.reason || `Bạn phát âm tốt lắm. Phần thưởng của bạn là ${baseResult.awardedStars} Star.`);
        }

        // 2. Streak rules
        if (streak === 3) {
            const streakResult = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.pronunciationStreak3,
                referenceKey: `pronunciation_streak_3_${new Date().getTime()}`
            });
            if (streakResult.awardedStars > 0) {
                totalAwardedStars += streakResult.awardedStars;
                reasons.push(streakResult.reason || `Hot streak! 3 từ đúng liên tiếp (+${streakResult.awardedStars} ⭐)`);
            }
        } else if (streak === 5) {
            const streakResult = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.pronunciationStreak5,
                referenceKey: `pronunciation_streak_5_${new Date().getTime()}`
            });
            if (streakResult.awardedStars > 0) {
                totalAwardedStars += streakResult.awardedStars;
                reasons.push(streakResult.reason || `On fire! 5 từ đúng liên tiếp (+${streakResult.awardedStars} ⭐)`);
            }
        } else if (streak === 10) {
            const streakResult = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.pronunciationStreak10,
                referenceKey: `pronunciation_streak_10_${new Date().getTime()}`
            });
            if (streakResult.awardedStars > 0) {
                totalAwardedStars += streakResult.awardedStars;
                reasons.push(streakResult.reason || `Unstoppable! 10 từ đúng liên tiếp (+${streakResult.awardedStars} ⭐)`);
            }
        }

        // 3. Topic complete rule
        if (isTopicComplete) {
            const topicResult = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.pronunciationTopicComplete,
                referenceKey: `pronunciation_topic_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}`
            });
            if (topicResult.awardedStars > 0) {
                totalAwardedStars += topicResult.awardedStars;
                reasons.push(topicResult.reason || `Mastery! Hoàn thành xuất sắc chuyên mục (+${topicResult.awardedStars} ⭐)`);
            }
        }

        return NextResponse.json({
            success: true,
            awardedStars: totalAwardedStars,
            awardReason: reasons.join(' | ')
        });

    } catch (error) {
        console.error('Error in pronunciation reward:', error);
        return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
}
