"use client";
import { useState } from "react";

const TABS = [
	{ key: "grammar", label: "Grammar" },
	{ key: "vocabulary", label: "Vocabulary" },
	{ key: "listening", label: "Listening" },
	{ key: "reading", label: "Reading" },
	{ key: "actual-test", label: "Actual Test" },
];

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
export default function ToeicHomePage() {
	const [tab, setTab] = useState("grammar");
	const [showModal, setShowModal] = useState(false);
	const { data: session } = useSession();

	return (
		<div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
				<span className="text-green-900">LUYỆN THI</span>{' '}
				<span style={{ color: '#ea980c', fontWeight: 700 }}>TOEIC</span>
			</h1>
			<div className="flex gap-2 sm:gap-4 border-b mb-8 overflow-x-auto">
				{TABS.map((t) => (
					<button
						key={t.key}
						className={`px-4 py-2 sm:px-6 sm:py-3 font-semibold border-b-2 transition-colors duration-200 focus:outline-none ${tab === t.key ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-gray-500 hover:text-blue-600"}`}
						onClick={() => setTab(t.key)}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="mt-6">
				 {tab === "grammar" && <ToeicGrammarTab onPracticeClick={() => {
					 if (!session) setShowModal(true);
				 }} />}
				{tab === "vocabulary" && <ToeicVocabularyTab onPracticeClick={() => {
					 if (!session) setShowModal(true);
				 }} />}
				{tab === "listening" && <ToeicListeningTab onPracticeClick={() => {
					 if (!session) setShowModal(true);
				 }} />}
				{tab === "reading" && <ToeicReadingTab onPracticeClick={() => {
					 if (!session) setShowModal(true);
				 }} />}
				{tab === "actual-test" && <ToeicActualTestTab onPracticeClick={() => {
					 if (!session) setShowModal(true);
				 }} />}
			</div>
			{showModal && <PracticeLoginModal onClose={() => setShowModal(false)} />}
		</div>
	);
}

function ToeicGrammarTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	// Chỉ còn 5 chủ đề, style xanh lá đậm, bỏ số lượng câu hỏi
	const grammarTopics = [
		{ title: "Basic Grammar", subtitle: "Ngữ pháp cơ bản" },
		{ title: "Adjectives", subtitle: "Tính từ" },
		{ title: "Relative Clause", subtitle: "Mệnh đề quan hệ" },
		{ title: "Comparison Sentence", subtitle: "Câu so sánh" },
		{ title: "Phrasal Verb", subtitle: "Cụm động từ" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">📘</span>
				Các chủ đề ngữ pháp
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{grammarTopics.map((topic) => (
					<div
						key={topic.title}
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
					>
						<div>
							<div className="font-bold text-base text-green-900 mb-1">{topic.title}</div>
							<div className="text-sm text-gray-500 mb-2">{topic.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end">
							<button
								className="text-green-900 font-semibold text-sm hover:underline"
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
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
					>
						<div>
							<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{topic.title}</div>
							<div className="text-sm text-gray-500 mb-2">{topic.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end">
							<button
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors"
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
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
					>
						<div>
							<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{part.title}</div>
							<div className="text-sm text-gray-500 mb-2">{part.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end mt-4">
							<button
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors"
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
						className="rounded-xl border-2 border-green-900 bg-white p-5 shadow-sm hover:border-[#ea980c] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
					>
						<div>
							<div className="font-bold text-base text-green-900 group-hover:text-[#ea980c] transition-colors mb-1">{part.title}</div>
							<div className="text-sm text-gray-500 mb-2">{part.subtitle}</div>
							<div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
						</div>
						<div className="flex justify-end mt-4">
							<button
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors"
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
								className="text-green-900 font-semibold text-sm hover:text-[#ea980c] transition-colors bg-green-50 px-4 py-2 rounded-lg group-hover:bg-orange-50"
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

// Modal đăng nhập hoặc tiếp tục
function PracticeLoginModal({ onClose }: { onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-2xl shadow-xl p-6 w-[350px]">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-base font-semibold text-gray-900">Đăng nhập để lưu tiến độ học tập</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl px-1">×</button>
				</div>
				<div className="text-sm text-gray-500 mb-5 leading-relaxed">Đăng nhập để theo dõi tiến độ và nhận điểm hoạt động tích cực.</div>
				<div className="space-y-3">
					<button
						className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-900 text-white font-medium text-base shadow-sm hover:bg-green-800 transition"
						onClick={() => signIn('google', { callbackUrl: '/toeic-practice' })}
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-3A2.25 2.25 0 0 0 8.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0 1 13.5 21h-3A2.25 2.25 0 0 1 8.25 19.5V9m7.5 0H8.25m7.5 0a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 15.75 21H8.25a2.25 2.25 0 0 1-2.25-2.25v-7.5A2.25 2.25 0 0 1 8.25 9" />
						</svg>
						Đăng nhập
					</button>
					<button
						className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 text-gray-500 font-medium text-base hover:bg-[#ea580c] hover:text-white transition"
						onClick={onClose}
					>
						Tiếp tục mà không đăng nhập
					</button>
				</div>
			</div>
		</div>
	);
}
