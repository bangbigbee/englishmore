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
	const [flipIndex, setFlipIndex] = useState<number | null>(null);
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
		setFlipIndex(null);
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
										<span className="inline-block w-3.5 h-3.5 text-amber-500">⭐</span>
										<span className="text-amber-600 font-semibold text-[11px]">ULTRA</span>
										<span className="text-gray-400 text-[11px]">— Collocations, Synonyms, Antonyms &amp; TOEIC Traps</span>
									</div>
								</div>
								<div className="flex justify-end mt-3">
									<button className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors cursor-pointer">
										Xem flashcard →
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
	const lockedCount = totalWords - vocabItems.length;

	return (
		<div>
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<button
					onClick={() => { setSelectedTopic(null); setVocabItems([]); }}
					className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
				>
					← Quay lại
				</button>
				<h2 className="text-lg font-bold text-green-900">📙 {selectedTopic}</h2>
				{!isUltra && (
					<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
						⭐ ULTRA — Mở khoá đầy đủ
					</span>
				)}
			</div>

			{vocabLoading ? (
				<div className="py-12 text-center text-gray-400 italic">Đang tải từ vựng...</div>
			) : (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{vocabItems.map((item, idx) => (
							<div
								key={item.id}
								onClick={() => setFlipIndex(flipIndex === idx ? null : idx)}
								className="group relative cursor-pointer rounded-2xl border-2 border-green-900/20 bg-white shadow-sm hover:shadow-lg hover:border-[#14532d]/60 transition-all duration-200 overflow-hidden"
							>
								{/* Front */}
								<div className="p-5">
									<div className="flex items-start justify-between gap-2 mb-2">
										<div className="font-bold text-xl text-green-900">{item.word}</div>
										{item.phonetic && (
											<span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 shrink-0 font-mono">{item.phonetic}</span>
										)}
									</div>
									<div className="text-sm text-[#14532d] font-semibold mb-1">{item.meaning}</div>
									{item.englishDefinition && (
										<div className="text-xs text-gray-500 italic mb-2">{item.englishDefinition}</div>
									)}
									{item.example && (
										<div className="text-xs text-gray-600 border-t pt-2 mt-2 leading-relaxed">
											<span className="font-semibold text-gray-400">Ví dụ: </span>{item.example}
										</div>
									)}

									{/* Expanded details on click */}
									{flipIndex === idx && (
										<div className="mt-3 space-y-2 border-t pt-3">
											{item.collocations && (
												<div className="text-xs">
													<span className="font-bold text-purple-700">Collocations: </span>
													<span className="text-gray-700">{item.collocations}</span>
												</div>
											)}
											{item.synonyms && (
												<div className="text-xs">
													<span className="font-bold text-blue-700">Synonyms: </span>
													<span className="text-gray-700">{item.synonyms}</span>
												</div>
											)}
											{item.antonyms && (
												<div className="text-xs">
													<span className="font-bold text-red-600">Antonyms: </span>
													<span className="text-gray-700">{item.antonyms}</span>
												</div>
											)}
											{item.toeicTrap && (
												<div className="text-xs rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
													<span className="font-bold text-amber-700">⚠ TOEIC Trap: </span>
													<span className="text-amber-800">{item.toeicTrap}</span>
												</div>
											)}
										</div>
									)}
								</div>

								{/* Expand hint */}
								<div className="absolute bottom-2 right-3 text-[10px] text-gray-400 group-hover:text-[#ea980c] transition-colors">
									{flipIndex === idx ? 'Thu gọn ↑' : 'Xem chi tiết ↓'}
								</div>
							</div>
						))}

						{/* Locked placeholder cards */}
						{!isUltra && lockedCount > 0 && Array.from({ length: Math.min(lockedCount, 3) }).map((_, i) => (
							<div
								key={`locked-${i}`}
								onClick={() => setShowUpgrade(true)}
								className="relative rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-amber-50 transition min-h-[160px]"
							>
								<div className="text-3xl">🔒</div>
								<div className="text-sm font-bold text-amber-700 text-center">
									{i === 0 ? `+${lockedCount} từ bị khoá` : ''}
								</div>
								<div className="text-xs text-amber-600 text-center">Nâng cấp ULTRA để mở khoá collocations, synonyms &amp; TOEIC traps</div>
							</div>
						))}
					</div>

					{/* Upgrade CTA banner */}
					{!isUltra && lockedCount > 0 && (
						<div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
							<div>
								<p className="font-bold text-base">🚀 Nâng cấp ULTRA để mở khoá {lockedCount} từ còn lại!</p>
								<p className="text-sm text-amber-100 mt-1">Bao gồm Collocations, Synonyms, Antonyms và TOEIC Traps của từng từ.</p>
							</div>
							<button
								onClick={() => setShowUpgrade(true)}
								className="shrink-0 rounded-xl bg-white text-amber-600 font-bold px-6 py-2.5 text-sm hover:bg-amber-50 transition shadow"
							>
								Nâng cấp ngay →
							</button>
						</div>
					)}
				</>
			)}

			{/* Upgrade modal */}
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

