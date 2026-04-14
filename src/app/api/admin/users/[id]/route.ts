import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    console.log('DELETE /api/admin/users/[id] - params:', params)
    
    if (!params?.id) {
      console.log('No user ID provided')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const userId = params.id
    console.log('Deleting user with ID:', userId)

    // Get session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user?.id as string }
    })

    if (admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (userId === session.user?.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    console.log('Deleting user:', userId)

    // Delete user (cascade will delete assignments)
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    console.log('User deleted successfully:', deletedUser)

    return NextResponse.json({
      message: 'User deleted successfully',
      user: deletedUser
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('Error details:', errorMessage)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      if (error.message.includes('Foreign key')) {
        return NextResponse.json({ error: 'Cannot delete user with related data' }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    if (!params?.id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const userId = params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user?.id as string }
    })

    if (admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    if (body.action === 'reset_tier') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          tier: 'FREE',
          tierExpiresAt: null
        },
        select: { id: true, email: true, name: true, tier: true }
      })

      return NextResponse.json({
        message: 'User tier reset to FREE successfully',
        user: updatedUser
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
