import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Get all active sets
        const activeSets = await prisma.toeicPlacementSet.findMany({
            where: { isActive: true },
            select: { id: true }
        });

        if (activeSets.length === 0) {
            return NextResponse.json({ success: false, parts: [] });
        }

        const activeSetIds = activeSets.map(s => s.id);

        // Fetch all questions from all active sets
        // @ts-ignore
        const allQuestions = await prisma.toeicPlacementQuestion.findMany({
            where: { setId: { in: activeSetIds } }
        });

        const url = new URL(req.url);
        const assessedLevel = url.searchParams.get('assessedLevel') || 'BEGINNER';

        // Load config from DB
        const systemSetting = await prisma.systemSetting.findUnique({ where: { key: 'PLACEMENT_TEST_CONFIG' } });
        let config = systemSetting ? systemSetting.value as any : null;
        if (!config) {
             config = {
                difficulty: {
                    BEGINNER: { beginner: 10, intermediate: 7, advanced: 3 }, // Total 20
                    INTERMEDIATE: { beginner: 6, intermediate: 8, advanced: 6 }, // Total 20
                    ADVANCED: { beginner: 3, intermediate: 7, advanced: 10 } // Total 20
                },
                skill: { listening: 5, reading: 10, pronunciation: 2, vocabulary: 3 }
             };
        }

        const levelConfig = config.difficulty[assessedLevel] || config.difficulty.BEGINNER;

        let neededDiff: Record<string, number> = { 
            beginner: levelConfig.beginner, 
            intermediate: levelConfig.intermediate, 
            advanced: levelConfig.advanced 
        };
        let neededSkill: Record<string, number> = { 
            listening: config.skill?.listening || 5, 
            reading: config.skill?.reading || 10,
            pronunciation: config.skill?.pronunciation || 2,
            vocabulary: config.skill?.vocabulary || 3
        };

        const pickRandom = (arr: any[]) => {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        const shuffledQuestions = pickRandom(allQuestions);
        let selectedQuestions: any[] = [];

        // Pass 1: Try to satisfy BOTH difficulty and skill
        for (let q of shuffledQuestions) {
            let diff = 'intermediate';
            if (q.category.toLowerCase().includes('beginner') || q.category.toLowerCase().includes('basic')) diff = 'beginner';
            else if (q.category.toLowerCase().includes('advanced')) diff = 'advanced';

            let skill = 'reading';
            const catLower = q.category.toLowerCase();
            if (catLower.includes('pronunciation')) skill = 'pronunciation';
            else if (catLower.includes('vocab')) skill = 'vocabulary';
            else if (catLower.includes('listen') || q.audioUrl) skill = 'listening';
            
            if (neededDiff[diff] > 0 && neededSkill[skill] > 0) {
                selectedQuestions.push(q);
                neededDiff[diff]--;
                neededSkill[skill]--;
            }
            if (selectedQuestions.length === 20) break;
        }

        // Pass 2: If we haven't reached 20, relax Skill constraint, try to satisfy Difficulty
        if (selectedQuestions.length < 20) {
            for (let q of shuffledQuestions) {
                if (selectedQuestions.some((sq: any) => sq.id === q.id)) continue;
                let diff = 'intermediate';
                if (q.category.toLowerCase().includes('beginner') || q.category.toLowerCase().includes('basic')) diff = 'beginner';
                else if (q.category.toLowerCase().includes('advanced')) diff = 'advanced';
                
                if (neededDiff[diff] > 0) {
                    selectedQuestions.push(q);
                    neededDiff[diff]--;
                }
                if (selectedQuestions.length === 20) break;
            }
        }

        // Pass 3: If STILL not 20, relax Difficulty constraint, try to satisfy Skill
        if (selectedQuestions.length < 20) {
            for (let q of shuffledQuestions) {
                if (selectedQuestions.some((sq: any) => sq.id === q.id)) continue;
                let skill = 'reading';
                const catLower = q.category.toLowerCase();
                if (catLower.includes('pronunciation')) skill = 'pronunciation';
                else if (catLower.includes('vocab')) skill = 'vocabulary';
                else if (catLower.includes('listen') || q.audioUrl) skill = 'listening';
                
                if (neededSkill[skill] > 0) {
                    selectedQuestions.push(q);
                    neededSkill[skill]--;
                }
                if (selectedQuestions.length === 20) break;
            }
        }

        // Pass 4: If STILL not 20, just grab anything left
        if (selectedQuestions.length < 20) {
            for (let q of shuffledQuestions) {
                if (selectedQuestions.some((sq: any) => sq.id === q.id)) continue;
                selectedQuestions.push(q);
                if (selectedQuestions.length === 20) break;
            }
        }

        // Shuffle the final selection to mix them up
        const finalQuestions = pickRandom(selectedQuestions)
            .map((q: any, idx: number) => {
                const { correctOption, createdAt, updatedAt, ...cleanQ } = q;
                cleanQ.order = idx + 1; // force order 1 to 15
                return cleanQ;
            });

        return NextResponse.json({
            success: true,
            title: "Bài Test Đánh Giá Năng Lực Đầu Vào",
            parts: [{
                category: "Mixed",
                questions: finalQuestions
            }]
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
