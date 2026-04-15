"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UpgradeModal from "@/components/UpgradeModal";


const TABS = [
	{ 
		key: "grammar", 
		label: "Grammar", 
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
			</svg>
		) 
	},
	{ 
		key: "vocabulary", 
		label: "Vocabulary", 
		icon: (
			<svg className="w-5 h-5 shadow-sm" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
				{/* Book Cover */}
				<rect x="10" y="5" width="74" height="94" rx="10" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="8"/>
				{/* Tabs */}
				<path d="M84 20C89.5228 20 94 24.4772 94 30V40C94 45.5228 89.5228 50 84 50V20Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="8"/>
				<path d="M84 45C89.5228 45 94 49.4772 94 55V65C94 70.5228 89.5228 75 84 75V45Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="8"/>
				<path d="M84 70C89.5228 70 94 74.4772 94 80V90C94 95.5228 89.5228 100 84 100V70Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="8"/>
				{/* Bottom Pages detail */}
				<path d="M15 99C15 107.284 21.7157 114 30 114H80C82.2091 114 84 112.209 84 110V99H15Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="8"/>
				<path d="M22 106H77" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round"/>
				{/* A-Z Label */}
				<rect x="25" y="20" width="44" height="28" rx="6" stroke="#3B82F6" strokeWidth="7"/>
				<text x="47" y="42" fontSize="24" fontWeight="900" textAnchor="middle" fill="#3B82F6" fontFamily="Inter, sans-serif">A-Z</text>
				{/* Cover Lines */}
				<line x1="28" y1="62" x2="66" y2="62" stroke="#3B82F6" strokeWidth="7" strokeLinecap="round"/>
				<line x1="28" y1="75" x2="66" y2="75" stroke="#3B82F6" strokeWidth="7" strokeLinecap="round"/>
				<line x1="28" y1="88" x2="50" y2="88" stroke="#3B82F6" strokeWidth="7" strokeLinecap="round"/>
			</svg>
		)
	},
	{ 
		key: "listening", 
		label: "Listening", 
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
			</svg>
		)
	},
	{ 
		key: "reading", 
		label: "Reading", 
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
		)
	},
	{ 
		key: "actual-test", 
		label: "Actual Test", 
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
			</svg>
		)
	},
];

const TopicCard = ({ title, subtitle, badgeText, onClick }: any) => {
	return (
		<div
			onClick={onClick}
			className="relative group bg-white rounded-md p-7 transition-all duration-500 cursor-pointer overflow-hidden
								 shadow-[5px_15px_40px_rgba(0,0,0,0.08)] hover:shadow-[10px_25px_60px_rgba(0,0,0,0.12)] 
								 hover:-translate-y-2 flex flex-col justify-start min-h-[290px]"
		>
			<div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_3s_infinite] bg-linear-to-r from-transparent via-green-50/10 to-transparent skew-x-[-20deg]" />

			<div className="relative z-10 flex-1">
				<h3 className="font-bold text-2xl text-[#14532d] leading-tight mb-3">
					{title}
				</h3>

				{badgeText && (
					<div className="text-[12px] font-bold uppercase tracking-widest text-[#14532d] mb-4">
						{badgeText}
					</div>
				)}

				{subtitle && <p className="text-[15px] text-slate-500 font-normal leading-relaxed">{subtitle}</p>}
			</div>

			<div className="relative z-10 mt-8 flex justify-start">
				<div className="w-14 h-14 shrink-0 rounded-full bg-white shadow-[0_8px_25px_-5px_rgba(0,0,0,0.15)] group-hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.25)] flex items-center justify-center text-[#818cf8] group-hover:text-indigo-500 transition-all duration-300 group-hover:scale-110">
					<svg className="w-6 h-6 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</div>
		</div>
	);
};

function ToeicPracticeContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { data: session } = useSession();

	const tabFromUrl = searchParams.get('tab') || 'grammar';
	const [tab, setTab] = useState(tabFromUrl);

	useEffect(() => {
		const t = searchParams.get('tab');
		if (t && TABS.some(item => item.key === t)) setTab(t);
	}, [searchParams]);

	const openLoginModal = (destination?: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('login', 'true');
		params.set('allowGuest', 'true');
		params.set('subtitle', 'Đăng nhập để lưu và theo dõi tiến độ học tập');
		params.set('callbackUrl', destination || pathname);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handleTabChange = (newTab: string) => {
		setTab(newTab);
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', newTab);
		params.delete('topic'); // clear topic when switching tabs
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div className="max-w-6xl mx-auto py-2 px-2 sm:px-6">
			<style jsx global>{`
				@keyframes shimmer {
					0% { transform: translateX(-150%) skewX(-20deg); }
					50% { transform: translateX(150%) skewX(-20deg); }
					100% { transform: translateX(150%) skewX(-20deg); }
				}
			`}</style>
			
			<div className="flex gap-4 sm:gap-8 mb-10 overflow-x-auto pb-4 scrollbar-hide py-2 px-1">
				{TABS.map((t) => (
					<button
						key={t.key}
						className={`flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap`}
						onClick={() => handleTabChange(t.key)}
					>
						<span className={`text-xl transition-transform duration-300 ${tab === t.key ? "scale-110" : "opacity-60 scale-100 group-hover:opacity-100"}`}>
							{t.icon}
						</span>
						<span className={`text-sm font-bold tracking-tight transition-all ${
							tab === t.key 
								? "text-[#14532d] scale-105" 
								: "text-slate-400 group-hover:text-slate-600"
						}`}>
							{t.label}
						</span>
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
				{tab === "vocabulary" && <ToeicVocabularyTab 
					onPracticeClick={(topic) => {
					 if (!session) {
						const params = new URLSearchParams(searchParams.toString());
						params.set('tab', 'vocabulary');
						if (topic) params.set('topic', topic);
						openLoginModal(`${pathname}?${params.toString()}`);
					 }
				 }} />}
				{tab === "listening" && <ToeicListeningTab onPracticeClick={() => {
					 if (!session) openLoginModal(`${pathname}?tab=listening`);
				 }} />}
				{tab === "reading" && <ToeicReadingTab onPracticeClick={() => {
					 if (!session) openLoginModal(`${pathname}?tab=reading`);
				 }} />}
				{tab === "actual-test" && <ToeicActualTestTab onPracticeClick={() => {
					 if (!session) openLoginModal(`${pathname}?tab=actual-test`);
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
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{topics.length === 0 ? (
					<div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
						Chưa có chủ đề nào được cập nhật.
					</div>
				) : (
					topics.map((topic) => (
						<TopicCard
							key={topic.id}
							title={topic.title}
							subtitle={topic.subtitle || 'Ngữ pháp TOEIC'}
							badgeText={`${topic._count?.lessons || 0} Lessons`}
							onClick={() => onPracticeClick(topic.slug)}
						/>
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
	<span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded border border-purple-600/50 bg-linear-to-r from-purple-900 via-purple-800 to-indigo-900 text-[8px] font-black text-purple-100 shadow-[0_0_8px_rgba(88,28,135,0.5)]">
		<svg className="w-2.5 h-2.5 fill-amber-400" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
		ULTRA
	</span>
);

const ProTag = () => (
	<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-linear-to-r from-amber-500 via-amber-400 to-orange-500 text-[9px] font-black text-white shadow-[0_0_8px_rgba(245,158,11,0.3)] border border-amber-300/50">
		<svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.6l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/></svg>
		PRO
	</span>
);

function ToeicVocabularyTab({ onPracticeClick }: { onPracticeClick: (topic?: string) => void }) {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const [topics, setTopics] = useState<{ topic: string; wordCount: number }[]>([]);
	const [loading, setLoading] = useState(true);

	const initialTopic = searchParams.get('topic');
	const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic);
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
	const pronunciationDoneAudioRef = useRef<HTMLAudioElement | null>(null);
	const pronunciationRewardAudioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const win = window as any;
		setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));

		pronunciationDoneAudioRef.current = new Audio('/audio/tingsound.mp3');
		pronunciationDoneAudioRef.current.preload = 'auto';
		pronunciationDoneAudioRef.current.load();

		pronunciationRewardAudioRef.current = new Audio('/audio/amazing-reward-sound.mp3');
		pronunciationRewardAudioRef.current.preload = 'auto';
		pronunciationRewardAudioRef.current.load();

		return () => {
			if (pronunciationDoneAudioRef.current) pronunciationDoneAudioRef.current.pause();
			if (pronunciationRewardAudioRef.current) pronunciationRewardAudioRef.current.pause();
		};
	}, []);

	const playPronunciationDoneChime = () => {
		if (typeof window !== 'undefined' && pronunciationDoneAudioRef.current) {
			try {
				pronunciationDoneAudioRef.current.pause();
				pronunciationDoneAudioRef.current.currentTime = 0;
				void pronunciationDoneAudioRef.current.play().catch(() => {});
			} catch {}
		}
	};

	const playPronunciationRewardChime = () => {
		if (typeof window !== 'undefined' && pronunciationRewardAudioRef.current) {
			try {
				pronunciationRewardAudioRef.current.pause();
				pronunciationRewardAudioRef.current.currentTime = 0;
				void pronunciationRewardAudioRef.current.play().catch(() => {});
			} catch {}
		}
	};

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

		// Prime audio
		try {
			if (pronunciationDoneAudioRef.current) {
				pronunciationDoneAudioRef.current.muted = true;
				void pronunciationDoneAudioRef.current.play().then(() => {
					if (pronunciationDoneAudioRef.current) {
						pronunciationDoneAudioRef.current.pause();
						pronunciationDoneAudioRef.current.currentTime = 0;
						pronunciationDoneAudioRef.current.muted = false;
					}
				}).catch(() => { if (pronunciationDoneAudioRef.current) pronunciationDoneAudioRef.current.muted = false; });
			}
			if (pronunciationRewardAudioRef.current) {
				pronunciationRewardAudioRef.current.muted = true;
				void pronunciationRewardAudioRef.current.play().then(() => {
					if (pronunciationRewardAudioRef.current) {
						pronunciationRewardAudioRef.current.pause();
						pronunciationRewardAudioRef.current.currentTime = 0;
						pronunciationRewardAudioRef.current.muted = false;
					}
				}).catch(() => { if (pronunciationRewardAudioRef.current) pronunciationRewardAudioRef.current.muted = false; });
			}
		} catch {}

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
			playPronunciationDoneChime();
			
			pronunciationScoringTimeoutRef.current = window.setTimeout(() => {
				setPronunciationScore(score);
				setPronunciationFeedback(buildPronunciationFeedback(score, candidate, currentWord));
				setPronunciationStatus(score >= 80 ? 'Rất tốt! Hãy tiếp tục phát huy.' : 'Hãy thử lại một lần nữa nhé.');
				if (score === 100) {
					playPronunciationRewardChime();
				}
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

	// Handle initialTopic from URL or back Navigation
	useEffect(() => {
		const topicFromUrl = searchParams.get('topic');
		const tabFromUrl = searchParams.get('tab');
		if (tabFromUrl === 'vocabulary' && topicFromUrl && topicFromUrl !== selectedTopic) {
			loadTopic(topicFromUrl);
		} else if (!topicFromUrl && selectedTopic) {
			setSelectedTopic(null);
		}
	}, [searchParams]);

	const openTopic = async (topic: string) => {
		if (!session) { onPracticeClick(topic); return; }
		
		// Update URL to reflect current topic
		const params = new URLSearchParams(searchParams.toString());
		params.set('topic', topic);
		params.set('tab', 'vocabulary');
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
		
		loadTopic(topic);
	};

	const loadTopic = async (topic: string) => {
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

	const fieldLabelsVi: Record<string, string> = {
		meaning: 'Nghĩa của từ',
		phonetic: 'Phiên âm',
		englishDefinition: 'English Definition',
		example: 'Example',
		exampleVi: 'Dịch câu ví dụ',
		synonyms: 'Synonyms',
		antonyms: 'Antonyms',
		collocations: 'Collocations',
		toeicTrap: 'TOEIC Tip',
	};

	const LockedFieldView = ({ tier, label }: { tier: 'PRO' | 'ULTRA', label: string }) => (
		<div 
			onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
			className="inline-flex items-center gap-1 cursor-pointer group my-0.5 opacity-80 hover:opacity-100 transition-opacity"
		>
			{tier === 'ULTRA' ? (
				<>
					<svg className="w-3.5 h-3.5 fill-amber-300 drop-shadow-sm" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
					<span className="text-[11px] font-bold text-slate-400 group-hover:text-purple-700 transition-colors">{fieldLabelsVi[label] || label}</span>
				</>
			) : (
				<>
					<svg className="w-3.5 h-3.5 fill-amber-500 drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.6l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/></svg>
					<span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-600 transition-colors">{fieldLabelsVi[label] || label}</span>
				</>
			)}
		</div>
	);

	const backToTopics = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('topic');
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
		setSelectedTopic(null);
		setVocabItems([]);
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
					<div className="py-12 text-center text-slate-400 italic font-medium">Đang tải chủ đề...</div>
				) : topics.length === 0 ? (
					<div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
						Chưa có chủ đề từ vựng nào. Admin cần import từ tab TOEIC.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{topics.map((t) => (
							<TopicCard
								key={t.topic}
								title={t.topic}
								badgeText={`${t.wordCount} words`}
								onClick={() => openTopic(t.topic)}
							/>
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
					onClick={backToTopics}
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
										<p className="mt-4 text-lg text-white/60 font-medium">{currentItem.phonetic.replaceAll('.', '')}</p>
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
												className={`flex items-center justify-center gap-2 shadow-sm ring-1 ring-white/20 transition-all duration-300 overflow-hidden ${
													isPronunciationListening 
														? 'rounded-full bg-[#75967b] px-5 py-2.5 opacity-95 pointer-events-none'
														: 'rounded-full bg-white/10 p-3.5 hover:bg-white/25 hover:scale-110 active:scale-95'
												}`}
												title="Luyện tập phát âm"
											>
												{isPronunciationListening ? (
													<svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] origin-bottom duration-1000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4a4.992 4.992 0 00-1.5 3.5m9.5-3.5A4.992 4.992 0 0117.5 7.5" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14a3 3 0 003-3V7a3 3 0 00-6 0v4a3 3 0 003 3z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v1a7 7 0 01-14 0v-1M12 18v4m-3 0h6" />
													</svg>
												) : (
													<svg className="w-6 h-6 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
														<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
														<path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11v-1h-2z" />
													</svg>
												)}
												{isPronunciationListening && (
													<span className="text-white font-bold text-sm tracking-wide whitespace-nowrap animate-pulse">Listening...</span>
												)}
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
									<div className="flex-1 flex flex-col items-center justify-start text-center w-full pt-1">
										<p className="text-2xl sm:text-3xl font-bold text-[#14532d] leading-none mb-1">{currentItem.word}</p>
										{currentItem.phonetic && (
											isFieldLocked('phonetic') ? <LockedFieldView tier={isFieldLocked('phonetic')!} label="phonetic" /> :
											<p className="text-[13px] text-slate-400">{currentItem.phonetic.replaceAll('.', '')}</p>
										)}

										<div className="mt-2.5 mb-2.5 w-10 h-0.5 bg-[#14532d]/20 rounded-full mx-auto shrink-0" />

										{isFieldLocked('meaning') ? <LockedFieldView tier={isFieldLocked('meaning')!} label="meaning" /> : (
											<p className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{currentItem.meaning}</p>
										)}

										{currentItem.englishDefinition && (
											isFieldLocked('englishDefinition') ? <LockedFieldView tier={isFieldLocked('englishDefinition')!} label="englishDefinition" /> :
											<p className="mt-1.5 text-[11px] text-slate-500 font-medium px-2 italic leading-relaxed">{currentItem.englishDefinition}</p>
										)}

										{currentItem.example && (
											isFieldLocked('example') ? <LockedFieldView tier={isFieldLocked('example')!} label="example" /> :
											<div className="mt-3.5 w-full rounded-xl bg-slate-50 p-3 border border-slate-200 flex-shrink-0 relative overflow-hidden text-center flex flex-col items-center">
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14532d]/40" />
												<p className="text-[13px] italic text-slate-700 font-medium tracking-tight">
													<span className="font-bold text-slate-900 not-italic mr-1.5">Example:</span>
													{currentItem.example}
												</p>
												{currentItem.exampleVi && (
													isFieldLocked('exampleVi') ? (
														<div className="mt-2">
															<LockedFieldView tier={isFieldLocked('exampleVi')!} label="exampleVi" />
														</div>
													) : (
														<>
															<button
																type="button"
																onClick={(e) => { e.stopPropagation(); setShowExampleVi(v => !v); }}
																className="mt-1.5 flex items-center justify-center gap-1 text-[#ea980c] hover:text-[#c47c08] transition-colors"
																title="Dịch nghĩa"
															>
																<span className="text-[9px] font-bold tracking-tight">Dịch nghĩa</span>
																<svg
																	className={`w-3 h-3 transition-transform duration-200 ${showExampleVi ? 'rotate-180' : ''}`}
																	fill="none" stroke="currentColor" viewBox="0 0 24 24"
																>
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
																</svg>
															</button>
															{showExampleVi && (
																<p className="mt-1 text-[12px] italic text-[#ea980c] font-medium text-center leading-relaxed">
																	{currentItem.exampleVi}
																</p>
															)}
														</>
													)
												)}
											</div>
										)}

										{/* ── PREMIUM ZONE ── */}
										{hasPremium && (
											<div className="mt-3.5 w-full flex-shrink-0 space-y-2 text-[11px] text-center border-t border-slate-100 pt-3 flex flex-col items-center">
												{currentItem.synonyms && (
													isFieldLocked('synonyms') ? <LockedFieldView tier={isFieldLocked('synonyms')!} label="synonyms" /> :
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-[#14532d] flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
															Synonyms:
														</span>
														<span className="text-slate-700 font-medium leading-relaxed">{currentItem.synonyms}</span>
													</div>
												)}
												{currentItem.antonyms && (
													isFieldLocked('antonyms') ? <LockedFieldView tier={isFieldLocked('antonyms')!} label="antonyms" /> :
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-[#14532d] flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
															Antonyms:
														</span>
														<span className="text-slate-700 font-medium leading-relaxed">{currentItem.antonyms}</span>
													</div>
												)}
												{currentItem.collocations && (
													isFieldLocked('collocations') ? <LockedFieldView tier={isFieldLocked('collocations')!} label="collocations" /> :
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-purple-700 flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
															Collocations:
														</span>
														<span className="text-slate-700 font-medium leading-relaxed">{currentItem.collocations}</span>
													</div>
												)}
												{currentItem.toeicTrap && (
													isFieldLocked('toeicTrap') ? <LockedFieldView tier={isFieldLocked('toeicTrap')!} label="toeicTrap" /> :
														<div className="rounded-md bg-amber-50 border border-amber-200 p-2 w-full text-left flex flex-col sm:flex-row sm:items-start gap-1 mt-1 transition-colors">
														<span className="font-bold text-amber-600 flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
															TOEIC Tip:
														</span>
														<span className="text-slate-700 font-medium leading-relaxed">{currentItem.toeicTrap}</span>
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
	const topics = [
		{ title: "Part 1: Photographs", subtitle: "Mô tả tranh", count: "10 bài" },
		{ title: "Part 2: Question-Response", subtitle: "Hỏi đáp", count: "10 bài" },
		{ title: "Part 3: Conversations", subtitle: "Hội thoại ngắn", count: "10 bài" },
		{ title: "Part 4: Short Talks", subtitle: "Bài nói ngắn", count: "10 bài" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">🎧</span>
				Các phần thi Listening
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{topics.map((t) => (
					<TopicCard
						key={t.title}
						title={t.title}
						subtitle={t.subtitle}
						badgeText={t.count.replace(' bài', ' SESSIONS')}
						onClick={onPracticeClick}
					/>
				))}
			</div>
		</div>
	);
}

function ToeicReadingTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const topics = [
		{ title: "Part 5: Incomplete Sentences", subtitle: "Hoàn thành câu", count: "30 bài" },
		{ title: "Part 6: Text Completion", subtitle: "Hoàn thành đoạn văn", count: "16 bài" },
		{ title: "Part 7: Reading Comprehension", subtitle: "Đọc hiểu văn bản", count: "54 bài" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">📖</span>
				Các phần thi Reading
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{topics.map((t) => (
					<TopicCard
						key={t.title}
						title={t.title}
						subtitle={t.subtitle}
						badgeText={t.count.replace(' bài', ' SESSIONS')}
						onClick={onPracticeClick}
					/>
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
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{testPacks.map((test) => (
					<TopicCard
						key={test.title}
						title={test.title}
						subtitle={test.subtitle}
						badgeText={test.count.replace(' bài test', ' TESTS')}
						onClick={onPracticeClick}
					/>
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

