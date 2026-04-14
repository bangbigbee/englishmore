import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/upgrade
// Returns the status of the user's pending upgrade order
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ pending: false }) // Don't throw 401 for UX flow
    }

    const pendingOrder = await prisma.upgradeOrder.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      select: { targetTier: true, createdAt: true }
    })

    const latestOrder = await prisma.upgradeOrder.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, targetTier: true, status: true, createdAt: true }
    })

    return NextResponse.json({ 
      pending: !!pendingOrder, 
      order: pendingOrder,
      latestOrder
    })
  } catch (err: any) {
    console.error("[UPGRADE_GET]", err)
    return NextResponse.json({ pending: false })
  }
}

// POST /api/upgrade
// User submits an upgrade request after scanning the QR
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetTier, durationMonths, price, referenceCode } = await req.json()

    if (!targetTier || !durationMonths || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if there is already a pending order for this user to avoid spam
    const existingPending = await prisma.upgradeOrder.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      }
    })

    if (existingPending) {
      return NextResponse.json(
        { error: "Bạn đang có một yêu cầu nâng cấp đang chờ duyệt. Vui lòng chờ phản hồi từ Admin." },
        { status: 400 }
      )
    }

    // Create the order
    const order = await prisma.upgradeOrder.create({
      data: {
        userId: session.user.id,
        targetTier,
        durationMonths,
        price,
        referenceCode: referenceCode || null,
        status: "pending",
      }
    })

    return NextResponse.json({ success: true, order })

  } catch (err: any) {
    console.error("[UPGRADE_POST]", err)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
