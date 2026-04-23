import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { calculateToeicListeningScore, calculateToeicReadingScore } from '@/lib/toeicScoring';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
    try {
        const resolvedParams = await params;
        const testId = resolvedParams.testId;
        const session = await getServerSession();

        // Removed early 401 return
        const body = await req.json();
        const { answers, isActual, initialTimeSeconds, timeLeft } = body;

        const duration = initialTimeSeconds - timeLeft;

        // Fetch questions to grade
        const topics = await prisma.toeicGrammarTopic.findMany({
            where: { title: { contains: 'ETS' } },
            include: {
                lessons: {
                    include: {
                        questions: {
                            orderBy: { id: 'asc' }
                        }
                    }
                }
            }
        });

        const testData: any[] = [];
        let matchedCollection = 'N/A';
        let matchedTitle = 'N/A';

        topics.forEach(topic => {
            const collectionMatch = topic.title.match(/(ETS)\s*(\d{4})/i);
            const collectionName = collectionMatch ? `${collectionMatch[1].toUpperCase()} ${collectionMatch[2]}` : 'Other';
            
            topic.lessons.forEach(lesson => {
                const lessonTitle = lesson.title.trim();
                const id = `${collectionName}-${lessonTitle}`.replace(/\s+/g, '-').toLowerCase();
                
                if (id === testId) {
                    matchedCollection = collectionName;
                    matchedTitle = lessonTitle;
                    
                    testData.push({
                        part: topic.part,
                        questions: lesson.questions
                    });
                }
            });
        });

        testData.sort((a, b) => (a.part || 0) - (b.part || 0));

        let listeningCorrect = 0;
        let readingCorrect = 0;
        let totalCorrect = 0;
        let hasListening = false;
        let hasReading = false;
        
        let partStats: Record<string, { correct: number, total: number }> = {};
        
        testData.forEach(partInfo => {
            const partKey = `part${partInfo.part}`;
            partStats[partKey] = { correct: 0, total: partInfo.questions.length };

            if (partInfo.part >= 1 && partInfo.part <= 4) hasListening = true;
            if (partInfo.part >= 5 && partInfo.part <= 7) hasReading = true;

            const getPartStartNumber = (part: number) => {
                switch (part) {
                    case 1: return 1; case 2: return 7; case 3: return 32; case 4: return 71;
                    case 5: return 101; case 6: return 131; case 7: return 147; default: return 1;
                }
            };
            const startNumber = getPartStartNumber(partInfo.part);
            
            partInfo.questions.forEach((q: any, qIdx: number) => {
                const qNum = startNumber + qIdx;
                const userAns = answers[String(qNum)] || answers[qNum];
                if (userAns && userAns === q.correctOption) {
                    totalCorrect++;
                    partStats[partKey].correct++;
                    if (partInfo.part >= 1 && partInfo.part <= 4) {
                        listeningCorrect++;
                    } else if (partInfo.part >= 5 && partInfo.part <= 7) {
                        readingCorrect++;
                    }
                }
            });
        });

        const totalQuestionsSubmitted = testData.reduce((acc: number, p: any) => acc + p.questions.length, 0);
        let scoreListening = null;
        let scoreReading = null;

        if (isActual) {
            if (hasListening) scoreListening = calculateToeicListeningScore(listeningCorrect);
            if (hasReading) scoreReading = calculateToeicReadingScore(readingCorrect);
        }

        if (!session || !session.user) {
            return NextResponse.json({ 
                success: true, 
                requiresLogin: true, 
                totalCorrect, 
                scoreListening, 
                scoreReading,
                promptMessage: "Hệ thống đã tính điểm cho bạn. Tuy nhiên, bạn cần Đăng Nhập để lưu lại kết quả này vào Lịch sử thi!"
            });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Save detailed answers to ToeicAnswer table for Mistake tab tracking
        const answerDataList: any[] = [];
        const answeredQuestionIds: string[] = [];

        testData.forEach(partInfo => {
            const getPartStartNumber = (part: number) => {
                switch (part) {
                    case 1: return 1; case 2: return 7; case 3: return 32; case 4: return 71;
                    case 5: return 101; case 6: return 131; case 7: return 147; default: return 1;
                }
            };
            const startNumber = getPartStartNumber(partInfo.part);
            
            partInfo.questions.forEach((q: any, qIdx: number) => {
                const qNum = startNumber + qIdx;
                const userAns = answers[String(qNum)] || answers[qNum];
                if (userAns) {
                    answeredQuestionIds.push(q.id);
                    answerDataList.push({
                        userId: user.id,
                        questionId: q.id,
                        selectedOption: userAns,
                        isCorrect: userAns === q.correctOption,
                    });
                }
            });
        });

        if (answeredQuestionIds.length > 0) {
            await prisma.toeicAnswer.deleteMany({
                where: {
                    userId: user.id,
                    questionId: { in: answeredQuestionIds }
                }
            });
            await prisma.toeicAnswer.createMany({
                data: answerDataList
            });
        }

        const record = await prisma.toeicTestRecord.create({
            data: {
                userId: user.id,
                testId: testId,
                title: `${matchedCollection} - ${matchedTitle}`,
                mode: isActual ? 'actual' : 'practice',
                totalTimeStart: initialTimeSeconds,
                totalTimeEnd: timeLeft,
                duration: duration > 0 ? duration : 0,
                scoreListening: scoreListening,
                scoreReading: scoreReading,
                correctAnswers: totalCorrect,
                totalQuestions: totalQuestionsSubmitted,
                answersData: answers,
                partStats: partStats,
            }
        });

        let awardedStars = 0;
        let starReason = "";
        
        // Award stars for completing the test
        if (user.role === 'member' || user.tier === 'PRO' || user.tier === 'ULTRA') {
             const { awardToeicStars, TOEIC_STAR_KEYS } = await import('@/lib/toeicStars');
             const dateStr = new Date().toISOString().split('T')[0];
             
             const result = await awardToeicStars({
                 userId: user.id,
                 activityKey: TOEIC_STAR_KEYS.actualTestComplete,
                 referenceKey: `TOEIC_ACTUAL_TEST_${testId}_${user.id}_${dateStr}` // 1 per test per day
             });
             
             if (result.awardedStars > 0) {
                 awardedStars += result.awardedStars;
                 starReason = `Chúc mừng bạn đã hoàn thành bài thi! Nhận ${result.awardedStars} ⭐.`;
             }
        }
        
        // Referral Program: Process PENDING referrals upon meaningful action (completing a test)
        if (user.toeicReferrerId && user.toeicReferralStatus === 'PENDING') {
            const startOfToday = new Date()
            startOfToday.setHours(0, 0, 0, 0)
            
            // Check Chốt chặn 4: Daily cap (Max 5 rewards per referrer per day)
            const todayActiveReferrals = await prisma.user.count({
                where: {
                    toeicReferrerId: user.toeicReferrerId,
                    toeicReferralStatus: 'ACTIVE',
                    updatedAt: { gte: startOfToday }
                }
            })

            if (todayActiveReferrals >= 5) {
                // Flag for Admin Review if daily cap is exceeded
                await prisma.user.update({
                    where: { id: user.id },
                    data: { toeicReferralStatus: 'REVIEW' }
                })
            } else {
                // Reward both Referrer and Referee
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: user.id },
                        data: {
                            toeicReferralStatus: 'ACTIVE',
                            toeicStars: { increment: 50 } // Reward Referee
                        }
                    }),
                    prisma.user.update({
                        where: { id: user.toeicReferrerId },
                        data: {
                            toeicStars: { increment: 100 } // Reward Referrer
                        }
                    })
                ])
                awardedStars += 50;
                starReason = starReason 
                    ? `${starReason} + 50⭐ (Thưởng Đăng Ký Giới Thiệu)` 
                    : `Thưởng 50⭐ vì đã đăng ký qua link giới thiệu và làm bài test đầu tiên!`;
            }
        }

        return NextResponse.json({ success: true, recordId: record.id, awardedStars, starReason });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
