import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VocabularyDashboard() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	// 1. Tally stats
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

	// Get total TOEIC words in system
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

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h2 className="text-2xl font-black text-slate-800">Báo Cáo Tiến Độ Từ Vựng</h2>
				<p className="text-slate-500 font-medium mt-1">Thông số và cường độ học tập ghi nhận từ hệ thống</p>
			</div>

			{/* 3 Metric Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden shadow-sm">
					<div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full blur-2xl"></div>
					<h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 relative">Đã thuộc (Learned)</h3>
					<div className="flex items-baseline gap-2 relative">
						<span className="text-4xl font-black text-slate-800">{learnedCount}</span>
						<span className="text-slate-400 font-medium text-sm">/ {totalWords} từ</span>
					</div>
					<div className="mt-4 w-full bg-slate-100 rounded-full h-2">
						<div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, completionRate)}%` }} />
					</div>
					<p className="text-xs font-bold text-green-600 mt-2">Hoàn thành {completionRate}% mục tiêu</p>
				</div>

				<div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden shadow-sm">
					<div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full blur-2xl"></div>
					<h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 relative">Cần ôn tập (Hard)</h3>
					<div className="flex items-baseline gap-2 relative">
						<span className="text-4xl font-black text-slate-800">{hardCount}</span>
						<span className="text-slate-400 font-medium text-sm">từ vựng</span>
					</div>
					<div className="mt-4 flex items-center gap-2">
						<span className="flex w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
						<p className="text-xs font-bold text-slate-600">Những thẻ ưu tiên hiển thị liên tục</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden shadow-sm">
					<div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl"></div>
					<h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 relative">Đã lưu trữ (Bookmarks)</h3>
					<div className="flex items-baseline gap-2 relative">
						<span className="text-4xl font-black text-slate-800">{bookmarkedCount}</span>
						<span className="text-slate-400 font-medium text-sm">từ vựng</span>
					</div>
					<div className="mt-4 flex items-center gap-2">
						<span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-100 text-amber-600 text-xs shadow-sm">⭐</span>
						<p className="text-xs font-bold text-slate-600">Từ vựng mục tiêu, ví dụ hay</p>
					</div>
				</div>
			</div>

			{/* Heatmap Section */}
			<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
						<span className="text-xl">🔥</span> Nhịp độ học tập (14 ngày qua)
					</h3>
				</div>
				<div className="flex justify-between items-end gap-1.5 sm:gap-2">
					{heatMapDays.map((d, i) => {
						let colorClass = "bg-slate-100";
						if (d.count > 0) colorClass = "bg-green-200";
						if (d.count >= 10) colorClass = "bg-green-400";
						if (d.count >= 30) colorClass = "bg-green-600";
						if (d.count >= 50) colorClass = "bg-green-800";

						const isToday = d.date === todayStr;

						return (
							<div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
								<div className="text-[10px] text-slate-400 font-bold hidden sm:block truncate opacity-60">
									{d.dayLabel}
								</div>
								
								<div 
									className={`w-full max-w-[28px] aspect-square rounded-md ${colorClass} transition-transform hover:scale-110 cursor-pointer ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
									title={`${d.dateLabel}: Tâm đắc ${d.count} từ vựng`}
								/>
								
								{/* Tooltip on mobile */}
								<div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none z-10">
									{d.dateLabel}: {d.count} từ
								</div>
							</div>
						);
					})}
				</div>
				<div className="mt-6 flex items-center justify-end gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
					<span>Nhẹ</span>
					<div className="flex gap-1">
						<div className="w-3 h-3 rounded-sm bg-slate-100"></div>
						<div className="w-3 h-3 rounded-sm bg-green-200"></div>
						<div className="w-3 h-3 rounded-sm bg-green-400"></div>
						<div className="w-3 h-3 rounded-sm bg-green-600"></div>
						<div className="w-3 h-3 rounded-sm bg-green-800"></div>
					</div>
					<span>Căng</span>
				</div>
			</div>
			
			<div className="bg-indigo-50 text-indigo-800 rounded-2xl p-6 border border-indigo-100 flex gap-4 mt-6">
				<div className="text-3xl shrink-0">💡</div>
				<div>
					<h4 className="font-bold mb-1">Mẹo học Spaced Repetition</h4>
					<p className="text-sm font-medium opacity-80 leading-relaxed">
						Khi lướt Flashcard, hãy dũng cảm chuyển những từ vựng sang thẻ "Đã thuộc" nếu bạn thấy nó quá dễ, để hệ thống tập trung thời gian của bạn vào các thẻ "Từ khó". Sự phân bổ thời gian hợp lý chính là chìa khóa chinh phục TOEIC!
					</p>
				</div>
			</div>
		</div>
	);
}
