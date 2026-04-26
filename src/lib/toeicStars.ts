import { prisma } from '@/lib/prisma'

export const TOEIC_STAR_KEYS = {
  dailyCheckin: 'daily_checkin',
  streak3: 'streak_3',
  streak7: 'streak_7',
  streak30: 'streak_30',
  firstQuestion: 'first_question',
  correctStreak3: 'correct_streak_3',
  correctStreak5: 'correct_streak_5',
  correctStreak10: 'correct_streak_10',
  allCorrect: 'all_correct',
  completeGrammar: 'complete_grammar',
  completeVocab: 'complete_vocab',
  completePart: 'complete_part',
  bookmarkQuestion: 'bookmark_question',
  speedChallengePlay: 'speed_challenge_play',
  speedChallengeTop1: 'speed_challenge_top1',
  speedChallengeTop2: 'speed_challenge_top2',
  actualTestComplete: 'actual_test_complete',
  actualTestNewRecord: 'actual_test_new_record',
  // Pronunciation rules
  pronunciationCorrect: 'pronunciation_correct',
  pronunciationStreak3: 'pronunciation_streak_3',
  pronunciationStreak5: 'pronunciation_streak_5',
  pronunciationStreak10: 'pronunciation_streak_10',
  pronunciationTopicComplete: 'pronunciation_topic_complete'
} as const

export type ToeicStarKey = (typeof TOEIC_STAR_KEYS)[keyof typeof TOEIC_STAR_KEYS]

const DEFAULT_STAR_RULES: Record<ToeicStarKey, { label: string; points: number; toastMessage?: string }> = {
  [TOEIC_STAR_KEYS.dailyCheckin]: { label: 'Đăng nhập & học bài mỗi ngày', points: 5 },
  [TOEIC_STAR_KEYS.streak3]: { label: 'Chuỗi học tập 3 ngày liên tiếp', points: 10 },
  [TOEIC_STAR_KEYS.streak7]: { label: 'Chuỗi học tập 7 ngày liên tiếp', points: 30 },
  [TOEIC_STAR_KEYS.streak30]: { label: 'Chuỗi học tập 30 ngày (Thánh nhân)', points: 100 },
  [TOEIC_STAR_KEYS.firstQuestion]: { label: 'Hoàn thành câu hỏi đầu tiên (Micro)', points: 1 },
  [TOEIC_STAR_KEYS.correctStreak3]: { label: 'Làm đúng 3 câu liên tiếp', points: 2 },
  [TOEIC_STAR_KEYS.correctStreak5]: { label: 'Làm đúng 5 câu liên tiếp', points: 5 },
  [TOEIC_STAR_KEYS.correctStreak10]: { label: 'Làm đúng 10 câu liên tiếp', points: 15 },
  [TOEIC_STAR_KEYS.allCorrect]: { label: 'Làm đúng toàn bộ bài tập (Perfect)', points: 20 },
  [TOEIC_STAR_KEYS.completeGrammar]: { label: 'Hoàn thành 1 bài Ngữ Pháp', points: 2 },
  [TOEIC_STAR_KEYS.completeVocab]: { label: 'Hoàn thành 1 bài Từ Vựng', points: 2 },
  [TOEIC_STAR_KEYS.completePart]: { label: 'Hoàn thành 1 Part Nghe/Đọc', points: 3 },
  [TOEIC_STAR_KEYS.bookmarkQuestion]: { label: 'Lưu 1 câu hỏi vào Sổ Tay', points: 1 },
  [TOEIC_STAR_KEYS.speedChallengePlay]: { label: 'Tham gia 1 lượt Speed Challenge', points: 2 },
  [TOEIC_STAR_KEYS.speedChallengeTop1]: { label: 'Đạt Top 1 Speed Challenge', points: 10 },
  [TOEIC_STAR_KEYS.speedChallengeTop2]: { label: 'Đạt Top 2 Speed Challenge', points: 5 },
  [TOEIC_STAR_KEYS.actualTestComplete]: { label: 'Hoàn thành 1 bài Thi Thử (Actual Test)', points: 20 },
  [TOEIC_STAR_KEYS.actualTestNewRecord]: { label: 'Điểm Thi Thử vượt Kỷ lục Cá nhân', points: 30 },
  // Pronunciation rules
  [TOEIC_STAR_KEYS.pronunciationCorrect]: { label: 'Phát âm chuẩn 1 từ vựng', points: 1, toastMessage: 'Bạn phát âm tốt lắm' },
  [TOEIC_STAR_KEYS.pronunciationStreak3]: { label: 'Phát âm chuẩn 3 từ liên tiếp', points: 5, toastMessage: 'Hot streak! 3 từ đúng liên tiếp' },
  [TOEIC_STAR_KEYS.pronunciationStreak5]: { label: 'Phát âm chuẩn 5 từ liên tiếp', points: 15, toastMessage: 'On fire! 5 từ đúng liên tiếp' },
  [TOEIC_STAR_KEYS.pronunciationStreak10]: { label: 'Phát âm chuẩn 10 từ liên tiếp', points: 30, toastMessage: 'Unstoppable! 10 từ đúng liên tiếp' },
  [TOEIC_STAR_KEYS.pronunciationTopicComplete]: { label: 'Hoàn thành xuất sắc toàn bộ chủ đề', points: 50, toastMessage: 'Tuyệt đỉnh! Hoàn thành xuất sắc toàn bộ chủ đề!' },
}

