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

const normalizePronunciationText = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const calculateLevenshteinDistance = (left: string, right: string) => {
	const rows = left.length + 1;
	const cols = right.length + 1;
	const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
	for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
	for (let col = 0; col < cols; col += 1) matrix[0][col] = col;
	for (let row = 1; row < rows; row += 1) {
		for (let col = 1; col < cols; col += 1) {
			const substitutionCost = left[row - 1] === right[col - 1] ? 0 : 1;
			matrix[row][col] = Math.min(matrix[row - 1][col] + 1, matrix[row][col - 1] + 1, matrix[row - 1][col - 1] + substitutionCost);
		}
	}
	return matrix[left.length][right.length];
};

const calculateSimilarityScore = (target: string, candidate: string) => {
	if (!target && !candidate) return 100;
	const maxLength = Math.max(target.length, candidate.length);
	if (maxLength === 0) return 0;
	const distance = calculateLevenshteinDistance(target, candidate);
	return Math.max(0, Math.round((1 - distance / maxLength) * 100));
};

const getBestPronunciationCandidate = (target: string, transcript: string) => {
	const normalizedTarget = normalizePronunciationText(target);
	const normalizedTranscript = normalizePronunciationText(transcript);
	if (!normalizedTarget || !normalizedTranscript) return { candidate: normalizedTranscript, score: 0 };
	const targetTokenCount = normalizedTarget.split(' ').length;
	const transcriptTokens = normalizedTranscript.split(' ');
	const candidates = new Set<string>([normalizedTranscript]);
	transcriptTokens.forEach((token) => { if (token) candidates.add(token); });
	for (let windowSize = Math.max(1, targetTokenCount - 1); windowSize <= Math.min(transcriptTokens.length, targetTokenCount + 1); windowSize += 1) {
		for (let index = 0; index <= transcriptTokens.length - windowSize; index += 1) {
			candidates.add(transcriptTokens.slice(index, index + windowSize).join(' '));
		}
	}
	let bestCandidate = normalizedTranscript;
	let bestScore = 0;
	candidates.forEach((candidate) => {
		const score = calculateSimilarityScore(normalizedTarget, candidate);
		if (score > bestScore) {
			bestScore = score;
			bestCandidate = candidate;
		}
	});
	return { candidate: bestCandidate, score: bestScore };
};

const buildPronunciationFeedback = (score: number, candidate: string, target: string) => {
	if (score >= 95) return `Excellent. Your pronunciation matched "${target}" very closely.`;
	if (score >= 80) return `Good job. We heard "${candidate}", which is close to "${target}".`;
	if (score >= 60) return `Pretty close. We heard "${candidate}". Try slowing down and stressing each syllable more clearly.`;
	return `We heard "${candidate || 'something different'}". Listen again and repeat the word "${target}" more clearly.`;
};

const UltraTag = () => (
	<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-linear-to-r from-amber-400 via-yellow-200 to-amber-500 text-[9px] font-black text-amber-900 shadow-[0_0_8px_rgba(251,191,36,0.3)] border border-white/50">
		<svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
		ULTRA
	</span>
);

function ToeicVocabularyTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const { data: session } = useSession();
	const [topics, setTopics] = useState<{ topic: string; wordCount: number }[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
	const [vocabItems, setVocabItems] = useState<any[]>([]);
	const [isUltra, setIsUltra] = useState(false);
	const [isPro, setIsPro] = useState(false);
	const [topicProFields, setTopicProFields] = useState<string[]>([]);
	const [topicUltraFields, setTopicUltraFields] = useState<string[]>([]);
	const [totalWords, setTotalWords] = useState(0);
	const [vocabLoading, setVocabLoading] = useState(false);
	const [cardIndex, setCardIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [showUpgrade, setShowUpgrade] = useState(false);
	const [showExampleVi, setShowExampleVi] = useState(false);

	const [speechSupported, setSpeechSupported] = useState(false);
	const [isPronunciationListening, setIsPronunciationListening] = useState(false);
	const [pronunciationStatus, setPronunciationStatus] = useState('');
	const [pronunciationFeedback, setPronunciationFeedback] = useState('');
	const [pronunciationTranscript, setPronunciationTranscript] = useState('');
	const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
	const pronunciationScoringTimeoutRef = useRef<number | null>(null);
	const pronunciationListeningTimeoutRef = useRef<number | null>(null);
	const pronunciationFinalizeTimeoutRef = useRef<number | null>(null);
	const pronunciationRecognitionRef = useRef<any>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const win = window as any;
		setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));
	}, []);

	const clearPronunciationTimeouts = () => {
		if (typeof window === 'undefined') return;
		[pronunciationScoringTimeoutRef, pronunciationListeningTimeoutRef, pronunciationFinalizeTimeoutRef].forEach(ref => {
			if (ref.current) {
				window.clearTimeout(ref.current);
				ref.current = null;
			}
		});
	};

	useEffect(() => {
		return () => clearPronunciationTimeouts();
	}, []);

	const stopRecognition = () => {
		if (pronunciationRecognitionRef.current) {
			try {
				pronunciationRecognitionRef.current.stop();
			} catch {}
			pronunciationRecognitionRef.current = null;
		}
		setIsPronunciationListening(false);
	};

	const startVoicePractice = () => {
		const currentWord = vocabItems[cardIndex]?.word;
		if (!currentWord || typeof window === 'undefined') return;

		const win = window as any;
		const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
		if (!RecognitionCtor) return;

		setPronunciationStatus('Đang lắng nghe... Hãy đọc từ vựng ngay.');
		setPronunciationFeedback('');
		setPronunciationTranscript('');
		setPronunciationScore(null);
		setIsPronunciationListening(true);
		clearPronunciationTimeouts();
		stopRecognition();

		const recognition = new RecognitionCtor();
		pronunciationRecognitionRef.current = recognition;
		recognition.lang = 'en-US';
		recognition.interimResults = true;
		recognition.continuous = false;

		let hasHandledFinal = false;

		const finalize = (transcript: string) => {
			if (hasHandledFinal) return;
			hasHandledFinal = true;
			stopRecognition();
			const { candidate, score } = getBestPronunciationCandidate(currentWord, transcript);
			setPronunciationTranscript(transcript);
			setPronunciationStatus('Đã nhận giọng nói. Đang đánh giá...');
			
			pronunciationScoringTimeoutRef.current = window.setTimeout(() => {
				setPronunciationScore(score);
				setPronunciationFeedback(buildPronunciationFeedback(score, candidate, currentWord));
				setPronunciationStatus(score >= 80 ? 'Rất tốt! Hãy tiếp tục phát huy.' : 'Hãy thử lại một lần nữa nhé.');
			}, 500);
		};

		recognition.onresult = (event: any) => {
			const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(' ').trim();
			setPronunciationTranscript(transcript);
			if (event.results[0].isFinal) {
				finalize(transcript);
			} else {
				if (pronunciationFinalizeTimeoutRef.current) window.clearTimeout(pronunciationFinalizeTimeoutRef.current);
				pronunciationFinalizeTimeoutRef.current = window.setTimeout(() => finalize(transcript), 1000);
			}
		};

		recognition.onerror = () => {
			stopRecognition();
			setPronunciationStatus('Không thể nhận dạng giọng nói. Hãy thử lại nơi yên tĩnh hơn.');
		};

		recognition.onend = () => setIsPronunciationListening(false);
		recognition.start();

		// Timeout if no result within 7s
		pronunciationListeningTimeoutRef.current = window.setTimeout(() => {
			if (isPronunciationListening) {
				stopRecognition();
				setPronunciationStatus('Hết thời gian chờ. Xin hãy thử lại.');
			}
		}, 7000);
	};

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
		setShowExampleVi(false);
		try {
			const res = await fetch(`/api/toeic/vocabulary?topic=${encodeURIComponent(topic)}`);
			if (res.ok) {
				const data = await res.json();
				setVocabItems(data.items || []);
				setIsUltra(data.isUltra ?? false);
				setIsPro(data.isPro ?? false);
				try {
					setTopicProFields(JSON.parse(data.topicConfig?.proFields || "[]"));
					setTopicUltraFields(JSON.parse(data.topicConfig?.ultraFields || "[]"));
				} catch {
					setTopicProFields([]);
					setTopicUltraFields([]);
				}
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
		setShowExampleVi(false);
		setPronunciationStatus('');
		setPronunciationScore(null);
		setPronunciationFeedback('');
		stopRecognition();
		setTimeout(() => {
			setCardIndex((prev) =>
				dir === 'next'
					? Math.min(prev + 1, vocabItems.length - 1)
					: Math.max(prev - 1, 0)
			);
		}, 150);
	};

	const playPronunciation = (e: React.MouseEvent, word: string) => {
		e.stopPropagation();
		if (typeof window === 'undefined' || !window.speechSynthesis) return;

		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(word);
		utterance.lang = 'en-US';
		utterance.rate = 0.9;
		
		const voices = window.speechSynthesis.getVoices();
		const preferredVoiceNames = ['Samantha', 'Daniel', 'Alex', 'Google', 'Jenny', 'Guy', 'Christopher', 'Eric', 'Aria', 'Davis', 'Roger', 'Joey', 'Matthew', 'Salli', 'Ivy', 'Kevin'];
		const americanVoice = voices.find((voice) => voice.name === 'Google US English' && voice.lang.toLowerCase() === 'en-us') ||
							  voices.find((voice) => voice.name.toLowerCase().includes('google') && voice.lang.toLowerCase() === 'en-us') ||
							  voices.find((voice) => voice.lang.toLowerCase() === 'en-us' && preferredVoiceNames.some((name) => voice.name.includes(name))) ||
							  voices.find((voice) => voice.lang.toLowerCase() === 'en-us');
		if (americanVoice) {
			utterance.voice = americanVoice;
		}
		window.speechSynthesis.speak(utterance);
	};

	const isFieldLocked = (field: string) => {
		if (topicUltraFields.includes(field) && !isUltra) return 'ULTRA';
		if (topicProFields.includes(field) && !isPro && !isUltra) return 'PRO';
		return null;
	};

	const LockedFieldView = ({ tier }: { tier: 'PRO' | 'ULTRA' }) => (
		<div className="relative my-2 w-full rounded-xl bg-slate-50 p-4 border border-slate-200 flex-shrink-0 flex flex-col items-center justify-center select-none cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}>
			<svg className="w-5 h-5 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
			<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nâng cấp lên gói {tier} để xem chi tiết</p>
			<div className="absolute inset-x-8 bottom-3 flex flex-col items-center gap-1 opacity-20 blur-[2px]">
				<div className="h-1.5 w-full bg-slate-400 rounded-full"></div>
				<div className="h-1.5 w-2/3 bg-slate-400 rounded-full"></div>
			</div>
		</div>
	);

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
									<span className="absolute top-4 right-5 text-[9px] font-semibold uppercase tracking-wider text-white/50 bg-white/10 px-3 py-1 rounded-full pointer-events-none">
										Nhấn để lật
									</span>
									<p className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm text-center">
										{currentItem.word}
									</p>
									{currentItem.phonetic && (
										<p className="mt-4 text-lg text-white/60 font-medium font-mono">{currentItem.phonetic}</p>
									)}

									{/* Voice Practice Controls */}
									<div className="flex items-center gap-4 mt-8">
										<button
											type="button"
											onClick={(e) => playPronunciation(e, currentItem.word)}
											className="rounded-full bg-white/10 p-3.5 text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
											title="Nghe phát âm"
										>
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
												<path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.49 9.49 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
												<path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
											</svg>
										</button>

										{speechSupported && (
											<button
												type="button"
												onClick={(e) => { e.stopPropagation(); startVoicePractice(); }}
												disabled={isPronunciationListening}
												className={`rounded-full p-3.5 text-white shadow-sm ring-1 ring-white/20 transition-all hover:scale-110 active:scale-95 ${isPronunciationListening ? 'bg-rose-500 animate-pulse' : 'bg-white/10 hover:bg-white/25'}`}
												title="Luyện tập phát âm"
											>
												<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
													<path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11v-1h-2z" />
												</svg>
											</button>
										)}
									</div>

									{/* Practice Status Overlay */}
									{(pronunciationStatus || pronunciationScore !== null) && (
										<div className="absolute bottom-16 left-0 right-0 px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
											<div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20 text-slate-800">
												<p className="text-[11px] font-bold text-[#14532d] mb-1">{pronunciationStatus}</p>
												{pronunciationScore !== null && (
													<div className="space-y-1">
														{pronunciationTranscript && (
															<p className="text-[10px] text-slate-500 italic truncate italic">&quot;{pronunciationTranscript}&quot;</p>
														)}
														<div className="flex items-center gap-2">
															<div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
																<div 
																	className={`h-full transition-all duration-700 ${pronunciationScore >= 80 ? 'bg-green-500' : pronunciationScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
																	style={{ width: `${pronunciationScore}%` }}
																/>
															</div>
															<span className="text-[10px] font-black text-slate-700">{pronunciationScore}%</span>
														</div>
														{pronunciationFeedback && (
															<p className="text-[9px] font-medium text-slate-600 leading-tight line-clamp-2">{pronunciationFeedback}</p>
														)}
													</div>
												)}
											</div>
										</div>
									)}

									<p className="mt-8 text-xs text-white/50 font-medium tracking-wide">
										Chủ đề: {selectedTopic}
									</p>
								</div>

								{/* ── BACK FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-2 border-[#14532d]/20 p-5 sm:p-7 text-slate-800 flex flex-col shadow-[inset_0_0_20px_rgba(20,83,45,0.02)] overflow-y-auto overflow-x-hidden">
									<span className="absolute top-4 right-5 text-[9px] font-semibold uppercase tracking-wider text-[#14532d]/50 bg-[#14532d]/5 px-3 py-1 rounded-full pointer-events-none">
										Nhấn để lật
									</span>

									{/* Basic info — always visible */}
									<div className="flex-1 flex flex-col items-center justify-start text-center w-full pt-2">
										<p className="text-2xl sm:text-3xl font-bold text-[#14532d]">{currentItem.word}</p>
										{currentItem.phonetic && (
											isFieldLocked('phonetic') ? <LockedFieldView tier={isFieldLocked('phonetic')!} /> :
											<p className="mt-1 text-base text-slate-400 font-mono">{currentItem.phonetic}</p>
										)}

										<div className="mt-4 mb-4 w-12 h-1 bg-[#14532d]/20 rounded-full mx-auto shrink-0" />

										{isFieldLocked('meaning') ? <LockedFieldView tier={isFieldLocked('meaning')!} /> : (
											<p className="text-xl sm:text-2xl font-bold text-slate-800">{currentItem.meaning}</p>
										)}

										{currentItem.englishDefinition && (
											isFieldLocked('englishDefinition') ? <LockedFieldView tier={isFieldLocked('englishDefinition')!} /> :
											<p className="mt-2 text-sm text-slate-500 font-medium px-2 italic">{currentItem.englishDefinition}</p>
										)}

										{currentItem.example && (
											isFieldLocked('example') ? <LockedFieldView tier={isFieldLocked('example')!} /> :
											<div className="mt-5 w-full rounded-xl bg-slate-50 p-4 border border-slate-200 flex-shrink-0 relative overflow-hidden text-center flex flex-col items-center">
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14532d]/40" />
												<p className="text-sm italic text-slate-700 font-medium tracking-tight">
													<span className="font-bold text-slate-900 not-italic mr-2">Example:</span>
													{currentItem.example}
												</p>
												{currentItem.exampleVi && (
													<button
														type="button"
														onClick={(e) => { e.stopPropagation(); setShowExampleVi(v => !v); }}
														className="mt-2 flex items-center justify-center gap-1 text-[#ea980c] hover:text-[#c47c08] transition-colors"
														title="Dịch nghĩa"
													>
														<span className="text-[10px] font-bold tracking-tight">Dịch nghĩa</span>
														<svg
															className={`w-3.5 h-3.5 transition-transform duration-200 ${showExampleVi ? 'rotate-180' : ''}`}
															fill="none" stroke="currentColor" viewBox="0 0 24 24"
														>
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
														</svg>
													</button>
												)}
												{currentItem.exampleVi && showExampleVi && (
													<p className="mt-1.5 text-xs italic text-[#ea980c] font-medium text-center leading-relaxed">
														{currentItem.exampleVi}
													</p>
												)}
											</div>
										)}

										{/* ── PREMIUM ZONE ── */}
										{hasPremium && (
											<div className="mt-5 w-full flex-shrink-0 space-y-3 text-sm text-left border-t border-slate-100 pt-4">
												{currentItem.synonyms && (
													isFieldLocked('synonyms') ? <LockedFieldView tier={isFieldLocked('synonyms')!} /> :
													<div>
														<p className="font-bold text-[#14532d] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
															Synonyms
														</p>
														<p className="text-slate-700 font-medium pl-5">{currentItem.synonyms}</p>
													</div>
												)}
												{currentItem.antonyms && (
													isFieldLocked('antonyms') ? <LockedFieldView tier={isFieldLocked('antonyms')!} /> :
													<div>
														<p className="font-bold text-rose-600 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
															Antonyms
														</p>
														<p className="text-slate-700 font-medium pl-5">{currentItem.antonyms}</p>
													</div>
												)}
												{currentItem.collocations && (
													isFieldLocked('collocations') ? <LockedFieldView tier={isFieldLocked('collocations')!} /> :
													<div>
														<p className="font-bold text-purple-700 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
															Collocations
														</p>
														<p className="text-slate-700 font-medium pl-5">{currentItem.collocations}</p>
													</div>
												)}
												{currentItem.toeicTrap && (
													isFieldLocked('toeicTrap') ? <LockedFieldView tier={isFieldLocked('toeicTrap')!} /> :
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
										{(!isUltra || !isPro) && (topicProFields.length > 0 || topicUltraFields.length > 0) && (
											<button
												type="button"
												onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
												className="mt-6 text-[10px] font-bold text-purple-700 hover:text-purple-800 transition cursor-pointer flex items-center gap-1.5 justify-center"
											>
												Nâng cấp <UltraTag /> để xem đầy đủ Collocations, Synonyms, Antonyms &amp; Bẫy TOEIC
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

