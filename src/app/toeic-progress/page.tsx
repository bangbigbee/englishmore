import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import VocabularyFilter from "./VocabularyFilter";
import ReportsWrapper from "./ReportsWrapper";
import GrammarBank from "./GrammarBank";
import ReadingBank from "./ReadingBank";
import ListeningBank from "./ListeningBank";
import ActualTestBank from "./ActualTestBank";
import ProgressNavigation from "./ProgressNavigation";
import QuestionBankFilter from "./QuestionBankFilter";
import PersonalNoteUI from "./PersonalNoteUI";

export const metadata = {
	title: 'Tiến Độ Của Tôi',
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function VocabularyBank({ topic, tagFilter, query }: { topic?: string, tagFilter?: string, query?: string }) {
    try {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	let orClause: any[] = [];
	if (tagFilter === 'learned') orClause.push({ isLearned: true });
	else if (tagFilter === 'hard') orClause.push({ isHard: true });
	else if (tagFilter === 'bookmarked') orClause.push({ isBookmarked: true });
	else {
		orClause = [{ isLearned: true }, { isHard: true }, { isBookmarked: true }];
	}

    let whereClause: any = {
        userId: session.user.id,
        OR: orClause,
        ...(topic && { vocabulary: { topic: topic } }),
    };

    if (query) {
        whereClause.vocabulary = {
            ...whereClause.vocabulary,
            OR: [
                { word: { contains: query, mode: 'insensitive' } },
                { meaning: { contains: query, mode: 'insensitive' } }
            ]
        };
    }

	const tags = await prisma.vocabularyTag.findMany({
		where: whereClause,
		include: {
			vocabulary: true
		},
		orderBy: {
			updatedAt: 'desc'
		}
	});

	// Get all available topics from user's tags for filter dropdown
	const allUserTags = await prisma.vocabularyTag.findMany({
		where: { userId: session.user.id, OR: [{ isLearned: true }, { isHard: true }, { isBookmarked: true }] },
		include: { vocabulary: { select: { topic: true } } }
	});
	const uniqueTopics = Array.from(new Set(allUserTags.map(t => t.vocabulary.topic))).sort();

	if (tags.length === 0 && !topic && !tagFilter && !query) {
		return (
			<div className="text-center py-20 px-6 bg-white rounded-2xl border border-slate-200">
				<h3 className="text-2xl font-black text-slate-800 mb-4">Chưa có từ vựng nào</h3>
				<p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
					Bạn chưa đánh dấu từ vựng nào trong quá trình luyện tập. Hãy quay lại phần luyện tập và chọn đánh dấu các từ vựng bạn muốn lưu lại nhé!
				</p>
				<Link href="/toeic-practice?tab=vocabulary" className="inline-flex items-center justify-center rounded-xl bg-[#14532d] px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#166534] hover:shadow-xl">
					Trở lại luyện từ
				</Link>
			</div>
		);
	}

	return (
		<div>
			<VocabularyFilter topics={uniqueTopics} />

			{tags.length === 0 ? (
				<div className="text-center py-12 px-6 bg-yellow-50/50 rounded-2xl border border-yellow-100 border-dashed">
					<p className="text-slate-500 font-medium">Không tìm thấy từ vựng nào khớp với bộ lọc điều kiện trên.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{tags.map(tag => (
				<Link 
					key={tag.id} 
					href={`/toeic-practice?tab=vocabulary&topic=${encodeURIComponent(tag.vocabulary.topic)}&wordId=${tag.vocabId}`}
					className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-green-300 transition-all cursor-pointer relative"
				>
					<div className="p-4 flex-1 flex flex-col">
						<div className="flex justify-between items-start mb-2">
							<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 uppercase tracking-wider line-clamp-1 max-w-[180px]" title={tag.vocabulary.topic}>
								{tag.vocabulary.topic.split('-')[0].split('(')[0].trim()}
							</span>
							<div className="flex gap-1">
								{tag.isHard && (
									<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shadow-sm" title="Từ khó">
										<span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.3)]" />
									</span>
								)}
								{tag.isBookmarked && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-[#ea980c] border border-amber-100 text-[10px] shadow-sm" title="Câu đã lưu">⭐</span>}
								{tag.isLearned && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] uppercase font-black shadow-sm" title="Đã thuộc">✓</span>}
							</div>
						</div>
						<div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
							<h3 className="text-[19px] font-black text-slate-800">{tag.vocabulary.word}</h3>
							{tag.vocabulary.phonetic && <span className="text-[13px] text-slate-500 font-medium font-mono">{tag.vocabulary.phonetic}</span>}
						</div>
						<p className="font-semibold text-slate-700 text-[13px] leading-relaxed">{tag.vocabulary.meaning}</p>
						{tag.vocabulary.example && (
							<p className="mt-2 text-[12px] text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">{tag.vocabulary.example}</p>
						)}

                        {/* Personal Notes UI */}
                        <div className="mt-auto pt-2 border-t border-slate-100 relative z-10">
                            <PersonalNoteUI tagId={tag.id} initialNote={tag.personalNote} />
                        </div>
					</div>
				</Link>
			))}
				</div>
			)}
		</div>
	);
    } catch (error: any) {
        return (
            <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-200">
                <h3 className="font-bold text-lg mb-2">Lỗi tải dữ liệu (VocabularyBank):</h3>
                <pre className="whitespace-pre-wrap text-sm break-words opacity-80">{error.stack || error.message || String(error)}</pre>
            </div>
        );
    }
}

function ComingSoonPlaceholder({ title, icon }: { title: string, icon: string }) {
	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
			<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-slate-100">
				{icon}
			</div>
			<h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
			<p className="text-slate-500 max-w-sm mx-auto">
				Chuyên mục này đang được xây dựng và sẽ sớm ra mắt trong bản cập nhật tới.
			</p>
			<Link href="/toeic-practice" className="mt-8 inline-block text-[#14532d] font-bold hover:text-[#166534]">
				← Quay lại trang luyện tập
			</Link>
		</div>
	);
}