const prismaWithToeicStars = prisma as typeof prisma & {
  toeicStarRule: {
    upsert: (...args: unknown[]) => Promise<unknown>
  }
  toeicStarLog: {
    findUnique: (...args: unknown[]) => Promise<unknown>
    create: (...args: unknown[]) => Promise<unknown>
  }
}

type ToeicStarUserClient = {
  findUnique: (...args: unknown[]) => Promise<unknown>
  update: (...args: unknown[]) => Promise<unknown>
}

export const ensureDefaultToeicStarRules = async () => {
  const entries = Object.entries(DEFAULT_STAR_RULES) as Array<[ToeicStarKey, { label: string; points: number; toastMessage?: string }]>

  await Promise.all(
    entries.map(([activityKey, config]) =>
      prismaWithToeicStars.toeicStarRule.upsert({
        where: { activityKey },
        update: {},
        create: {
          activityKey,
          label: config.label,
          points: config.points,
          toastMessage: config.toastMessage,
          isActive: true
        }
      })
    )
  )
}

export const awardToeicStars = async ({
  userId,
  activityKey,
  referenceKey
}: {
  userId: string
  activityKey: ToeicStarKey
  referenceKey: string
}) => {
  await ensureDefaultToeicStarRules()

  return prisma.$transaction(async (tx) => {
    const txWithUser = tx as typeof tx & {
      user: ToeicStarUserClient
    }
    const txWithStars = tx as typeof tx & {
      toeicStarRule: {
        findUnique: (...args: unknown[]) => Promise<unknown>
      }
      toeicStarLog: {
        findUnique: (...args: unknown[]) => Promise<unknown>
        create: (...args: unknown[]) => Promise<unknown>
      }
    }

    const ruleRaw = await txWithStars.toeicStarRule.findUnique({
      where: { activityKey },
      select: { points: true, isActive: true, label: true, toastMessage: true }
    })

    const rule = ruleRaw as { points: number; isActive: boolean; label: string; toastMessage: string | null } | null

    const currentUser = await txWithUser.user.findUnique({
      where: { id: userId },
      select: { toeicStars: true, tier: true, role: true }
    }) as { toeicStars: number; tier: string; role: string } | null

    if (!currentUser || !rule || !rule.isActive || rule.points <= 0) {
      return {
        awardedStars: 0,
        totalStars: currentUser?.toeicStars || 0
      }
    }

    const existingLogRaw = await txWithStars.toeicStarLog.findUnique({
      where: { referenceKey },
      select: { id: true }
    })

    if (existingLogRaw) {
      return {
        awardedStars: 0,
        totalStars: currentUser.toeicStars
      }
    }

    let multiplier = 1
    if (currentUser.role === 'admin') multiplier = 10
    else if (currentUser.tier === 'ULTRA') multiplier = 3
    else if (currentUser.tier === 'PRO' || currentUser.role === 'member') multiplier = 2

    const finalPoints = rule.points * multiplier

    await txWithStars.toeicStarLog.create({
      data: {
        userId,
        activityKey,
        points: finalPoints,
        referenceKey
      }
    })

    const updatedUser = await txWithUser.user.update({
      where: { id: userId },
      data: {
        toeicStars: {
          increment: finalPoints
        }
      },
      select: { toeicStars: true }
    }) as { toeicStars: number }

    let finalToastMessage = rule.toastMessage || rule.label
    finalToastMessage = `${finalToastMessage} (+${finalPoints} ⭐)`

    return {
      awardedStars: finalPoints,
      totalStars: updatedUser.toeicStars,
      reason: finalToastMessage
    }
  })
}
