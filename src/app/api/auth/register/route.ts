import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword, name, phone, otp } = body

    const normalizedName = String(name || '').trim()
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPhone = String(phone || '').trim()
    const normalizedOtp = String(otp || '').trim()

    if (!normalizedName || !normalizedEmail || !normalizedPhone || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Please enter your full name, email, phone number, and password' }, { status: 400 })
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

    // Verify OTP
    if (!normalizedOtp) {
      return NextResponse.json({ error: 'Please enter the OTP code' }, { status: 400 })
    }

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { identifier: normalizedEmail, token: normalizedOtp },
    })

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 })
    }

    if (tokenRecord.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })
      return NextResponse.json({ error: 'OTP code has expired. Please request a new one.' }, { status: 400 })
    }

    // Delete used token
    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } })
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number is already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
        password: passwordHash,
        emailVerified: new Date(),
      }
    })

    return NextResponse.json({
      message: 'User registered',
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

