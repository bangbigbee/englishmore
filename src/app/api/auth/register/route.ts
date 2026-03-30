import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword, name, phone } = body

    const normalizedName = String(name || '').trim()
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedPhone = String(phone || '').trim()

    if (!normalizedName || !normalizedEmail || !normalizedPhone || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu' }, { status: 400 })
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
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } })
    if (existingPhone) {
      return NextResponse.json({ error: 'Số điện thoại đã được sử dụng' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
        password: passwordHash
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