export default async function ToeicProgressPage(props: any) {
    try {
	const resolvedParams = await props.searchParams;
	const activeTab = resolvedParams.tab || 'reports';
	const topicFilter = resolvedParams.topic;
	const tagFilter = resolvedParams.tag;
	const qbFilter = resolvedParams.filter || 'mistakes';
    const qFilterArray = resolvedParams.q;
    const qFilter = Array.isArray(qFilterArray) ? qFilterArray[0] : qFilterArray;
	
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect('/login');
	}

	return (
		<main className="min-h-screen bg-slate-50/50">
			<div className="max-w-7xl mx-auto pt-6 pb-12 px-4 sm:px-6 flex flex-col md:flex-row gap-6 lg:gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 lg:w-72 shrink-0">
                    <Suspense fallback={<div className="h-64 w-full animate-pulse bg-white border border-slate-200 rounded-2xl mb-8 shadow-sm"></div>}>
                        <ProgressNavigation activeTab={activeTab} />
                    </Suspense>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
						{activeTab === 'vocabulary-bank' && (
							<div>
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div></div>}>
									<VocabularyBank topic={topicFilter} tagFilter={tagFilter} query={qFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'grammar-bank' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div></div>}>
									<GrammarBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
						{activeTab?.startsWith('reports') && (
							<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div></div>}>
								<ReportsWrapper defaultSubTab={activeTab.replace('reports-', '')} />
							</Suspense>
						)}
						{activeTab === 'listening-bank' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div></div>}>
									<ListeningBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'reading-bank' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div></div>}>
									<ReadingBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'actual-test-bank' && (
							<div>
                                <QuestionBankFilter showHistory={true} />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div></div>}>
									<ActualTestBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
					</div>
			</div>
		</main>
	);
    } catch (e: any) {
        return (
            <main className="min-h-screen bg-slate-50/50 p-12">
                <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-200 shadow-sm max-w-3xl mx-auto">
                    <h3 className="font-bold text-lg mb-2">Lỗi Server Nghiêm Trọng (ToeicProgressPage):</h3>
                    <pre className="whitespace-pre-wrap text-sm break-words opacity-80 font-mono bg-white/50 p-4 rounded-xl mt-4">
                        {e?.stack || e?.message || String(e)}
                    </pre>
                </div>
            </main>
        );
    }
}
