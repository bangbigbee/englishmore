import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ACTIVITY_POINT_KEYS, awardAchievementBadgePoints, awardActivityPoints, type ApRewardItem } from '@/lib/activityPoints'

function isOnTimeHomeworkSubmission(submittedAt: Date, dueDate: Date) {
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

function isHomeworkMessageStorageMissing(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const maybeCode = (error as { code?: unknown }).code
  const maybeMessage = (error as { message?: unknown }).message
  return (
    (maybeCode === 'P2021' || maybeCode === 'P2022') &&
    typeof maybeMessage === 'string' &&
    maybeMessage.toLowerCase().includes('homeworkmessage')
  )
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true
    }
  })
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (currentUser.role === 'admin') {
    return NextResponse.json({ error: 'Admin accounts cannot submit homework' }, { status: 403 })
  }

  const { homeworkId, description } = await request.json()
  const note = typeof description === 'string' ? description.trim() : ''
  if (!homeworkId) {
    return NextResponse.json({ error: 'homeworkId is required' }, { status: 400 })
  }

  if (!note) {
    return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      status: 'active'
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!activeEnrollment) {
    return NextResponse.json({ error: 'You do not have an active course yet' }, { status: 400 })
  }

  const homework = await prisma.courseHomework.findUnique({ where: { id: homeworkId } })
  if (!homework || homework.courseId !== activeEnrollment.courseId) {
    return NextResponse.json({ error: 'This homework does not belong to your course' }, { status: 400 })
  }

  const assignment = await prisma.homeworkSubmission.upsert({
    where: {
      homeworkId_userId: {
        homeworkId,
        userId: session.user.id
      }
    },
    create: {
      homeworkId,
      userId: session.user.id,
      note,
      studentLastReadAt: new Date()
    },
    update: {
      note,
      studentLastReadAt: new Date(),
      submittedAt: new Date()
    }
  })

  try {
    await prisma.homeworkMessage.create({
      data: {
        submissionId: assignment.id,
        senderRole: 'student',
        content: note
      }
    })
  } catch (error) {
    if (!isHomeworkMessageStorageMissing(error)) {
      throw error
    }
  }

  let awardedAp = 0
  let totalAp = 0
  const apRewards: ApRewardItem[] = []

  if (isOnTimeHomeworkSubmission(assignment.submittedAt, homework.dueDate)) {
    try {
      const awardResult = await awardActivityPoints({
        userId: session.user.id,
        activityKey: ACTIVITY_POINT_KEYS.homeworkOnTime,
        referenceKey: `${ACTIVITY_POINT_KEYS.homeworkOnTime}:${session.user.id}:${homeworkId}`
      })

      awardedAp = awardResult.awardedAp
      totalAp = awardResult.totalAp
      if (awardResult.awardedAp > 0) {
        apRewards.push({
          points: awardResult.awardedAp,
          reason: 'for Homework On-time Submission.'
        })
      }
    } catch (apError) {
      console.warn('AP awarding skipped for homework submission because AP schema is not ready.', apError)
    }
  }

  if (currentUser.role === 'member') {
    try {
      const badgeRewards = await awardAchievementBadgePoints(currentUser.id)
      if (badgeRewards.length > 0) {
        apRewards.push(...badgeRewards)
        awardedAp += badgeRewards.reduce((sum, item) => sum + item.points, 0)
      }
    } catch (badgeApError) {
      console.warn('Achievement AP awarding skipped for homework submission.', badgeApError)
    }
  }

  return NextResponse.json({ message: 'Assignment submitted', assignment, awardedAp, totalAp, apRewards })
}