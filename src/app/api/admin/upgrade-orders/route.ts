import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.upgradeOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, image: true, tier: true, phone: true }
        }
      }
    })

    return NextResponse.json({ orders })
  } catch (err: any) {
    console.error("[ADMIN_UPGRADE_ORDERS_GET]", err)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
