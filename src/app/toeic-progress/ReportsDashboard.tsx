'use client';
import { useState, useEffect } from 'react';

const SUB_TABS = [
    { id: 'vocabulary', label: 'Từ vựng' },
    { id: 'grammar', label: 'Ngữ pháp' },
    { id: 'reading', label: 'Luyện đọc' },
    { id: 'listening', label: 'Luyện nghe' },
    { id: 'actual-test', label: 'Luyện đề' }
];

export default function ReportsDashboard({ vocabularyHeatmap, vocabularyStats, quizStats, defaultSubTab = 'vocabulary' }: any) {
    const [subTab, setSubTab] = useState(defaultSubTab);

    // Sync subTab with property changes from sidebar
    useEffect(() => {
        setSubTab(defaultSubTab);
    }, [defaultSubTab]);

    return (
        <div className="space-y-6">
            {/* Hidden Sub-navigation (handled by sidebar) */}
            <div className="hidden">
                <div className="flex flex-nowrap overflow-x-auto gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-full xl:justify-between xl:bg-transparent xl:p-0 custom-scrollbar pb-3 sm:pb-1.5 xl:pb-0">
                    {SUB_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 whitespace-nowrap ${
                                subTab === tab.id
                                    ? 'bg-white text-[#14532d] shadow-sm xl:bg-[#14532d] xl:text-white'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 xl:bg-slate-50 xl:hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {subTab === 'vocabulary' && (
                <VocabularyReport stats={vocabularyStats} heatmap={vocabularyHeatmap} />
            )}
            
            {subTab === 'grammar' && (
                <QuizReport title="Báo Cáo Tiến Độ Ngữ Pháp" description="Thống kê kết quả làm bài tập ngữ pháp" stats={quizStats?.grammar} />
            )}
            
            {subTab === 'reading' && (
                <QuizReport title="Báo Cáo Tiến Độ Luyện Đọc" description="Thống kê kết quả làm bài tập đọc hiểu (Part 5-7)" stats={quizStats?.reading} />
            )}

            {subTab === 'listening' && (
                <QuizReport title="Báo Cáo Tiến Độ Luyện Nghe" description="Thống kê kết quả phần thi nghe (Part 1-4)" stats={quizStats?.listening} />
            )}

            {subTab === 'actual-test' && (
                <QuizReport title="Báo Cáo Tiến Độ Luyện Đề" description="Thống kê kết quả làm bài Full Test thực tế" isFullTest stats={quizStats?.['actual-test']} />
            )}
        </div>
    );
}

function VocabularyReport({ stats, heatmap }: any) {
    if (!stats || !heatmap) return null;
    const { learnedCount, hardCount, bookmarkedCount, totalWords, completionRate } = stats;
    
    return (
        <div className="mt-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
					{heatmap.map((d: any, i: number) => {
						let colorClass = "bg-slate-100";
						if (d.count > 0) colorClass = "bg-green-200";
						if (d.count >= 10) colorClass = "bg-green-400";
						if (d.count >= 30) colorClass = "bg-green-600";
						if (d.count >= 50) colorClass = "bg-green-800";

						const isToday = i === heatmap.length - 1; // last array item

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
    )
}

function QuizReport({ title, description, isFullTest, stats }: { title: string, description: string, isFullTest?: boolean, stats?: any }) {
    const hasData = stats && (stats.correct > 0 || stats.incorrect > 0);
    const timeSpent = (stats?.correct || 0) * 35 + (stats?.incorrect || 0) * 45; // Simulated time: 35s correct, 45s incorrect
    const timeValue = isFullTest ? Math.round(timeSpent / 60) : timeSpent;

    return (
        <div className="mt-8 animate-in fade-in zoom-in-95 duration-300">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden shadow-sm">
					<div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full blur-2xl"></div>
					<h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 relative">Câu trả lời đúng</h3>
					<div className="flex items-baseline gap-2 relative">
						<span className="text-4xl font-black text-slate-800">{stats?.correct || 0}</span>
						<span className="text-slate-400 font-medium text-sm">câu</span>
					</div>
					<div className="mt-4 w-full bg-slate-100 rounded-full h-2">
						<div className="bg-green-500 h-2 rounded-full" style={{ width: hasData ? `${Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)}%` : '0%' }} />
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden shadow-sm">
					<div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full blur-2xl"></div>
					<h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 relative">Câu trả lời sai</h3>
					<div className="flex items-baseline gap-2 relative">
						<span className="text-4xl font-black text-slate-800">{stats?.incorrect || 0}</span>
						<span className="text-slate-400 font-medium text-sm">câu</span>
					</div>
                    <div className="mt-4 flex items-center gap-2">
						<span className="flex w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
						<p className="text-xs font-bold text-slate-600">Cần xem lại kỹ đáp án</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden shadow-sm">
					<div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl"></div>
					<h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2 relative">Thời gian làm bài</h3>
					<div className="flex items-baseline gap-2 relative">
						<span className="text-4xl font-black text-slate-800">{timeValue}</span>
						<span className="text-slate-400 font-medium text-sm">{isFullTest ? 'phút' : 'giây'}</span>
					</div>
					<div className="mt-4 flex items-center gap-2">
						<span className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-100 text-blue-600 text-xs shadow-sm">⏱️</span>
						<p className="text-xs font-bold text-slate-600">Tổng thời gian luyện tập</p>
					</div>
				</div>
			</div>

            {/* Empty State placeholder */}
            {!hasData && (
			<div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-12 text-center mt-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-slate-100 shadow-sm">
                    📊
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Chưa có dữ liệu thống kê</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                    Biểu đồ và lịch sử luyện tập sẽ xuất hiện tại đây sau khi bạn tiến hành hoàn thành các bài tập liên quan.
                </p>
            </div>
            )}
		</div>
    )
}
