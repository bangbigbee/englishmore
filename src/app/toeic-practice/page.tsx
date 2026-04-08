"use client";
import { useState } from "react";

const TABS = [
	{ key: "grammar", label: "Grammar" },
	{ key: "vocabulary", label: "Vocabulary" },
	{ key: "listening", label: "Listening" },
	{ key: "reading", label: "Reading" },
	{ key: "actual-test", label: "Actual Test" },
];

export default function ToeicHomePage() {
	const [tab, setTab] = useState("grammar");
	const [showModal, setShowModal] = useState(false);

	return (
		<div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
				<span className="text-green-900">Luyện thi</span>{' '}
				<span className="text-orange-600">TOEIC</span>
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
				{tab === "grammar" && <ToeicGrammarTab onPracticeClick={() => setShowModal(true)} />}
				{tab === "vocabulary" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
				{tab === "listening" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
				{tab === "reading" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
				{tab === "actual-test" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
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
					// Modal đăng nhập hoặc tiếp tục
					import { signIn } from "next-auth/react";

					function PracticeLoginModal({ onClose }: { onClose: () => void }) {
						return (
							<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
								<div className="bg-white rounded-lg shadow-lg p-6 w-80">
									<h2 className="text-lg font-bold mb-4 text-center">Bạn cần đăng nhập để lưu tiến trình</h2>
									<div className="space-y-3">
										<button
											className="w-full py-2 px-4 rounded bg-green-900 text-white font-semibold hover:bg-green-800"
											onClick={() => signIn('google', { callbackUrl: '/toeic-practice' })}
										>
											Đăng nhập với Google
										</button>
										<button
											className="w-full py-2 px-4 rounded bg-orange-600 text-white font-semibold hover:bg-orange-700"
											onClick={onClose}
										>
											Tiếp tục mà không cần đăng nhập
										</button>
									</div>
								</div>
							</div>
						);
					}
					</div>
				))}
			</div>
		</div>
	);
}
