import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROADMAP_TEMPLATES: any = {
    'BEGINNER': {
        targetScore: 450,
        estimatedWeeks: 8,
        phases: [
            {
                weekNumber: 1,
                title: "Chặng 1: Xây Nền Móng",
                objectiveOutput: "Nắm vững 12 thì & 300 từ vựng cốt lõi",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 1, taskType: "GRAMMAR", title: "Khởi động: Thì Hiện tại đơn", referencePath: "/toeic-practice/grammar/thi-hien-tai-don", rewardStars: 10 },
                    { dayNumber: 1, taskType: "VOCAB", title: "Học 20 từ vựng chủ đề Office", referencePath: "/toeic-practice?tab=vocabulary", rewardStars: 15 },
                    { dayNumber: 2, taskType: "LISTENING", title: "Luyện Nghe Part 1: Tranh Tả Người", referencePath: "/toeic-practice?tab=actual-test", rewardStars: 20 },
                    { dayNumber: 3, taskType: "GRAMMAR", title: "Thì Quá khứ đơn & Tương lai đơn", referencePath: "/toeic-practice/grammar", rewardStars: 15 },
                    { dayNumber: 4, taskType: "VOCAB", title: "Học 20 từ vựng chủ đề Personnel", referencePath: "/toeic-practice?tab=vocabulary", rewardStars: 15 },
                    { dayNumber: 5, taskType: "READING", title: "Đọc hiểu cơ bản Part 5", referencePath: "/toeic-practice?tab=actual-test", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 2,
                title: "Chặng 2: Vượt Chướng Ngại Vật",
                objectiveOutput: "Chinh phục Part 2 & Mở rộng từ vựng",
                expectedScoreUp: 80,
                tasks: [
                    { dayNumber: 8, taskType: "LISTENING", title: "Kỹ năng nghe Wh-questions", referencePath: "/toeic-practice", rewardStars: 20 },
                    { dayNumber: 9, taskType: "GRAMMAR", title: "Câu Bị Động (Passive Voice)", referencePath: "/toeic-practice/grammar", rewardStars: 15 },
                ]
            },
            {
                weekNumber: 3,
                title: "Chặng 3: Bứt Phá Giới Hạn",
                objectiveOutput: "Kỹ năng làm bài Part 3, 4 nâng cao",
                expectedScoreUp: 100,
                tasks: [
                    { dayNumber: 15, taskType: "LISTENING", title: "Part 3: Đoạn hội thoại ngắn", referencePath: "/toeic-practice", rewardStars: 20 },
                ]
            }
        ]
    },
    'INTERMEDIATE': {
        targetScore: 650,
        estimatedWeeks: 6,
        phases: [
            {
                weekNumber: 1,
                title: "Chặng 1: Tối ưu Part 3, 4",
                objectiveOutput: "Nghe hiểu đoạn hội thoại dài & bài nói",
                expectedScoreUp: 60,
                tasks: [
                    { dayNumber: 1, taskType: "LISTENING", title: "Part 3: Luyện nghe suy luận", referencePath: "/toeic-practice", rewardStars: 20 },
                    { dayNumber: 1, taskType: "VOCAB", title: "Từ vựng Marketing & Sales", referencePath: "/toeic-practice?tab=vocabulary", rewardStars: 15 },
                    { dayNumber: 2, taskType: "GRAMMAR", title: "Mệnh đề quan hệ", referencePath: "/toeic-practice/grammar", rewardStars: 15 },
                    { dayNumber: 3, taskType: "READING", title: "Đọc hiểu Part 6: Điền từ vào đoạn văn", referencePath: "/toeic-practice", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 2,
                title: "Chặng 2: Chinh phục Part 7",
                objectiveOutput: "Kỹ năng đọc lướt (Skimming & Scanning)",
                expectedScoreUp: 80,
                tasks: [
                    { dayNumber: 8, taskType: "READING", title: "Part 7: Đọc đoạn văn đơn", referencePath: "/toeic-practice", rewardStars: 20 },
                ]
            }
        ]
    },
    'ADVANCED': {
        targetScore: 850,
        estimatedWeeks: 4,
        phases: [
            {
                weekNumber: 1,
                title: "Chặng 1: Luyện Đề Thực Chiến",
                objectiveOutput: "Giải đề ETS cường độ cao",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 1, taskType: "TEST", title: "Thi Thử ETS 2024 - Test 1", referencePath: "/toeic-practice/actual-test/ets-2024-test-1/take", rewardStars: 50 },
                    { dayNumber: 2, taskType: "REVIEW", title: "Phân tích lỗi sai Test 1", referencePath: "/toeic-practice/actual-test", rewardStars: 20 },
                    { dayNumber: 3, taskType: "VOCAB", title: "Học từ vựng nâng cao (Bẫy TOEIC)", referencePath: "/toeic-practice?tab=vocabulary", rewardStars: 15 },
                ]
            },
            {
                weekNumber: 2,
                title: "Chặng 2: Nâng Cao Tốc Độ",
                objectiveOutput: "Rút ngắn thời gian làm bài Đọc hiểu",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 8, taskType: "READING", title: "Speed Reading Part 7 (Đoạn kép)", referencePath: "/toeic-practice", rewardStars: 30 },
                ]
            }
        ]
    }
};

export async function generateRoadmapForUser(userId: string, level: string, placementScoreStr: string) {
    try {
        // Parse current score (e.g., "7/10")
        let currentPoints = 350; // Default base
        if (placementScoreStr) {
            const parts = placementScoreStr.split('/');
            if (parts.length === 2) {
                const percentage = parseInt(parts[0]) / parseInt(parts[1]);
                currentPoints = Math.round(percentage * 990);
                if (currentPoints < 10) currentPoints = 10;
            }
        }

        const template = ROADMAP_TEMPLATES[level] || ROADMAP_TEMPLATES['BEGINNER'];

        // Delete existing roadmap if any
        await prisma.userRoadmap.deleteMany({
            where: { userId }
        });

        // Create new roadmap
        const roadmap = await prisma.userRoadmap.create({
            data: {
                userId,
                currentScore: currentPoints,
                targetScore: template.targetScore,
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
