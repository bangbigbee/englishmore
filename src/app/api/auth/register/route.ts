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

    // Chốt chặn 3: Chặn Disposable Emails
    const DISPOSABLE_DOMAINS = ['10minutemail.com', 'tempmail.org', 'yopmail.com', 'mailinator.com', 'guerrillamail.com', 'temp-mail.org', 'throwawaymail.com']
    const emailDomain = normalizedEmail.split('@')[1]
    if (DISPOSABLE_DOMAINS.includes(emailDomain)) {
      return NextResponse.json({ error: 'Please use a valid personal email address (Gmail, Outlook, etc.)' }, { status: 400 })
    }

    // Lấy IP của người dùng (Chốt chặn 2)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'

    // Giới hạn IP: Tối đa 3 tài khoản / IP trong 7 ngày
    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const ipCount = await prisma.user.count({
        where: {
          registrationIp: ip,
          createdAt: { gte: sevenDaysAgo }
        }
      })
      if (ipCount >= 3) {
        return NextResponse.json({ error: 'Too many accounts registered from this IP. Please try again later.' }, { status: 429 })
      }
    }

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

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const toeicRef = cookieStore.get('toeic_ref')?.value

    let actualReferrerId = null
    if (toeicRef) {
      if (toeicRef.length >= 25) {
        actualReferrerId = toeicRef
      } else {
        // Resolve short referral code (last characters of CUID)
        const referrerUser = await prisma.user.findFirst({
          where: { id: { endsWith: toeicRef } }
        })
        if (referrerUser) {
          actualReferrerId = referrerUser.id
        }
      }
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
        password: passwordHash,
        emailVerified: new Date(),
        toeicReferrerId: actualReferrerId,
        registrationIp: ip,
        toeicReferralStatus: actualReferrerId ? 'PENDING' : 'PENDING'
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

