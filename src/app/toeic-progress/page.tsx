import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
	title: 'Tiến Độ Của Tôi',
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function VocabularyBank() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) return null;

	const tags = await prisma.vocabularyTag.findMany({
		where: {
			userId: session.user.id,
			OR: [
				{ isLearned: true },
				{ isHard: true },
				{ isBookmarked: true }
			]
		},
		include: {
			vocabulary: true
		},
		orderBy: {
			updatedAt: 'desc'
		}
	});

	if (tags.length === 0) {
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
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{tags.map(tag => (
				<div key={tag.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
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
				</div>
			))}
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

const TABS = [
	{ id: 'vocabulary-bank', label: 'Sổ Từ Vựng', icon: '📔' },
	{ id: 'grammar', label: 'Tiến độ Ngữ Pháp', icon: '📝' },
	{ id: 'vocabulary', label: 'Tiến độ Từ Vựng', icon: '🎯' },
	{ id: 'listening', label: 'Tiến độ Listening', icon: '🎧' },
	{ id: 'reading', label: 'Tiến độ Reading', icon: '📖' },
	{ id: 'actual-test', label: 'Đề Thi Thực Tế', icon: '🎓' },
];

export default async function ToeicProgressPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const resolvedParams = await searchParams;
	const activeTab = resolvedParams.tab || 'vocabulary-bank';
	
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect('/login');
	}

	return (
		<main className="min-h-screen bg-slate-50 pb-20">
			<div className="bg-[#14532d] text-white pt-10 pb-10 shadow-inner">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-6">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
								<span className="text-3xl">📈</span>
							</div>
							<div>
								<h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">Tiến Độ Của Tôi</h1>
								<p className="text-green-100 font-medium mt-1 opacity-90 overflow-hidden text-ellipsis whitespace-nowrap max-w-sm">Học viên {session.user?.name || session.user?.email || ''}</p>
							</div>
						</div>
						<Link href="/toeic-practice" className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 focus:outline-none">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
							Quay lại học
						</Link>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Sidebar Navigation */}
					<div className="w-full lg:w-72 shrink-0">
						<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
							<div className="p-4 border-b border-slate-100 bg-slate-50/50">
								<h2 className="font-bold text-slate-600 text-sm uppercase tracking-wider">Danh mục tiến độ</h2>
							</div>
							<nav className="p-3">
								<ul className="space-y-1">
									{TABS.map(tab => {
										const isActive = activeTab === tab.id;
										return (
											<li key={tab.id}>
												<Link 
													href={`/toeic-progress?tab=${tab.id}`}
													className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
														isActive 
															? 'bg-green-50 text-green-700' 
															: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
													}`}
												>
													<span className="text-xl">{tab.icon}</span>
													{tab.label}
												</Link>
											</li>
										);
									})}
								</ul>
							</nav>
						</div>
					</div>

					{/* Main Content Area */}
					<div className="flex-1">
						{activeTab === 'vocabulary-bank' && (
							<div>
								<div className="mb-6">
									<h2 className="text-2xl font-black text-slate-800">Sổ Từ Vựng Của Bạn</h2>
									<p className="text-slate-500 font-medium mt-1">Danh sách các từ vựng bạn đã đánh dấu ưu tiên học</p>
								</div>
								<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div></div>}>
									<VocabularyBank />
								</Suspense>
							</div>
						)}
						{activeTab === 'grammar' && <ComingSoonPlaceholder title="Tiến Độ Ngữ Pháp" icon="📝" />}
						{activeTab === 'vocabulary' && <ComingSoonPlaceholder title="Tiến Độ Từ Vựng" icon="🎯" />}
						{activeTab === 'listening' && <ComingSoonPlaceholder title="Tiến Độ Listening" icon="🎧" />}
						{activeTab === 'reading' && <ComingSoonPlaceholder title="Tiến Độ Reading" icon="📖" />}
						{activeTab === 'actual-test' && <ComingSoonPlaceholder title="Tiến Độ Đề Thực Tế" icon="🎓" />}
					</div>
				</div>
			</div>
		</main>
	);
}
