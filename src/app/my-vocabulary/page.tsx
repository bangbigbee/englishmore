import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
	title: 'Sổ Từ Vựng - TOEIC Vocabulary Bank',
};

async function VocabularyBank() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect('/login');
	}

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
			<div className="text-center py-20 px-6">
				<h3 className="text-2xl font-black text-slate-800 mb-4">Chưa có từ vựng nào</h3>
				<p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
					Bạn chưa đánh dấu từ vựng nào trong quá trình luyện tập. Hãy quay lại phần luyện tập và chọn đánh dấu các từ vựng bạn muốn lưu lại nhé!
				</p>
				<Link href="/toeic-practice" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl">
					Quay Lại Luyện Tập TOEIC
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
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
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

export default async function VocabularyBankPage() {
	return (
		<main className="min-h-screen bg-slate-50/50 pb-20">
			<div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
							</div>
							<div>
								<h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Sổ Từ Vựng</h1>
								<p className="text-sm font-medium text-slate-500 mt-1">Ôn tập lại những từ vựng bạn đã đánh dấu</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link href="/toeic-practice" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 focus:outline-none">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
								Trở Lại Luyện Tập
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-0">
				<Suspense fallback={<div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div></div>}>
					<VocabularyBank />
				</Suspense>
			</div>
		</main>
	);
}
