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
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Xác nhận mật khẩu không khớp' }, { status: 400 })
    }

    const phonePattern = /^[0-9+\-\s]{9,15}$/
    if (!phonePattern.test(normalizedPhone)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 })
    }

    const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } })
    if (existingPhone) {
      return NextResponse.json({ error: 'Số điện thoại này đã được sử dụng' }, { status: 409 })
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
    return NextResponse.json({ error: 'Gửi OTP thất bại, thử lại sau.' }, { status: 500 })
  }
}
