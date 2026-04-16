import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GrammarBank() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	const bookmarks = await prisma.toeicQuestionBookmark.findMany({
		where: { userId: session.user.id },
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
		orderBy: { createdAt: 'desc' }
	});

	if (bookmarks.length === 0) {
		return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có câu hỏi nào được lưu</h3>
				<p className="text-slate-500 max-w-sm mx-auto">
					Khi làm bài tập Ngữ Pháp, hãy bấm vào icon Bookmark để lưu lại những câu khó hoặc hay nhé.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{bookmarks.map((bookmark) => {
				const q = bookmark.question;
				return (
					<Link 
						key={q.id}
						href={`/toeic-practice/grammar/${q.lesson.topic.slug}`}
						className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group relative"
					>
                        <div className="absolute top-4 right-4 text-amber-500 bg-amber-50 p-1.5 rounded-lg border border-amber-200 opacity-80 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                        </div>
						
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
