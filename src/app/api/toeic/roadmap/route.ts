import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const roadmap = await prisma.userRoadmap.findUnique({
            where: { userId: session.user.id },
            include: {
                phases: {
                    include: {
                        dailyTasks: {
                            orderBy: {
                                dayNumber: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        weekNumber: 'asc'
                    }
                }
            }
        });

        if (!roadmap) {
            return NextResponse.json({ success: false, message: "No roadmap found" });
        }

        return NextResponse.json({
            success: true,
            roadmap
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
