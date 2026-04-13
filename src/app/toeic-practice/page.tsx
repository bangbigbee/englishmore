"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

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
	const vocabTopics = [
		{ title: "General Business", subtitle: "Doanh nghiệp nói chung" },
		{ title: "Office Issues", subtitle: "Vấn đề văn phòng" },
		{ title: "Personnel", subtitle: "Nhân sự" },
		{ title: "Purchasing", subtitle: "Mua sắm" },
		{ title: "Dining Out", subtitle: "Ăn uống" },
		{ title: "Travel", subtitle: "Du lịch" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">📙</span>
				Các chủ đề từ vựng
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{vocabTopics.map((topic) => (
					<div
						key={topic.title}
						onClick={onPracticeClick}
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
					>
						<div>
							<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{topic.title}</div>
							<div className="text-sm text-gray-500 mb-2">{topic.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end">
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

