import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const DEFAULT_MASTER_CONFIG = {
  grammar: {
    theoryAccessTier: 'FREE',
    explanationAccessTier: 'FREE',
    translationAccessTier: 'FREE',
    bookmarkAccessTier: 'PRO',
  },
  vocabulary: {
    proFields: [] as string[],
    ultraFields: [] as string[],
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
  return NextResponse.json(setting?.value || DEFAULT_MASTER_CONFIG)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const val = await prisma.systemSetting.upsert({
    where: { key: 'MASTER_ACCESS_TIER_CONFIG' },
    update: { value: body },
    create: { key: 'MASTER_ACCESS_TIER_CONFIG', value: body }
  })
  return NextResponse.json(val.value)
}
