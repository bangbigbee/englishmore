import { useState } from "react";
import { useRouter } from "next/navigation";
import PracticeUnderConstruction from "./practice-under-construction";

const TABS = [
  { key: "grammar", label: "Grammar" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "actual-test", label: "Actual Test" },
];

  const [tab, setTab] = useState("grammar");
  const [showPractice, setShowPractice] = useState(false);

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6">
      {showPractice && <PracticeUnderConstruction />}
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
        {tab === "grammar" && <ToeicGrammarTab />}
        {tab === "vocabulary" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
        {tab === "listening" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
        {tab === "reading" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
        {tab === "actual-test" && <div className="text-center text-gray-500">(Đang phát triển...)</div>}
      </div>
    </div>
  );
}

function ToeicGrammarTab() {
  // UI giống file đính kèm
  const grammarTopics = [
    { title: "Actual test questions", subtitle: "Câu hỏi từ đề thi thật", count: 438 },
    { title: "Basic Grammar Knowledge", subtitle: "Kiến thức ngữ pháp cơ bản", count: 50 },
    { title: "Nouns", subtitle: "Danh từ", count: 62 },
    { title: "Verbs", subtitle: "Động từ", count: 45 },
    { title: "Active and Passive Voice", subtitle: "Câu chủ động và câu bị động", count: 20 },
    { title: "Adjectives", subtitle: "Tính từ", count: 45 },
    { title: "Adverbs", subtitle: "Trạng từ", count: 48 },
    { title: "Pronouns", subtitle: "Đại từ", count: 50 },
    { title: "Comparison Sentences", subtitle: "Câu so sánh", count: 38 },
    { title: "Conjunctions and Prepositions", subtitle: "Liên từ và giới từ", count: 24 },
    { title: "Relative Clauses", subtitle: "Mệnh đề quan hệ", count: 40 },
    { title: "Parts of Speech Practice", subtitle: "Bài tập từ loại", count: 50 },
    { title: "Mixed Verb Practice", subtitle: "Bài tập động từ hỗn hợp", count: 30 },
    { title: "Comprehensive Grammar Practice", subtitle: "Bài tập ngữ pháp tổng hợp", count: 60 },
  ];
  const handlePracticeClick = () => {
    setShowPractice(true);
  };
  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
        <span className="inline-block w-5 h-5 text-blue-500">📘</span>
        Các chủ đề ngữ pháp
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {grammarTopics.map((topic) => (
          <div key={topic.title} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between">
            <div>
              <div className="font-bold text-base text-gray-900 mb-1">{topic.title}</div>
              <div className="text-sm text-gray-500 mb-2">{topic.subtitle}</div>
              <div className="text-blue-600 font-semibold text-sm mb-1">📝 {topic.count} câu hỏi</div>
              <div className="text-xs text-gray-400 mb-2">Chưa bắt đầu</div>
            </div>
            <div className="flex justify-end">
              <button className="text-blue-600 font-semibold text-sm hover:underline" onClick={handlePracticeClick}>Luyện tập &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
