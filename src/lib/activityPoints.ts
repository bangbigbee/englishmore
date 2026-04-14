import { prisma } from '@/lib/prisma'
import { getUserBadges } from '@/lib/achievementBadges'

export const ACTIVITY_POINT_KEYS = {
  dailyCheckin: 'daily_checkin',
  dailyReflection: 'daily_reflection',
  homeworkOnTime: 'homework_on_time',
  exerciseCompletion: 'exercise_completion',
  badgeFirstCheckin: 'badge_first_checkin',
  badgeCheckinStreak3: 'badge_checkin_streak_3',
  badgeCheckinStreak7: 'badge_checkin_streak_7',
  badgeCheckin30: 'badge_checkin_30',
  badgeFirstReflection: 'badge_first_reflection',
  badgeReflectionStreak3: 'badge_reflection_streak_3',
  badgeReflection10: 'badge_reflection_10',
  badgeFirstSubmit: 'badge_first_submit',
  badgeOnTime3: 'badge_on_time_3',
  badgeSubmit5: 'badge_submit_5',
  badgeAllRounder: 'badge_all_rounder',
  vocabPronunciation: 'vocab_pronunciation',
  toeicStreak3: 'toeic_streak_3',
  toeicStreak5: 'toeic_streak_5',
  toeicStreak10: 'toeic_streak_10',
  toeicQuizComplete: 'toeic_quiz_complete'
} as const

export type ActivityPointKey = (typeof ACTIVITY_POINT_KEYS)[keyof typeof ACTIVITY_POINT_KEYS]

const DEFAULT_ACTIVITY_POINT_RULES: Record<ActivityPointKey, { label: string; points: number }> = {
  [ACTIVITY_POINT_KEYS.vocabPronunciation]: {
    label: 'Vocabulary Pronunciation Mastery',
    points: 2
  },
  [ACTIVITY_POINT_KEYS.dailyCheckin]: {
    label: 'Daily Check-in',
    points: 5
  },
  [ACTIVITY_POINT_KEYS.dailyReflection]: {
    label: 'Daily Reflection',
    points: 8
  },
  [ACTIVITY_POINT_KEYS.homeworkOnTime]: {
    label: 'Homework On-time Submission',
    points: 12
  },
  [ACTIVITY_POINT_KEYS.exerciseCompletion]: {
    label: 'Exercise Completion',
    points: 6
  },
  [ACTIVITY_POINT_KEYS.badgeFirstCheckin]: {
    label: 'Achievement: First Step',
    points: 10
  },
  [ACTIVITY_POINT_KEYS.badgeCheckinStreak3]: {
    label: 'Achievement: 3-Day Streak',
    points: 15
  },
  [ACTIVITY_POINT_KEYS.badgeCheckinStreak7]: {
    label: 'Achievement: 7-Day Blazer',
    points: 25
  },
  [ACTIVITY_POINT_KEYS.badgeCheckin30]: {
    label: 'Achievement: Committed',
    points: 30
  },
  [ACTIVITY_POINT_KEYS.badgeFirstReflection]: {
    label: 'Achievement: Inner Voice',
    points: 10
  },
  [ACTIVITY_POINT_KEYS.badgeReflectionStreak3]: {
    label: 'Achievement: Deep Thinker',
    points: 15
  },
  [ACTIVITY_POINT_KEYS.badgeReflection10]: {
    label: 'Achievement: Mindful Learner',
    points: 25
  },
  [ACTIVITY_POINT_KEYS.badgeFirstSubmit]: {
    label: 'Achievement: First Submission',
    points: 10
  },
  [ACTIVITY_POINT_KEYS.badgeOnTime3]: {
    label: 'Achievement: Punctual Student',
    points: 20
  },
  [ACTIVITY_POINT_KEYS.badgeSubmit5]: {
    label: 'Achievement: Homework Hero',
    points: 25
  },
  [ACTIVITY_POINT_KEYS.badgeAllRounder]: {
    label: 'Achievement: All-Rounder',
    points: 30
  },
  [ACTIVITY_POINT_KEYS.toeicStreak3]: {
    label: 'TOEIC 3-Point Streak',
    points: 2
  },
  [ACTIVITY_POINT_KEYS.toeicStreak5]: {
    label: 'TOEIC 5-Point Streak',
    points: 3
  },
  [ACTIVITY_POINT_KEYS.toeicStreak10]: {
    label: 'TOEIC 10-Point Streak',
    points: 5
  },
  [ACTIVITY_POINT_KEYS.toeicQuizComplete]: {
    label: 'TOEIC Quiz Complete',
    points: 15
  }
}

