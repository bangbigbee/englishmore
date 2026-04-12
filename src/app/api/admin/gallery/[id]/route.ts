import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdminUser() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Forbidden' }
  }
  return { ok: true as const, status: 200, error: '' }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const auth = await requireAdminUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { id } = params
    await prisma.landingGalleryImage.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const auth = await requireAdminUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { id } = params
    const body = await request.json()
    const { displayOrder, isActive } = body

    const updated = await prisma.landingGalleryImage.update({
      where: { id },
      data: {
        ...(typeof displayOrder === 'number' ? { displayOrder } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {})
      },
      select: { id: true, displayOrder: true, isActive: true }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
