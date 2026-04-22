import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ActualTestBankList from "./ActualTestBankList";
import ActualTestAnalyticsTable from "./ActualTestAnalyticsTable";

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
                            title: { contains: 'ETS' }
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
                            title: { contains: 'ETS' }
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
                <ActualTestAnalyticsTable 
                    records={records.map(r => ({
                        id: r.id,
                        testId: r.testId,
                        title: r.title,
                        mode: r.mode,
                        duration: r.duration,
                        scoreListening: r.scoreListening,
                        scoreReading: r.scoreReading,
                        correctAnswers: r.correctAnswers,
                        totalQuestions: r.totalQuestions,
                        partStats: r.partStats ? (r.partStats as unknown as any) : null,
                        createdAt: r.createdAt
                    }))} 
                />
            )}
            
			{!isHistory && (
                <ActualTestBankList items={items} isMistakes={isMistakes} />
            )}
		</div>
	);
}
