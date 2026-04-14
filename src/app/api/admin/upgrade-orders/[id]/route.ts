import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await req.json() // action can be 'approve' or 'reject'
    const orderId = (await params).id

    const order = await prisma.upgradeOrder.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (action === 'approve') {
      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + order.durationMonths)

      // Transaction to update both order and user
      await prisma.$transaction([
        prisma.upgradeOrder.update({
          where: { id: orderId },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: {
            tier: order.targetTier,
            tierExpiresAt: expiresAt
          }
        })
      ])

      return NextResponse.json({ success: true, message: "Order approved successfully" })

    } else if (action === 'reject') {
      await prisma.upgradeOrder.update({
        where: { id: orderId },
        data: {
          status: 'rejected',
          completedAt: new Date()
        }
      })

      return NextResponse.json({ success: true, message: "Order rejected successfully" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (err: any) {
    console.error("[ADMIN_UPGRADE_ORDER_PUT]", err)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
