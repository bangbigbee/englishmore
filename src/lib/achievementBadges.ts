import { prisma } from '@/lib/prisma'

export interface BadgeItem {
  id: string
  icon: string
  name: string
  description: string
  earned: boolean
  earnedAt?: string | null
  progress?: number
  progressLabel?: string
}

function getDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function longestStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...new Set(dates)].sort()
  let best = 1
  let cur = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (curr.getTime() - prev.getTime()) / 86_400_000

    if (diff === 1) {
      cur++
      if (cur > best) best = cur
    } else if (diff > 1) {
      cur = 1
    }
  }

  return best
}

function isOnTimeSubmission(submittedAt: Date, dueDate: Date) {
  const isDateOnlyDueDate =
    dueDate.getUTCHours() === 0 &&
    dueDate.getUTCMinutes() === 0 &&
    dueDate.getUTCSeconds() === 0 &&
    dueDate.getUTCMilliseconds() === 0

  if (isDateOnlyDueDate) {
    const nextDayUtc = new Date(dueDate)
    nextDayUtc.setUTCDate(nextDayUtc.getUTCDate() + 1)
    return submittedAt.getTime() < nextDayUtc.getTime()
  }

  return submittedAt.getTime() <= dueDate.getTime()
}

export async function getUserBadges(userId: string) {
  const [checkins, reflections, submissions] = await Promise.all([
    prisma.dailyGreetingCheckin.findMany({
      where: { userId },
      select: { responseDate: true, createdAt: true },
      orderBy: { responseDate: 'asc' }
    }),
    prisma.dailyReflection.findMany({
      where: { userId },
      select: { responseDate: true, createdAt: true },
      orderBy: { responseDate: 'asc' }
    }),
    prisma.homeworkSubmission.findMany({
      where: { userId },
      select: {
        submittedAt: true,
        createdAt: true,
        homework: { select: { dueDate: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
  ])

  const checkinDates = checkins.map((c) => getDateOnly(c.responseDate))
  const reflectionDates = reflections.map((r) => getDateOnly(r.responseDate))

  const totalCheckins = checkins.length
  const totalReflections = reflections.length
  const totalSubmissions = submissions.length
  const onTimeSubmissions = submissions.filter((s) => isOnTimeSubmission(s.submittedAt, s.homework.dueDate)).length

  const checkinStreak = longestStreak(checkinDates)
  const reflectionStreak = longestStreak(reflectionDates)

  const badges: BadgeItem[] = [
    {
      id: 'first_checkin',
      icon: '🌱',
      name: 'First Step',
      description: 'Complete your very first daily check-in.',
      earned: totalCheckins >= 1,
      earnedAt: totalCheckins >= 1 ? checkins[0].createdAt.toISOString() : null,
      progress: Math.min(100, totalCheckins * 100),
      progressLabel: `${Math.min(totalCheckins, 1)}/1 check-in`
    },
    {
      id: 'checkin_streak_3',
      icon: '🔥',
      name: '3-Day Streak',
      description: 'Check in for 3 consecutive days.',
      earned: checkinStreak >= 3,
      earnedAt: checkinStreak >= 3 ? checkins[2]?.createdAt.toISOString() ?? null : null,
      progress: Math.min(100, Math.round((checkinStreak / 3) * 100)),
      progressLabel: `${Math.min(checkinStreak, 3)}/3 days`
    },
    {
      id: 'checkin_streak_7',
      icon: '⚡',
      name: '7-Day Blazer',
      description: 'Keep your check-in streak going for 7 days straight.',
      earned: checkinStreak >= 7,
      earnedAt: checkinStreak >= 7 ? checkins[6]?.createdAt.toISOString() ?? null : null,
      progress: Math.min(100, Math.round((checkinStreak / 7) * 100)),
      progressLabel: `${Math.min(checkinStreak, 7)}/7 days`
    },
    {
      id: 'checkin_30',
      icon: '🏅',
      name: 'Committed',
      description: 'Check in 30 times in total — consistency is key!',
      earned: totalCheckins >= 30,
      earnedAt: totalCheckins >= 30 ? checkins[29].createdAt.toISOString() : null,
      progress: Math.min(100, Math.round((totalCheckins / 30) * 100)),
      progressLabel: `${Math.min(totalCheckins, 30)}/30 check-ins`
    },
    {
      id: 'first_reflection',
      icon: '💭',
      name: 'Inner Voice',
      description: 'Write your very first daily reflection.',
      earned: totalReflections >= 1,
      earnedAt: totalReflections >= 1 ? reflections[0].createdAt.toISOString() : null,
      progress: Math.min(100, totalReflections * 100),
      progressLabel: `${Math.min(totalReflections, 1)}/1 reflection`
    },
    {
      id: 'reflection_streak_3',
      icon: '🌟',
      name: 'Deep Thinker',
      description: 'Reflect for 3 consecutive days without a break.',
      earned: reflectionStreak >= 3,
      earnedAt: reflectionStreak >= 3 ? reflections[2]?.createdAt.toISOString() ?? null : null,
      progress: Math.min(100, Math.round((reflectionStreak / 3) * 100)),
      progressLabel: `${Math.min(reflectionStreak, 3)}/3 days`
    },
    {
      id: 'reflection_10',
      icon: '🧠',
      name: 'Mindful Learner',
      description: 'Complete 10 daily reflections total.',
      earned: totalReflections >= 10,
      earnedAt: totalReflections >= 10 ? reflections[9].createdAt.toISOString() : null,
      progress: Math.min(100, Math.round((totalReflections / 10) * 100)),
      progressLabel: `${Math.min(totalReflections, 10)}/10 reflections`
    },
    {
      id: 'first_submit',
      icon: '📚',
      name: 'First Submission',
      description: 'Submit your very first homework assignment.',
      earned: totalSubmissions >= 1,
      earnedAt: totalSubmissions >= 1 ? submissions[0].createdAt.toISOString() : null,
      progress: Math.min(100, totalSubmissions * 100),
      progressLabel: `${Math.min(totalSubmissions, 1)}/1 submission`
    },
    {
      id: 'on_time_3',
      icon: '⏰',
      name: 'Punctual Student',
      description: 'Submit homework on time at least 3 times.',
      earned: onTimeSubmissions >= 3,
      earnedAt: onTimeSubmissions >= 3 ? submissions.filter((s) => isOnTimeSubmission(s.submittedAt, s.homework.dueDate))[2]?.createdAt.toISOString() ?? null : null,
      progress: Math.min(100, Math.round((onTimeSubmissions / 3) * 100)),
      progressLabel: `${Math.min(onTimeSubmissions, 3)}/3 on-time`
    },
    {
      id: 'submit_5',
      icon: '🏆',
      name: 'Homework Hero',
      description: 'Submit 5 or more homework assignments.',
      earned: totalSubmissions >= 5,
      earnedAt: totalSubmissions >= 5 ? submissions[4].createdAt.toISOString() : null,
      progress: Math.min(100, Math.round((totalSubmissions / 5) * 100)),
      progressLabel: `${Math.min(totalSubmissions, 5)}/5 submissions`
    },
    {
      id: 'all_rounder',
      icon: '💎',
      name: 'All-Rounder',
      description: 'Check in, reflect, and submit homework — all in the same day.',
      earned: (() => {
        const checkinSet = new Set(checkinDates)
        const reflectSet = new Set(reflectionDates)
        const submitSet = new Set(submissions.map((s) => getDateOnly(s.createdAt)))
        return [...checkinSet].some((d) => reflectSet.has(d) && submitSet.has(d))
      })(),
      earnedAt: null,
      progress: (() => {
        const checkinSet = new Set(checkinDates)
        const reflectSet = new Set(reflectionDates)
        const submitSet = new Set(submissions.map((s) => getDateOnly(s.createdAt)))
        const met = [totalCheckins > 0, totalReflections > 0, totalSubmissions > 0].filter(Boolean).length
        if ([...checkinSet].some((d) => reflectSet.has(d) && submitSet.has(d))) return 100
        return Math.round((met / 3) * 100)
      })(),
      progressLabel: `${[totalCheckins > 0, totalReflections > 0, totalSubmissions > 0].filter(Boolean).length}/3 tasks`
    }
  ]

  const earnedCount = badges.filter((b) => b.earned).length
  return { badges, earnedCount, totalBadges: badges.length }
}
