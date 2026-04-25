import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { ROADMAP_TEMPLATES } from './roadmapTemplates';

export async function generateRoadmapForUser(userId: string, level: string, placementScoreStr: string) {
    try {
        // Parse current score (e.g., "7/10")
        let currentPoints = 350; // Default base
        if (placementScoreStr) {
            const parts = placementScoreStr.split('/');
            if (parts.length === 2) {
                const percentage = parseInt(parts[0]) / parseInt(parts[1]);
                currentPoints = Math.round(percentage * 990);
                currentPoints = Math.round(currentPoints / 5) * 5; // Round to nearest 5
                if (currentPoints < 10) currentPoints = 10;
            }
        }

        let roadmapTemplates = ROADMAP_TEMPLATES;
        try {
            const setting = await prisma.systemSetting.findUnique({ where: { key: 'toeic_roadmap_templates' } });
            if (setting && setting.value) {
                roadmapTemplates = setting.value as any;
            }
        } catch(e) {
            console.error('Could not fetch custom roadmap templates', e);
        }

        const template = roadmapTemplates[level] || roadmapTemplates['BEGINNER'];

        // Delete existing roadmap if any
        await prisma.userRoadmap.deleteMany({
            where: { userId }
        });

        let targetScore = template.targetScore || 450;
        if (currentPoints + 100 > targetScore) {
            targetScore = Math.min(990, Math.round((currentPoints + 150) / 5) * 5);
        }

        // Create new roadmap
        const roadmap = await prisma.userRoadmap.create({
            data: {
                userId,
                currentScore: currentPoints,
                targetScore: targetScore,
                estimatedWeeks: template.estimatedWeeks,
                isUltraUnlocked: false, // Default
            }
        });

        // Create phases and tasks
        for (const phaseTpl of template.phases) {
            const phase = await prisma.roadmapPhase.create({
                data: {
                    roadmapId: roadmap.id,
                    weekNumber: phaseTpl.weekNumber,
                    title: phaseTpl.title,
                    objectiveOutput: phaseTpl.objectiveOutput,
                    expectedScoreUp: phaseTpl.expectedScoreUp
                }
            });

            const tasksToCreate = phaseTpl.tasks.map((taskTpl: any) => ({
                phaseId: phase.id,
                dayNumber: taskTpl.dayNumber,
                taskType: taskTpl.taskType,
                title: taskTpl.title,
                referencePath: taskTpl.referencePath,
                rewardStars: taskTpl.rewardStars,
                status: "PENDING"
            }));

            await prisma.dailyTask.createMany({
                data: tasksToCreate
            });
        }

        return roadmap;
    } catch (error) {
        console.error("Error generating roadmap:", error);
        return null;
    }
}
