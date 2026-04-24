import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ROADMAP_TEMPLATES } from '@/lib/roadmapGenerator';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        const url = new URL(req.url);
        const levelQuery = url.searchParams.get('level');

        if (!session || !session.user || !session.user.id) {
            if (levelQuery && ROADMAP_TEMPLATES[levelQuery]) {
                const template = ROADMAP_TEMPLATES[levelQuery];
                // Return a mock roadmap structure for guests
                const mockRoadmap = {
                    currentScore: levelQuery === 'BEGINNER' ? 350 : levelQuery === 'INTERMEDIATE' ? 550 : 750,
                    targetScore: template.targetScore,
                    isUltraUnlocked: false,
                    phases: template.phases.map((p: any, i: number) => ({
                        id: `mock-phase-${i}`,
                        title: p.title,
                        objectiveOutput: p.objectiveOutput,
                        expectedScoreUp: p.expectedScoreUp,
                        dailyTasks: p.tasks.map((t: any, j: number) => ({
                            id: `mock-task-${j}`,
                            dayNumber: t.dayNumber,
                            title: t.title,
                            taskType: t.taskType,
                            rewardStars: t.rewardStars,
                            status: "PENDING",
                            referencePath: t.referencePath
                        }))
                    }))
                };
                return NextResponse.json({ success: true, roadmap: mockRoadmap, isGuest: true });
            }
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let roadmap = await prisma.userRoadmap.findUnique({
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
            // Check if user has toeicLevel
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (user?.toeicLevel) {
                const { generateRoadmapForUser } = await import('@/lib/roadmapGenerator');
                await generateRoadmapForUser(session.user.id, user.toeicLevel, user.toeicPlacementScore || '');
                
                // Fetch the newly generated roadmap
                roadmap = await prisma.userRoadmap.findUnique({
                    where: { userId: session.user.id },
                    include: {
                        phases: {
                            include: { dailyTasks: { orderBy: { dayNumber: 'asc' } } },
                            orderBy: { weekNumber: 'asc' }
                        }
                    }
                });
            }

            if (!roadmap) {
                return NextResponse.json({ success: false, message: "No roadmap found" });
            }
        }

        return NextResponse.json({
            success: true,
            roadmap
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
