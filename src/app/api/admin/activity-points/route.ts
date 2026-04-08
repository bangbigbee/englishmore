import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ACTIVITY_POINT_KEYS, ensureDefaultActivityPointRules } from '@/lib/activityPoints'

const ALLOWED_ACTIVITY_KEYS = new Set<string>(Object.values(ACTIVITY_POINT_KEYS))

const prismaWithActivityPoints = prisma as typeof prisma & {
  activityPointRule: {
    findMany: (...args: unknown[]) => Promise<unknown>
    update: (...args: unknown[]) => Promise<unknown>
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { ok: false, status: 401 as const }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || user.role !== 'admin') {
    return { ok: false, status: 403 as const }
  }

  return { ok: true, status: 200 as const }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  await ensureDefaultActivityPointRules()

  const rulesRaw = await prismaWithActivityPoints.activityPointRule.findMany({
    orderBy: { activityKey: 'asc' },
    select: {
      id: true,
      activityKey: true,
      label: true,
      points: true,
      isActive: true,
      updatedAt: true
    }
  })

  const memberRows = await prisma.user.findMany({
    where: {
      role: 'member'
    },
    orderBy: [
      { activityPoints: 'desc' },
      { createdAt: 'asc' }
    ],
    select: {
      id: true,
      name: true,
      email: true,
      activityPoints: true
    },
    take: 200
  })

  return NextResponse.json({
    rules: (Array.isArray(rulesRaw) ? rulesRaw : []) as Array<{
      id: string
      activityKey: string
      label: string
      points: number
      isActive: boolean
      updatedAt: Date
    }>,
    members: memberRows
  })
}

export async function PUT(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json().catch(() => ({})) as {
    activityKey?: string
    points?: number
    isActive?: boolean
  }

  const activityKey = String(body.activityKey || '').trim()
  if (!ALLOWED_ACTIVITY_KEYS.has(activityKey)) {
    return NextResponse.json({ error: 'Invalid activity key.' }, { status: 400 })
  }

  const points = Number(body.points)
  if (!Number.isInteger(points) || points < 0 || points > 1000) {
    return NextResponse.json({ error: 'Points must be an integer between 0 and 1000.' }, { status: 400 })
  }

  const isActive = Boolean(body.isActive)

  await ensureDefaultActivityPointRules()

  const updatedRuleRaw = await prismaWithActivityPoints.activityPointRule.update({
    where: { activityKey },
    data: {
      points,
      isActive
    },
    select: {
      id: true,
      activityKey: true,
      label: true,
      points: true,
      isActive: true,
      updatedAt: true
    }
  })

  return NextResponse.json({
    success: true,
    rule: updatedRuleRaw as {
      id: string
      activityKey: string
      label: string
      points: number
      isActive: boolean
      updatedAt: Date
    }
  })
}
