import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')
  if (!topic) return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
  
  const config = await prisma.vocabularyTopicConfig.findUnique({
    where: { topic }
  })
  
  if (!config) {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
    const master = setting?.value as any
    return NextResponse.json({
      topic,
      proFields: JSON.stringify(master?.vocabulary?.proFields || []),
      ultraFields: JSON.stringify(master?.vocabulary?.ultraFields || [])
    })
  }

  return NextResponse.json(config)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { topic, proFields, ultraFields } = body
  if (!topic) return NextResponse.json({ error: 'Missing topic' }, { status: 400 })

  const config = await prisma.vocabularyTopicConfig.upsert({
    where: { topic },
    update: {
      proFields: JSON.stringify(proFields || []),
      ultraFields: JSON.stringify(ultraFields || [])
    },
    create: {
      topic,
      proFields: JSON.stringify(proFields || []),
      ultraFields: JSON.stringify(ultraFields || [])
    }
  })

  return NextResponse.json(config)
}
