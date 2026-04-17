import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string }, select: { role: true } })
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { topic, packageType } = await req.json()

    if (!topic || !packageType) {
      return NextResponse.json({ error: 'Missing topic or packageType' }, { status: 400 })
    }

    const config = await prisma.vocabularyTopicConfig.upsert({
      where: { topic: topic.trim() },
      update: { packageType },
      create: {
        topic: topic.trim(),
        packageType
      }
    })

    return NextResponse.json({ success: true, packageType: config.packageType })
  } catch (err) {
    console.error('[POST /api/admin/toeic/vocabulary/topics/package]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
