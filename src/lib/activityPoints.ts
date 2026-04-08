import { prisma } from '@/lib/prisma'

export const ACTIVITY_POINT_KEYS = {
  dailyCheckin: 'daily_checkin',
  dailyReflection: 'daily_reflection'
} as const

export type ActivityPointKey = (typeof ACTIVITY_POINT_KEYS)[keyof typeof ACTIVITY_POINT_KEYS]

const DEFAULT_ACTIVITY_POINT_RULES: Record<ActivityPointKey, { label: string; points: number }> = {
  [ACTIVITY_POINT_KEYS.dailyCheckin]: {
    label: 'Daily Check-in',
    points: 5
  },
  [ACTIVITY_POINT_KEYS.dailyReflection]: {
    label: 'Daily Reflection',
    points: 8
  }
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
      select: { activityPoints: true }
    }) as { activityPoints: number } | null

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

    await txWithActivityPoints.activityPointLog.create({
      data: {
        userId,
        activityKey,
        points: rule.points,
        referenceKey
      }
    })

    const updatedUser = await txWithUser.user.update({
      where: { id: userId },
      data: {
        activityPoints: {
          increment: rule.points
        }
      },
      select: { activityPoints: true }
    }) as { activityPoints: number }

    return {
      awardedAp: rule.points,
      totalAp: updatedUser.activityPoints
    }
  })
}
