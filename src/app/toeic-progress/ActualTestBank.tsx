import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ActualTestBank({ filter = 'mistakes' }: { filter?: string }) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	const setting = await prisma.systemSetting.findUnique({ where: { key: 'MASTER_ACCESS_TIER_CONFIG' } })
	const masterConfig = (setting?.value as any) || {}
	const requiredTier = masterConfig.grammar?.grammarBookmarkAccessTier || 'PRO'
	
	const userRole = session.user.role || 'user'
	const userTier = session.user.tier || 'FREE'

	let hasAccess = false
	if (userRole === 'admin') {
		hasAccess = true
	} else if (requiredTier === 'FREE') {
		hasAccess = true
	} else if (requiredTier === 'PRO' && (userTier === 'PRO' || userTier === 'ULTRA')) {
		hasAccess = true
	} else if (requiredTier === 'ULTRA' && userTier === 'ULTRA') {
		hasAccess = true
	}

	if (!hasAccess) {
		return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">Tính năng dành cho {requiredTier}</h3>
				<p className="text-slate-500 max-w-sm mx-auto mb-6">
					Nâng cấp tài khoản {requiredTier} để mở khoá tính năng Sổ Tay độc quyền và lưu trữ không giới hạn các bài luyện đọc.
				</p>
				<Link href="/upgrade" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all">
					Nâng Cấp Ngay
				</Link>
			</div>
		);
	}

	const isMistakes = filter === 'mistakes';
    const isHistory = filter === 'history';

    let items: any[] = [];
    let records: any[] = [];

    if (isHistory) {
        records = await prisma.toeicTestRecord.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    } else if (isMistakes) {
        const answers = await prisma.toeicAnswer.findMany({
            where: { 
                userId: session.user.id,
                isCorrect: false,
                question: {
                    lesson: {
                        topic: {
                            type: 'ACTUAL_TEST'
                        }
                    }
                }
            },
            include: {
                question: {
                    include: {
                        lesson: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 200
        });
        
        items = answers;
    } else {
        const bookmarks = await prisma.toeicQuestionBookmark.findMany({
            where: { 
                userId: session.user.id,
                question: {
                    lesson: {
                        topic: {
                            type: 'ACTUAL_TEST'
                        }
                    }
                }
            },
            include: {
                question: {
                    include: {
                        lesson: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        });
        items = bookmarks;
    }

	if (!isHistory && items.length === 0) {
		return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">
                    {isMistakes ? "Tuyệt vời! Bạn chưa có câu làm sai nào" : "Chưa có bài đọc nào được lưu"}
                </h3>
				<p className="text-slate-500 max-w-sm mx-auto">
                    {isMistakes 
                        ? "Hệ thống sẽ tự động lưu lại những bài đọc bạn làm sai để tiện ôn tập lại sau này." 
                        : "Khi làm bài tập ACTUAL_TEST, hãy bấm vào icon Bookmark để lưu lại những câu khó hoặc hay nhé."}
				</p>
			</div>
		);
	}

    if (isHistory && records.length === 0) {
        return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử thi</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    Bạn chưa thực hiện bài thi thử nào. Hãy làm một bài thi và quay lại đây nhé.
				</p>
			</div>
		);
    }

	return (
		<div className="space-y-4">
            {isHistory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {records.map((record) => {
                        const dateObj = new Date(record.createdAt);
                        const displayDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        let scoreStr = 'N/A';
                        if (record.scoreListening != null || record.scoreReading != null) {
                            scoreStr = ((record.scoreListening || 0) + (record.scoreReading || 0)).toString();
                        }
                        
                        return (
                            <div key={record.id} className="block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider ${record.mode === 'actual' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                                        {record.mode === 'actual' ? 'THI THỬ' : 'LUYỆN TẬP'}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{displayDate}</span>
                                </div>
                                
                                <h3 className="font-black text-slate-800 text-xl mb-6 line-clamp-2 leading-tight">
                                    {record.title || record.testId}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center">
                                        <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            THỜI GIAN LÀM
                                        </div>
                                        <div className="text-lg font-black text-slate-700 tabular-nums">
                                            {Math.floor(record.duration / 60)} phút
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center">
                                        <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            SỐ CÂU ĐÚNG
                                        </div>
                                        <div className="text-lg font-black text-slate-700 tabular-nums">
                                            <span className={record.correctAnswers > 0 ? "text-emerald-600" : ""}>{record.correctAnswers}</span><span className="text-slate-400 text-sm">/{record.totalQuestions}</span>
                                        </div>
                                    </div>
                                </div>

                                {record.mode === 'actual' && scoreStr !== 'N/A' && (
                                    <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 mb-6">
                                        <div>
                                            <div className="text-[10px] font-black text-orange-600/80 mb-0.5">DỰ KIẾN ĐIỂM TOEIC</div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
                                                <span>L: {record.scoreListening || 0}</span>
                                                <span className="text-orange-300">|</span>
                                                <span>R: {record.scoreReading || 0}</span>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-orange-600 tracking-tight">
                                            {scoreStr}
                                        </div>
                                    </div>
                                )}

                                <Link 
                                    href={`/toeic-practice/actual-test/${record.testId}/review/${record.id}`}
                                    className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-[0_4px_14px_0_rgba(15,23,42,0.15)] group-hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)]"
                                >
                                    Xem Chi Tiết Mắc Lỗi
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
            
			{!isHistory && items.map((item) => {
				const q = item.question;
				return (
					<Link 
						key={q.id}
						href={`/toeic-practice/grammar/${q.lesson.topic.slug}`}
						className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative"
					>
                        {isMistakes && item.selectedOption && (
                            <div className="absolute top-4 right-4 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 opacity-90 text-[10px] font-bold">
                                CÂU SAI
                            </div>
                        )}
                        {!isMistakes && (
                            <div className="absolute top-4 right-4 text-blue-500 bg-blue-50 p-1.5 rounded-lg border border-blue-200 opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                            </div>
                        )}
						
                        <div className="flex items-center gap-2 mb-3">
							<span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded whitespace-nowrap">
								{q.lesson.topic.title}
							</span>
                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded whitespace-nowrap">
								{q.lesson.title}
							</span>
						</div>
						
                        <p className="text-lg font-black text-slate-800 mb-4 pr-8 line-clamp-2 leading-snug">
							{q.question}
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm font-medium">
							<div className={`p-2 rounded-lg border ${q.correctOption === 'A' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<span className="font-black mr-2 opacity-60">A</span> {q.optionA}
							</div>
							<div className={`p-2 rounded-lg border ${q.correctOption === 'B' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<span className="font-black mr-2 opacity-60">B</span> {q.optionB}
							</div>
							<div className={`p-2 rounded-lg border ${q.correctOption === 'C' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<span className="font-black mr-2 opacity-60">C</span> {q.optionC}
							</div>
							{q.optionD && (
							<div className={`p-2 rounded-lg border ${q.correctOption === 'D' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<span className="font-black mr-2 opacity-60">D</span> {q.optionD}
							</div>
							)}
						</div>
                        
                        {(q.translation || q.explanation) && (
                            <div className="mt-4 pt-3 border-t border-slate-100/60">
                                {q.translation && (
                                    <div className="text-sm italic text-blue-700 opacity-90 mb-2">{q.translation}</div>
                                )}
                                {q.explanation && (
                                    <div className="text-[13px] font-medium text-slate-600">{q.explanation}</div>
                                )}
                            </div>
                        )}
					</Link>
				);
			})}
		</div>
	);
}
