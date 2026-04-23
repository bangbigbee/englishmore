import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const parseTranslation = (text: string | null) => {
    if (!text) return null;
    let question = text;
    let a = '', b = '', c = '', d = '';
    
    const aIndex = text.indexOf('(A)');
    const bIndex = text.indexOf('(B)');
    const cIndex = text.indexOf('(C)');
    const dIndex = text.indexOf('(D)');
    
    if (aIndex !== -1) {
        question = text.substring(0, aIndex).trim();
        a = text.substring(aIndex + 3, bIndex !== -1 ? bIndex : text.length).trim();
        if (bIndex !== -1) {
            b = text.substring(bIndex + 3, cIndex !== -1 ? cIndex : text.length).trim();
        }
        if (cIndex !== -1) {
            c = text.substring(cIndex + 3, dIndex !== -1 ? dIndex : text.length).trim();
        }
        if (dIndex !== -1) {
            d = text.substring(dIndex + 3).trim();
        }
        return { question, a, b, c, d };
    }
    return { question: text };
}

export default async function GrammarBank({ filter = 'mistakes', partFilter }: { filter?: string, partFilter?: string }) {
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
				<div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">Tính năng dành cho {requiredTier}</h3>
				<p className="text-slate-500 max-w-sm mx-auto mb-6">
					Nâng cấp tài khoản {requiredTier} để mở khoá tính năng Sổ Tay độc quyền và lưu trữ không giới hạn các câu hỏi khó.
				</p>
				<Link href="/upgrade" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-bold rounded-xl shadow-md hover:from-amber-500 hover:to-amber-600 transition-all">
					Nâng Cấp Ngay
				</Link>
			</div>
		);
	}

	const isMistakes = filter === 'mistakes';

    let items: any[] = [];

    if (isMistakes) {
        const answers = await prisma.toeicAnswer.findMany({
            where: { 
                userId: session.user.id,
                isCorrect: false,
                question: {
                    lesson: {
                        topic: {
                            type: 'GRAMMAR'
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
            take: 200 // reasonable limit to prevent performance issues
        });
        
        // Remove duplicates if any (though ToeicAnswer is unique by userId_questionId)
        items = answers;
    } else {
        const bookmarks = await prisma.toeicQuestionBookmark.findMany({
            where: { 
                userId: session.user.id,
                question: {
                    lesson: {
                        topic: {
                            type: 'GRAMMAR'
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

	if (items.length === 0) {
		return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">
                    {isMistakes ? "Tuyệt vời! Bạn chưa có câu làm sai nào" : "Chưa có câu hỏi nào được lưu"}
                </h3>
				<p className="text-slate-500 max-w-sm mx-auto">
                    {isMistakes 
                        ? "Hệ thống sẽ tự động lưu lại những câu hỏi bạn làm sai để tiện ôn tập lại sau này." 
                        : "Khi làm bài tập Ngữ Pháp, hãy bấm vào icon Bookmark để lưu lại những câu khó hoặc hay nhé."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{items.map((item) => {
				const q = item.question;
                const parsedTrans = parseTranslation(q.translation);
				return (
					<Link 
						key={q.id}
						href={`/toeic-practice/grammar/${q.lesson.topic.slug}?lessonId=${q.lesson.id}&reviewId=${q.id}`}
						className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group relative"
					>
                        {isMistakes && item.selectedOption && (
                            <div className="absolute top-4 right-4 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 opacity-90 text-[10px] font-bold">
                                CÂU SAI
                            </div>
                        )}
                        {!isMistakes && (
                            <div className="absolute top-4 right-4 text-amber-500 bg-amber-50 p-1.5 rounded-lg border border-amber-200 opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                            </div>
                        )}
						
                        <div className="flex items-center gap-2 mb-3">
							<span className="text-xs font-black px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md whitespace-nowrap border border-indigo-200/50">
								{q.lesson.topic.title}
							</span>
                            <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md whitespace-nowrap border border-slate-300/50">
								{q.lesson.title}
							</span>
						</div>
						
                        <div className="mb-4 pr-8">
                            <p className="text-lg font-black text-slate-800 line-clamp-2 leading-snug">
                                {q.question}
                            </p>
                            {parsedTrans?.question && (
                                <p className="text-[13px] italic text-blue-700/80 mt-1 line-clamp-2 leading-snug font-medium">
                                    {parsedTrans.question}
                                </p>
                            )}
                        </div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm font-medium">
							<div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'A' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<div><span className="font-black mr-2 opacity-60">A</span> {q.optionA}</div>
                                {parsedTrans?.a && <div className="text-[12px] italic text-blue-700/70 font-normal leading-snug">{parsedTrans.a}</div>}
							</div>
							<div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'B' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<div><span className="font-black mr-2 opacity-60">B</span> {q.optionB}</div>
                                {parsedTrans?.b && <div className="text-[12px] italic text-blue-700/70 font-normal leading-snug">{parsedTrans.b}</div>}
							</div>
							<div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'C' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<div><span className="font-black mr-2 opacity-60">C</span> {q.optionC}</div>
                                {parsedTrans?.c && <div className="text-[12px] italic text-blue-700/70 font-normal leading-snug">{parsedTrans.c}</div>}
							</div>
							{q.optionD && (
							<div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'D' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
								<div><span className="font-black mr-2 opacity-60">D</span> {q.optionD}</div>
                                {parsedTrans?.d && <div className="text-[12px] italic text-blue-700/70 font-normal leading-snug">{parsedTrans.d}</div>}
							</div>
							)}
						</div>
                        
                        {(q.explanation) && (
                            <div className="mt-4 pt-3 border-t border-slate-100/60">
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
