'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ActualTestBankList({ items, isMistakes }: { items: any[], isMistakes: boolean }) {
    const [selectedTest, setSelectedTest] = useState<string>('all');

    // Extract test names
    const testNamesMap = useMemo(() => {
        const map = new Map<string, string>();
        items.forEach(item => {
            const topicTitle = item.question?.lesson?.topic?.title || '';
            const lessonTitle = item.question?.lesson?.title || '';
            
            const collectionMatch = topicTitle.match(/(ETS)\s*(\d{4})/i);
            const collectionName = collectionMatch ? `${collectionMatch[1].toUpperCase()} ${collectionMatch[2]}` : 'Other';
            
            const testName = `${collectionName} - ${lessonTitle.trim()}`;
            const testId = testName.replace(/\s+/g, '-').toLowerCase();
            
            item._testId = testId;
            item._testName = testName;
            
            if (!map.has(testId)) {
                map.set(testId, testName);
            }
        });
        return map;
    }, [items]);

    const testOptions = Array.from(testNamesMap.entries());

    const filteredItems = useMemo(() => {
        if (selectedTest === 'all') return items;
        return items.filter(item => item._testId === selectedTest);
    }, [items, selectedTest]);

    if (items.length === 0) {
        return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">
                    {isMistakes ? "Tuyệt vời! Bạn chưa có câu làm sai nào" : "Chưa có câu hỏi nào được Sổ tay lưu trữ"}
                </h3>
				<p className="text-slate-500 max-w-sm mx-auto">
                    {isMistakes 
                        ? "Hoặc bạn chưa làm bài Actual Test nào. Những câu làm sai sẽ xuất hiện ở đây để tiện theo dõi." 
                        : "Khi làm bài Luyện Tập / Thi Thử, hãy bấm vào icon Bookmark để lưu lại những câu khó nhé."}
				</p>
			</div>
		);
    }

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="bg-white border text-sm border-slate-200 rounded-xl p-3 flex md:flex-row flex-col max-w-sm gap-3 items-center shadow-sm">
                <span className="font-bold text-slate-600 whitespace-nowrap">Lọc theo đề thi:</span>
                <select 
                    value={selectedTest} 
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                >
                    <option value="all">Tất cả đề thi</option>
                    {testOptions.map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredItems.map((item) => {
                    const q = item.question;
                    return (
                        <div key={item.id} className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm group relative">
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                {isMistakes && item.selectedOption && (
                                    <div className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[10px] font-bold">
                                        ĐÃ CHỌN: {item.selectedOption}
                                    </div>
                                )}
                                {!isMistakes && (
                                    <div className="text-amber-500 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                                    {item._testName}
                                </span>
                                <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                                    Part {q.lesson.topic.part}
                                </span>
                            </div>

                            {/* Question Context (Image, Passage, Audio placeholders) */}
                            <div className="flex flex-col gap-4 mb-5">
                                {q.imageUrl && (
                                    <img src={q.imageUrl} alt="Context" className="w-[150px] object-cover rounded shadow-sm border border-slate-200" />
                                )}
                                {q.passage && (
                                    <div className="prose prose-sm prose-slate max-w-none bg-slate-50 p-3 rounded-lg border border-slate-100" dangerouslySetInnerHTML={{ __html: q.passage }} />
                                )}
                                {q.audioUrl && (
                                    <audio src={q.audioUrl} controls className="h-10 w-full max-w-sm" />
                                )}
                                {q.question && (
                                    <p className="text-base font-bold text-slate-800 line-clamp-3 leading-snug" dangerouslySetInnerHTML={{ __html: q.question }} />
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium mt-auto">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                    if (!q[`option${opt}`]) return null;
                                    const isCorrect = q.correctOption === opt;
                                    const isUserMistake = isMistakes && item.selectedOption === opt && !isCorrect;
                                    
                                    let style = 'bg-slate-50 border-slate-100 text-slate-600'; // Default
                                    if (isCorrect) style = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                                    else if (isUserMistake) style = 'bg-rose-50 border-rose-200 text-rose-800 line-through';

                                    return (
                                        <div key={opt} className={`p-2 rounded-lg border transition-colors ${style}`}>
                                            <span className="font-black mr-2 opacity-60">{opt}</span>
                                            {q.lesson.topic.part !== 1 && q.lesson.topic.part !== 2 ? (
                                                <span dangerouslySetInnerHTML={{ __html: q[`option${opt}`] }} />
                                            ) : (
                                                <span>Option {opt}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {(q.translation || q.explanation) && (
                                <div className="mt-5 bg-sky-50/50 p-4 rounded-lg border border-sky-100 shadow-sm">
                                    {q.translation && (
                                        <div className="text-sm italic text-blue-700 opacity-90 mb-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.translation }} />
                                    )}
                                    {q.explanation && (
                                        <div className="text-[13px] font-medium text-slate-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                                    )}
                                </div>
                            )}

                        </div>
                    );
                })}
                {filteredItems.length === 0 && (
                    <div className="text-center p-8 text-slate-400 font-medium">Không tìm thấy câu hỏi nào thuộc đề thi hiện tại.</div>
                )}
            </div>
        </div>
    );
}
