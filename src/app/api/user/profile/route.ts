import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            enrollments: {
              select: { studentId: true, createdAt: true },
              where: { studentId: { not: null } },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        },
        referredUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            enrollments: {
              select: { studentId: true, createdAt: true },
              where: { studentId: { not: null } },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        enrollments: {
          select: { studentId: true, status: true, course: { select: { title: true } }, createdAt: true },
          where: { status: { not: 'dropped' } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      studentId: user.enrollments[0]?.studentId || null,
      courseEnrollmentStatus: user.enrollments[0]?.status || null,
      courseTitle: user.enrollments[0]?.course?.title || null,
      referrer: user.referrer
        ? {
            id: user.referrer.id,
            name: user.referrer.name,
            email: user.referrer.email,
            phone: user.referrer.phone,
            studentId: user.referrer.enrollments[0]?.studentId || null
          }
        : null,
      referredUsers: user.referredUsers.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        createdAt: item.createdAt,
        studentId: item.enrollments[0]?.studentId || null
      }))
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, bio, image } = body

    const normalizedName = name ? String(name).trim() : undefined
    const normalizedPhone = phone ? String(phone).trim() : undefined
    const normalizedBio = bio ? String(bio).trim() : undefined

    // Validate phone if provided
    if (normalizedPhone) {
      const phonePattern = /^[0-9+\-\s]{9,15}$/
      if (!phonePattern.test(normalizedPhone)) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
      }

      // Check if phone is already used by another user
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          email: { not: session.user.email }
        }
      })

      if (existingPhone) {
        return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(normalizedName && { name: normalizedName }),
        ...(normalizedPhone && { phone: normalizedPhone }),
        ...(normalizedBio !== undefined && { bio: normalizedBio || null }),
        ...(image && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
