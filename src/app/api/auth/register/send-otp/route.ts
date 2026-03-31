import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/email'

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, password, confirmPassword } = body

    const normalizedName = String(name || '').trim()
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPhone = String(phone || '').trim()

    if (!normalizedName || !normalizedEmail || !normalizedPhone || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password confirmation does not match' }, { status: 400 })
    }

    const phonePattern = /^[0-9+\-\s]{9,15}$/
    if (!phonePattern.test(normalizedPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'This email is already in use' }, { status: 409 })
    }

    const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } })
    if (existingPhone) {
      return NextResponse.json({ error: 'This phone number is already in use' }, { status: 409 })
    }

    // Remove any existing OTP tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })

    const otp = generateOtp()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: otp,
        expires,
      },
    })

    await sendOtpEmail(normalizedEmail, otp)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('send-otp error:', error)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again later.' }, { status: 500 })
  }
}
