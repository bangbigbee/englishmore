import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type SpeakYourselfPayload = {
  fullName: string
  age: string
  hometown: string
  major: string
  currentJob: string
  yearsOfExperience: string
  hobbies: string
  traitOne: string
  traitTwo: string
  traitThree: string
  reasonToJoin: string
}

const normalizeSpeechText = (value: string) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const tokenizeSpeechText = (value: string) => {
  const normalized = normalizeSpeechText(value)
  return normalized ? normalized.split(' ') : []
}

const calculateWordDistance = (leftWords: string[], rightWords: string[]) => {
  const rows = leftWords.length + 1
  const cols = rightWords.length + 1
  const dp = Array.from({ length: rows }, () => Array<number>(cols).fill(0))

  for (let row = 0; row < rows; row += 1) dp[row][0] = row
  for (let col = 0; col < cols; col += 1) dp[0][col] = col

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = leftWords[row - 1] === rightWords[col - 1] ? 0 : 1
      dp[row][col] = Math.min(
        dp[row - 1][col] + 1,
        dp[row][col - 1] + 1,
        dp[row - 1][col - 1] + cost
      )
    }
  }

  return dp[leftWords.length][rightWords.length]
}

const calculateSpeechAccuracy = (expectedScript: string, spokenScript: string) => {
  const expectedWords = tokenizeSpeechText(expectedScript)
  const spokenWords = tokenizeSpeechText(spokenScript)

  if (expectedWords.length === 0 || spokenWords.length === 0) {
    return 0
  }

  const distance = calculateWordDistance(expectedWords, spokenWords)
  const maxLength = Math.max(expectedWords.length, spokenWords.length)
  const score = ((maxLength - distance) / maxLength) * 100
  return Math.max(0, Math.min(100, Math.round(score)))
}

const normalizePayload = (body: unknown): SpeakYourselfPayload => {
  const value = body as Partial<SpeakYourselfPayload> | null
  return {
    fullName: String(value?.fullName || '').trim(),
    age: String(value?.age || '').trim(),
    hometown: String(value?.hometown || '').trim(),
    major: String(value?.major || '').trim(),
    currentJob: String(value?.currentJob || '').trim(),
    yearsOfExperience: String(value?.yearsOfExperience || '').trim(),
    hobbies: String(value?.hobbies || '').trim(),
    traitOne: String(value?.traitOne || '').trim(),
    traitTwo: String(value?.traitTwo || '').trim(),
    traitThree: String(value?.traitThree || '').trim(),
    reasonToJoin: String(value?.reasonToJoin || '').trim()
  }
}

const buildScript = (payload: SpeakYourselfPayload) => {
  return [
    `Hello everyone. My name is ${payload.fullName}.`,
    `I am ${payload.age} years old, and I come from ${payload.hometown}.`,
    `My background is ${payload.major}.`,
    `I currently work as ${payload.currentJob}, and I have ${payload.yearsOfExperience} years of experience.`,
    `In my free time, I enjoy ${payload.hobbies}.`,
    `Three words that describe me are ${payload.traitOne}, ${payload.traitTwo}, and ${payload.traitThree}.`,
    `I joined this course because ${payload.reasonToJoin}.`,
    'Thank you for listening.'
  ].join(' ')
}

const isMissingSpeakYourselfTable = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2021' &&
  String(error.meta?.table || '').includes('SpeakYourselfAttempt')

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!currentUser || currentUser.role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const activeEnrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id, status: 'active' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      courseId: true
    }
  })

  if (!activeEnrollment) {
    return NextResponse.json({ error: 'You do not have an active course yet' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const profile = normalizePayload(body?.profile)
  const spokenText = String(body?.spokenText || '').trim()
  const clientScript = String(body?.generatedScript || '').trim()

  if (!spokenText) {
    return NextResponse.json({ error: 'spokenText is required' }, { status: 400 })
  }

  // If the client already has an AI-generated or previously saved script, use it directly.
  // Only require profile fields when no script has been generated yet.
  if (!clientScript) {
    const missing = Object.entries(profile)
      .filter(([, value]) => !value)
      .map(([field]) => field)
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }
  }

  // Prefer the script the client generated (may be AI-polished); fall back to server template
  const generatedScript = clientScript || buildScript(profile)
  const accuracy = calculateSpeechAccuracy(generatedScript, spokenText)
  const passed = accuracy >= 80

  try {
    const attempt = await (prisma as unknown as { speakYourselfAttempt: { create: (args: unknown) => Promise<unknown> } }).speakYourselfAttempt.create({
      data: {
        userId: session.user.id,
        courseId: activeEnrollment.courseId,
        enrollmentId: activeEnrollment.id,
        profilePayload: profile,
        generatedScript,
        recognizedText: spokenText,
        accuracy,
        passed
      },
      select: {
        id: true,
        accuracy: true,
        passed: true,
        createdAt: true,
        generatedScript: true,
        recognizedText: true
      }
    }) as {
      id: string
      accuracy: number
      passed: boolean
      createdAt: Date
      generatedScript: string
      recognizedText: string
    }

    return NextResponse.json({
      message: passed ? 'Speak Yourself passed.' : 'Speak Yourself not passed yet.',
      attempt,
      hasPassed: passed
    })
  } catch (error) {
    if (isMissingSpeakYourselfTable(error)) {
      // Graceful fallback: evaluate result without DB persistence if migration is missing.
      return NextResponse.json({
        message: passed ? 'Speak Yourself passed. (temporary mode: result not saved)' : 'Speak Yourself not passed yet. (temporary mode: result not saved)',
        warning: 'Speak Yourself migration is not applied yet, so this attempt could not be stored in database.',
        attempt: {
          id: 'temporary-no-save',
          accuracy,
          passed,
          createdAt: new Date(),
          generatedScript,
          recognizedText: spokenText
        },
        hasPassed: passed,
        persisted: false
      })
    }

    console.error('Speak Yourself submit error:', error)
    return NextResponse.json({ error: 'Could not evaluate Speak Yourself. Please try again.' }, { status: 500 })
  }
}