const BADGE_ACTIVITY_KEY_MAP: Record<string, ActivityPointKey> = {
  first_checkin: ACTIVITY_POINT_KEYS.badgeFirstCheckin,
  checkin_streak_3: ACTIVITY_POINT_KEYS.badgeCheckinStreak3,
  checkin_streak_7: ACTIVITY_POINT_KEYS.badgeCheckinStreak7,
  checkin_30: ACTIVITY_POINT_KEYS.badgeCheckin30,
  first_reflection: ACTIVITY_POINT_KEYS.badgeFirstReflection,
  reflection_streak_3: ACTIVITY_POINT_KEYS.badgeReflectionStreak3,
  reflection_10: ACTIVITY_POINT_KEYS.badgeReflection10,
  first_submit: ACTIVITY_POINT_KEYS.badgeFirstSubmit,
  on_time_3: ACTIVITY_POINT_KEYS.badgeOnTime3,
  submit_5: ACTIVITY_POINT_KEYS.badgeSubmit5,
  all_rounder: ACTIVITY_POINT_KEYS.badgeAllRounder
}

export interface ApRewardItem {
  points: number
  reason: string
}

const prismaWithActivityPoints = prisma as typeof prisma & {
  activityPointRule: {
    upsert: (...args: unknown[]) => Promise<unknown>
  }
  activityPointLog: {
    findUnique: (...args: unknown[]) => Promise<unknown>
    create: (...args: unknown[]) => Promise<unknown>
  }
}

type ActivityPointUserClient = {
  findUnique: (...args: unknown[]) => Promise<unknown>
  update: (...args: unknown[]) => Promise<unknown>
}

export const ensureDefaultActivityPointRules = async () => {
  const entries = Object.entries(DEFAULT_ACTIVITY_POINT_RULES) as Array<[ActivityPointKey, { label: string; points: number }]>

  await Promise.all(
    entries.map(([activityKey, config]) =>
      prismaWithActivityPoints.activityPointRule.upsert({
        where: { activityKey },
        update: {},
        create: {
          activityKey,
          label: config.label,
          points: config.points,
          isActive: true
        }
      })
    )
  )
}

export const awardActivityPoints = async ({
  userId,
  activityKey,
  referenceKey
}: {
  userId: string
  activityKey: ActivityPointKey
  referenceKey: string
}) => {
  await ensureDefaultActivityPointRules()

  return prisma.$transaction(async (tx) => {
    const txWithUser = tx as typeof tx & {
      user: ActivityPointUserClient
    }
    const txWithActivityPoints = tx as typeof tx & {
      activityPointRule: {
        findUnique: (...args: unknown[]) => Promise<unknown>
      }
      activityPointLog: {
        findUnique: (...args: unknown[]) => Promise<unknown>
        create: (...args: unknown[]) => Promise<unknown>
      }
    }

    const ruleRaw = await txWithActivityPoints.activityPointRule.findUnique({
      where: { activityKey },
      select: { points: true, isActive: true }
    })

    const rule = ruleRaw as { points: number; isActive: boolean } | null

    const currentUser = await txWithUser.user.findUnique({
      where: { id: userId },
      select: { activityPoints: true, tier: true, role: true }
    }) as { activityPoints: number; tier: string; role: string } | null

    if (!currentUser || !rule || !rule.isActive || rule.points <= 0) {
      return {
        awardedAp: 0,
        totalAp: currentUser?.activityPoints || 0
      }
    }

    const existingLogRaw = await txWithActivityPoints.activityPointLog.findUnique({
      where: { referenceKey },
      select: { id: true }
    })

    if (existingLogRaw) {
      return {
        awardedAp: 0,
        totalAp: currentUser.activityPoints
      }
    }

    let multiplier = 1
    if (currentUser.role === 'admin') multiplier = 10
    else if (currentUser.tier === 'ULTRA') multiplier = 3
    else if (currentUser.tier === 'PRO' || currentUser.role === 'member') multiplier = 2

    const finalPoints = rule.points * multiplier

    await txWithActivityPoints.activityPointLog.create({
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
        activityPoints: {
          increment: finalPoints
        }
      },
      select: { activityPoints: true }
    }) as { activityPoints: number }

    return {
      awardedAp: finalPoints,
      totalAp: updatedUser.activityPoints
    }
  })
}

export const awardAchievementBadgePoints = async (userId: string): Promise<ApRewardItem[]> => {
  const { badges } = await getUserBadges(userId)
  const earnedBadges = badges.filter((badge) => badge.earned)
  const rewards: ApRewardItem[] = []

  for (const badge of earnedBadges) {
    const activityKey = BADGE_ACTIVITY_KEY_MAP[badge.id]
    if (!activityKey) continue

    const awardResult = await awardActivityPoints({
      userId,
      activityKey,
      referenceKey: `${activityKey}:${userId}`
    })

    if (awardResult.awardedAp > 0) {
      rewards.push({
        points: awardResult.awardedAp,
        reason: `for ${badge.name}.`
      })
    }
  }

  return rewards
}
