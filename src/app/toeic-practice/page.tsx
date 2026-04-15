"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UpgradeModal from "@/components/UpgradeModal";


const TABS = [
	{ key: "grammar", label: "Grammar" },
	{ key: "vocabulary", label: "Vocabulary" },
	{ key: "listening", label: "Listening" },
	{ key: "reading", label: "Reading" },
	{ key: "actual-test", label: "Actual Test" },
];

function ToeicPracticeContent() {
	const [tab, setTab] = useState("grammar");
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { data: session } = useSession();

	const openLoginModal = (destination?: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('login', 'true');
		params.set('allowGuest', 'true');
		params.set('subtitle', 'Đăng nhập để lưu và theo dõi tiến độ học tập');
		params.set('callbackUrl', destination || pathname);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div className="max-w-6xl mx-auto py-2 px-2 sm:px-6">
			<div className="flex gap-2 sm:gap-4 border-b mb-8 overflow-x-auto">
				{TABS.map((t) => (
					<button
						key={t.key}
						className={`px-4 py-2 sm:px-6 sm:py-3 font-semibold border-b-2 transition-colors duration-200 focus:outline-none cursor-pointer ${tab === t.key ? "border-[#14532d] text-[#14532d] bg-white" : "border-transparent text-gray-500 hover:text-[#14532d]"}`}
						onClick={() => setTab(t.key)}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="mt-6">
				 {tab === "grammar" && <ToeicGrammarTab onPracticeClick={(slug) => {
					 if (!session) {
						 openLoginModal(slug ? `/toeic-practice/grammar/${slug}` : undefined);
					 } else if (slug) {
						 router.push(`/toeic-practice/grammar/${slug}`);
					 }
				 }} />}
				{tab === "vocabulary" && <ToeicVocabularyTab onPracticeClick={() => {
					 if (!session) openLoginModal();
				 }} />}
				{tab === "listening" && <ToeicListeningTab onPracticeClick={() => {
					 if (!session) openLoginModal();
				 }} />}
				{tab === "reading" && <ToeicReadingTab onPracticeClick={() => {
					 if (!session) openLoginModal();
				 }} />}
				{tab === "actual-test" && <ToeicActualTestTab onPracticeClick={() => {
					 if (!session) openLoginModal();
				 }} />}
			</div>
		</div>
	);
}

function ToeicGrammarTab({ onPracticeClick }: { onPracticeClick: (slug?: string) => void }) {
	const [topics, setTopics] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/grammar');
				if (res.ok) {
					const data = await res.json();
					setTopics(data);
				}
			} catch (error) {
				console.error('Failed to fetch topics:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTopics();
	}, []);

	if (loading) {
		return <div className="py-12 text-center text-gray-500 italic">Đang tải các chủ đề...</div>;
	}

	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">📘</span>
				Các chủ đề ngữ pháp
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{topics.length === 0 ? (
					<div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
						Chưa có chủ đề nào được cập nhật.
					</div>
				) : (
					topics.map((topic) => (
						<div
							key={topic.id}
							onClick={() => onPracticeClick(topic.slug)}
							className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
						>
							<div>
								<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{topic.title}</div>
								<div className="text-sm text-gray-500 mb-2">{topic.subtitle || 'Ngữ pháp TOEIC'}</div>
								<div className="text-xs text-gray-400 mb-2">
									{topic._count?.lessons || 0} bài học bài bản
								</div>
							</div>
							<div className="flex justify-end">
								<button
									className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors cursor-pointer"
									onClick={() => onPracticeClick(topic.slug)}
								>
									Luyện tập &rarr;
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

function ToeicVocabularyTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const { data: session } = useSession();
	const [topics, setTopics] = useState<{ topic: string; wordCount: number }[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
	const [vocabItems, setVocabItems] = useState<any[]>([]);
	const [isUltra, setIsUltra] = useState(false);
	const [totalWords, setTotalWords] = useState(0);
	const [vocabLoading, setVocabLoading] = useState(false);
	const [cardIndex, setCardIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [showUpgrade, setShowUpgrade] = useState(false);

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/vocabulary/topics');
				if (res.ok) {
					const data = await res.json();
					setTopics(data.topics || []);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchTopics();
	}, []);

	const openTopic = async (topic: string) => {
		if (!session) { onPracticeClick(); return; }
		setSelectedTopic(topic);
		setVocabLoading(true);
		setCardIndex(0);
		setIsFlipped(false);
		try {
			const res = await fetch(`/api/toeic/vocabulary?topic=${encodeURIComponent(topic)}`);
			if (res.ok) {
				const data = await res.json();
				setVocabItems(data.items || []);
				setIsUltra(data.isUltra ?? false);
				setTotalWords(data.total ?? 0);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setVocabLoading(false);
		}
	};

	const moveCard = (dir: 'prev' | 'next') => {
		setIsFlipped(false);
		setTimeout(() => {
			setCardIndex((prev) =>
				dir === 'next'
					? Math.min(prev + 1, vocabItems.length - 1)
					: Math.max(prev - 1, 0)
			);
		}, 150);
	};

	// ── Topic list ──────────────────────────────────────────
	if (!selectedTopic) {
		return (
			<div>
				<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
					<span>📙</span>
					Các chủ đề từ vựng TOEIC
				</h2>

				{loading ? (
					<div className="py-12 text-center text-gray-400 italic">Đang tải chủ đề...</div>
				) : topics.length === 0 ? (
					<div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
						Chưa có chủ đề từ vựng nào. Admin cần import từ tab TOEIC.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{topics.map((t) => (
							<div
								key={t.topic}
								onClick={() => openTopic(t.topic)}
								className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
							>
								<div className="absolute top-0 right-0 bg-[#ea980c] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg">
									{t.wordCount} từ
								</div>
								<div>
									<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1 pr-14">{t.topic}</div>
									<div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
										<span className="text-amber-500">⭐</span>
										<span className="text-amber-600 font-semibold text-[11px]">ULTRA</span>
										<span className="text-gray-400 text-[11px]">— Collocations, Synonyms, Antonyms &amp; Bẫy TOEIC</span>
									</div>
								</div>
								<div className="flex justify-end mt-3">
									<button className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors cursor-pointer">
										Học flashcard →
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	// ── Flashcard view ──────────────────────────────────────
	const currentItem = vocabItems[cardIndex];
	const lockedCount = totalWords - vocabItems.length;
	const hasPremium = currentItem && (currentItem.collocations || currentItem.synonyms || currentItem.antonyms || currentItem.toeicTrap);

	return (
		<div>
			{/* Header */}
			<div className="flex flex-wrap items-center gap-3 mb-6">
				<button
					onClick={() => { setSelectedTopic(null); setVocabItems([]); }}
					className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
				>
					← Quay lại
				</button>
				<h2 className="text-base font-bold text-green-900">📙 {selectedTopic}</h2>

			</div>

			{vocabLoading ? (
				<div className="py-12 text-center text-gray-400 italic">Đang tải từ vựng...</div>
			) : vocabItems.length === 0 ? (
				<div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">Không có từ vựng nào.</div>
			) : (
				<div className="space-y-5">
					{/* Nav controls */}
					<div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 p-2 border border-slate-200 shadow-sm">
						<button
							type="button"
							onClick={() => moveCard('prev')}
							disabled={cardIndex === 0}
							className="rounded-lg bg-white shadow-xs px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:shadow-none"
						>
							Prev
						</button>

						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-semibold text-slate-600">
								{cardIndex + 1} / {totalWords}
							</span>
							{!isUltra && lockedCount > 0 && (
								<span className="text-[10px] text-amber-600 font-medium">
									🔒 {lockedCount} từ bị khoá
								</span>
							)}
						</div>

						<button
							type="button"
							onClick={() => moveCard('next')}
							disabled={cardIndex >= vocabItems.length - 1}
							className="rounded-lg bg-white shadow-xs px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:shadow-none"
						>
							Next
						</button>
					</div>

					{/* 3D Flip Card — same structure as homepage */}
					{currentItem && (
						<div className="relative w-full h-[360px] sm:h-[480px] [perspective:1200px]">
							<div
								className={`relative h-full w-full rounded-2xl shadow-lg transition-transform duration-500 ease-out [transform-style:preserve-3d] cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
								onClick={() => setIsFlipped(!isFlipped)}
							>
								{/* ── FRONT FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] bg-linear-to-br from-[#14532d] via-[#115e3b] to-[#064e3b] p-6 text-white flex flex-col items-center justify-center">
									<span className="absolute top-4 right-5 text-xs font-semibold uppercase tracking-wider text-white/50 bg-white/10 px-3 py-1 rounded-full pointer-events-none">
										Nhấn để lật
									</span>
									<p className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm text-center">
										{currentItem.word}
									</p>
									{currentItem.phonetic && (
										<p className="mt-4 text-lg text-white/60 font-medium font-mono">{currentItem.phonetic}</p>
									)}
									<p className="mt-8 text-sm text-white/50 font-medium tracking-wide">
										Chủ đề: {selectedTopic}
									</p>
								</div>

								{/* ── BACK FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-2 border-[#14532d]/20 p-5 sm:p-7 text-slate-800 flex flex-col shadow-[inset_0_0_20px_rgba(20,83,45,0.02)] overflow-y-auto overflow-x-hidden">
									<span className="absolute top-4 right-5 text-xs font-semibold uppercase tracking-wider text-[#14532d]/50 bg-[#14532d]/5 px-3 py-1 rounded-full pointer-events-none">
										Nhấn để lật
									</span>

									{/* Basic info — always visible */}
									<div className="flex-1 flex flex-col items-center justify-start text-center w-full pt-2">
										<p className="text-2xl sm:text-3xl font-bold text-[#14532d]">{currentItem.word}</p>
										{currentItem.phonetic && (
											<p className="mt-1 text-base text-slate-400 font-mono">{currentItem.phonetic}</p>
										)}

										<div className="mt-4 mb-4 w-12 h-1 bg-[#14532d]/20 rounded-full mx-auto shrink-0" />

										<p className="text-xl sm:text-2xl font-bold text-slate-800">{currentItem.meaning}</p>
										{currentItem.englishDefinition && (
											<p className="mt-2 text-sm text-slate-500 font-medium px-2 italic">{currentItem.englishDefinition}</p>
										)}

										{currentItem.example && (
											<div className="mt-5 w-full rounded-xl bg-slate-50 p-4 border border-slate-200 flex-shrink-0 relative overflow-hidden text-left">
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14532d]/40" />
												<p className="text-sm italic text-slate-700 font-medium px-2">
													<span className="font-bold text-[#14532d] not-italic mr-2">EX:</span>
													{currentItem.example}
												</p>
											</div>
										)}

										{/* ── PREMIUM ZONE ── */}
										{isUltra && hasPremium && (
											<div className="mt-5 w-full flex-shrink-0 space-y-3 text-sm text-left border-t border-slate-100 pt-4">
												{currentItem.synonyms && (
													<div>
														<p className="font-bold text-[#14532d] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
															Synonyms
														</p>
														<p className="text-slate-700 font-medium pl-5">{currentItem.synonyms}</p>
													</div>
												)}
												{currentItem.antonyms && (
													<div>
														<p className="font-bold text-rose-600 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
															Antonyms
														</p>
														<p className="text-slate-700 font-medium pl-5">{currentItem.antonyms}</p>
													</div>
												)}
												{currentItem.collocations && (
													<div>
														<p className="font-bold text-purple-700 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
															Collocations
														</p>
														<p className="text-slate-700 font-medium pl-5">{currentItem.collocations}</p>
													</div>
												)}
												{currentItem.toeicTrap && (
													<div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
														<p className="font-bold text-rose-600 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
															⚠ TOEIC Trap Alert
														</p>
														<p className="text-slate-700 font-medium pl-5 leading-relaxed">{currentItem.toeicTrap}</p>
													</div>
												)}
											</div>
										)}
										{!isUltra && (
											<button
												type="button"
												onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
												className="mt-5 text-xs text-amber-600 underline underline-offset-2 hover:text-amber-700 transition cursor-pointer"
											>
												Nâng cấp ULTRA để xem đầy đủ Collocations, Synonyms, Antonyms &amp; Bẫy TOEIC
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					)}


				</div>
			)}

			{showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
		</div>
	);
}

function ToeicListeningTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const listeningParts = [
		{ title: "Part 1: Photographs", subtitle: "Mô tả tranh" },
		{ title: "Part 2: Question-Response", subtitle: "Hỏi đáp" },
		{ title: "Part 3: Conversations", subtitle: "Hội thoại ngắn" },
		{ title: "Part 4: Short Talks", subtitle: "Bài nói ngắn" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">🎧</span>
				Các phần thi Listening
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
				{listeningParts.map((part) => (
					<div
						key={part.title}
						onClick={onPracticeClick}
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
					>
						<div>
							<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{part.title}</div>
							<div className="text-sm text-gray-500 mb-2">{part.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end mt-4">
							<button
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors cursor-pointer"
								onClick={onPracticeClick}
							>
								Luyện tập &rarr;
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ToeicReadingTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const readingParts = [
		{ title: "Part 5: Incomplete Sentences", subtitle: "Điền vào câu trống" },
		{ title: "Part 6: Text Completion", subtitle: "Điền vào đoạn văn" },
		{ title: "Part 7: Reading Comprehension", subtitle: "Đọc hiểu" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">📖</span>
				Các phần thi Reading
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{readingParts.map((part) => (
					<div
						key={part.title}
						onClick={onPracticeClick}
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
					>
						<div>
							<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{part.title}</div>
							<div className="text-sm text-gray-500 mb-2">{part.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end mt-4">
							<button
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors cursor-pointer"
								onClick={onPracticeClick}
							>
								Luyện tập &rarr;
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ToeicActualTestTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const testPacks = [
		{ title: "ETS 2024", subtitle: "Bộ đề thi thực tế mới nhất 2024", count: "10 bài test" },
		{ title: "ETS 2023", subtitle: "Bộ đề thi thực tế năm 2023", count: "10 bài test" },
		{ title: "Hackers TOEIC", subtitle: "Bộ đề luyện tập nâng cao", count: "10 bài test" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">🎓</span>
				Đề thi thực tế (Actual Test)
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{testPacks.map((test) => (
					<div
						key={test.title}
						onClick={onPracticeClick}
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
					>
						<div className="absolute top-0 right-0 bg-[#ea980c] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
							{test.count}
						</div>
						<div className="pr-12">
							<div className="font-bold text-lg text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{test.title}</div>
							<div className="text-sm text-gray-500 mb-2">{test.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end mt-4">
							<button
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors bg-green-50 px-4 py-2 rounded-lg group-hover:bg-orange-50 cursor-pointer"
								onClick={onPracticeClick}
							>
								Bắt đầu thi &rarr;
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function ToeicHomePage() {
	return (
		<Suspense fallback={null}>
			<ToeicPracticeContent />
		</Suspense>
	);
}

