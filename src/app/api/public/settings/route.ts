import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    // Only allow specific keys to be fetched publicly for security
    const allowedKeys = ['subscription_pricing', 'footer_content']
    
    if (key && allowedKeys.includes(key)) {
      const setting = await prisma.systemSetting.findUnique({ where: { key } })
      return NextResponse.json(setting || { value: null })
    }

    return NextResponse.json({ error: 'Invalid or missing key' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
