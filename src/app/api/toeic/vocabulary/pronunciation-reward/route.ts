import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { awardToeicStars, TOEIC_STAR_KEYS } from '@/lib/toeicStars';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const isGuest = !session || !session.user || session.user.role === 'guest';

        const body = await req.json();
        const { wordId, streak, isTopicComplete } = body;

        if (!wordId) {
            return NextResponse.json({ success: false, message: 'Missing wordId' }, { status: 400 });
        }

        let totalAwardedStars = 0;
        let reasons: string[] = [];
        
        // Fetch rules to get the messages regardless of limits
        const { prisma } = await import('@/lib/prisma');
        const rules = await prisma.toeicStarRule.findMany({
            where: {
                activityKey: {
                    in: [
                        TOEIC_STAR_KEYS.pronunciationCorrect,
                        TOEIC_STAR_KEYS.pronunciationStreak3,
                        TOEIC_STAR_KEYS.pronunciationStreak5,
                        TOEIC_STAR_KEYS.pronunciationStreak10,
                        TOEIC_STAR_KEYS.pronunciationTopicComplete
                    ]
                }
            }
        });
        
        const getRuleMsg = (key: string) => {
            const rule = rules.find(r => r.activityKey === key);
            return rule?.toastMessage || rule?.label || 'Tuyệt vời!';
        };

        if (isGuest) {
            // For guests, we just return the messages without awarding stars in DB
            if (streak === 1) reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationCorrect));
            if (streak === 3) reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationStreak3));
            if (streak === 5) reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationStreak5));
            if (streak === 10) reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationStreak10));
            if (isTopicComplete) reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationTopicComplete));
            
            return NextResponse.json({
                success: true,
                awardedStars: 0,
                awardReason: reasons.join(' | ')
            });
        }

        const userId = session!.user.id;

        // 1. Base rule: 1 correct pronunciation = 1 star
        const baseResult = await awardToeicStars({
            userId,
            activityKey: TOEIC_STAR_KEYS.pronunciationCorrect,
            referenceKey: `pronunciation_${wordId}_${new Date().toISOString().split('T')[0]}` // Daily limit per word
        });
        if (baseResult.awardedStars > 0) {
            totalAwardedStars += baseResult.awardedStars;
            if (baseResult.reason) reasons.push(baseResult.reason);
        } else if (streak === 1 || streak === 2 || streak === 4 || streak > 5) {
            // If no stars awarded (e.g. limit reached), still show the success message for correct pronunciation (unless it's a milestone streak)
            // Actually, we should always show the base message if no streak message is shown.
            if (![3, 5, 10].includes(streak) && !isTopicComplete) {
                 reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationCorrect));
            }
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
                if (streakResult.reason) reasons.push(streakResult.reason);
            } else {
                reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationStreak3));
            }
        } else if (streak === 5) {
            const streakResult = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.pronunciationStreak5,
                referenceKey: `pronunciation_streak_5_${new Date().getTime()}`
            });
            if (streakResult.awardedStars > 0) {
                totalAwardedStars += streakResult.awardedStars;
                if (streakResult.reason) reasons.push(streakResult.reason);
            } else {
                reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationStreak5));
            }
        } else if (streak === 10) {
            const streakResult = await awardToeicStars({
                userId,
                activityKey: TOEIC_STAR_KEYS.pronunciationStreak10,
                referenceKey: `pronunciation_streak_10_${new Date().getTime()}`
            });
            if (streakResult.awardedStars > 0) {
                totalAwardedStars += streakResult.awardedStars;
                if (streakResult.reason) reasons.push(streakResult.reason);
            } else {
                reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationStreak10));
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
                if (topicResult.reason) reasons.push(topicResult.reason);
            } else {
                reasons.push(getRuleMsg(TOEIC_STAR_KEYS.pronunciationTopicComplete));
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
