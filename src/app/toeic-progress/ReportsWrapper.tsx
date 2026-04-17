import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ReportsDashboard from "./ReportsDashboard";

export default async function ReportsWrapper() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	// 1. Tally stats for Vocabulary
	const userTags = await prisma.vocabularyTag.findMany({
		where: { userId: session.user.id },
		select: { isLearned: true, isHard: true, isBookmarked: true, updatedAt: true }
	});

	let learnedCount = 0;
	let hardCount = 0;
	let bookmarkedCount = 0;
	
	// For heatmap (last 14 days)
	const activityMap: Record<string, number> = {};
	const todayStr = new Date().toISOString().split('T')[0];

	userTags.forEach(tag => {
		if (tag.isLearned) learnedCount++;
		if (tag.isHard) hardCount++;
		if (tag.isBookmarked) bookmarkedCount++;

		const day = tag.updatedAt.toISOString().split('T')[0];
		activityMap[day] = (activityMap[day] || 0) + 1;
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const totalWords = await (prisma as any).vocabularyItem.count({
		where: { category: 'TOEIC', isActive: true }
	});

	// Generate last 14 days for Heatmap
	const heatMapDays = [];
	for (let i = 13; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const ds = d.toISOString().split('T')[0];
		heatMapDays.push({
			date: ds,
			dayLabel: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
			dateLabel: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
			count: activityMap[ds] || 0
		});
	}

	const completionRate = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

    const vocabStats = {
        learnedCount, hardCount, bookmarkedCount, totalWords, completionRate
    };

	return <ReportsDashboard vocabularyStats={vocabStats} vocabularyHeatmap={heatMapDays} />;
}
