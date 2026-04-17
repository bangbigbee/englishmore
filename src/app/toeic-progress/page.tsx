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

export const metadata = {
	title: 'Tiến Độ Của Tôi',
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function VocabularyBank({ topic, tagFilter }: { topic?: string, tagFilter?: string }) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	let orClause: any[] = [];
	if (tagFilter === 'learned') orClause.push({ isLearned: true });
	else if (tagFilter === 'hard') orClause.push({ isHard: true });
	else if (tagFilter === 'bookmarked') orClause.push({ isBookmarked: true });
	else {
		orClause = [{ isLearned: true }, { isHard: true }, { isBookmarked: true }];
	}

	const tags = await prisma.vocabularyTag.findMany({
		where: {
			userId: session.user.id,
			OR: orClause,
			...(topic && { vocabulary: { topic: topic } }),
		},
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

	if (tags.length === 0 && !topic && !tagFilter) {
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
					<div className="p-5 flex-1">
						<div className="flex justify-between items-start mb-3">
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
								{tag.vocabulary.topic}
							</span>
							<div className="flex gap-1.5">
								{tag.isHard && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs shadow-sm" title="Từ khó">🔥</span>}
								{tag.isBookmarked && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs shadow-sm" title="Đã lưu">⭐</span>}
								{tag.isLearned && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs shadow-sm" title="Đã thuộc">✓</span>}
							</div>
						</div>
						<h3 className="text-xl font-black text-slate-800 mb-1">{tag.vocabulary.word}</h3>
						{tag.vocabulary.phonetic && <p className="text-sm text-slate-500 font-medium font-mono mb-4">{tag.vocabulary.phonetic}</p>}
						<p className="font-semibold text-slate-700 leading-relaxed">{tag.vocabulary.meaning}</p>
						{tag.vocabulary.example && (
							<p className="mt-3 text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">{tag.vocabulary.example}</p>
						)}
					</div>
				</Link>
			))}
				</div>
			)}
		</div>
	);
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

export default async function ToeicProgressPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string, topic?: string, tag?: string, filter?: string }>;
}) {
	const resolvedParams = await searchParams;
	const activeTab = resolvedParams.tab || 'reports';
	const topicFilter = resolvedParams.topic;
	const tagFilter = resolvedParams.tag;
	const qbFilter = resolvedParams.filter || 'mistakes';
	
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
									<VocabularyBank topic={topicFilter} tagFilter={tagFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'grammar' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div></div>}>
									<GrammarBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'reports' && (
							<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div></div>}>
								<ReportsWrapper />
							</Suspense>
						)}
						{activeTab === 'listening' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div></div>}>
									<ListeningBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'reading' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div></div>}>
									<ReadingBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
						{activeTab === 'actual-test' && (
							<div>
                                <QuestionBankFilter />
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div></div>}>
									<ActualTestBank filter={qbFilter} />
								</Suspense>
							</div>
						)}
					</div>
			</div>
		</main>
	);
}
