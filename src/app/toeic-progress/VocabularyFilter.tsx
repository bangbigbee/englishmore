'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function VocabularyFilter({ topics }: { topics: string[] }) {
	const router = useRouter();
	const searchParams = useSearchParams();
    const [isTopicOpen, setIsTopicOpen] = useState(false);
	
	const currentTopic = searchParams.get('topic') || 'all';
	const currentTag = searchParams.get('tag') || 'all';

	const updateFilters = (newTopic: string, newTag: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', 'vocabulary-bank');
		
		if (newTopic === 'all') params.delete('topic');
		else params.set('topic', newTopic);
		
		if (newTag === 'all') params.delete('tag');
		else params.set('tag', newTag);
		
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="space-y-6 mb-8">
			{/* Topic Dropdown */}
			<div className="relative z-30">
				<label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Chủ đề từ vựng</label>
				<div className="max-w-md relative">
                    <button 
                        onClick={() => setIsTopicOpen(!isTopicOpen)}
                        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#14532d]/30 hover:shadow-md transition-all group active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <span className="w-8 h-8 rounded-lg bg-green-50 text-[#14532d] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                            </span>
                            <div className="flex flex-col items-start truncate overflow-hidden">
                                <span className="text-[14px] font-black text-slate-800 truncate w-full">{currentTopic === 'all' ? 'Tất cả chủ đề' : currentTopic}</span>
                                {currentTopic !== 'all' && <span className="text-[10px] text-[#ea980c] font-bold uppercase tracking-wider">Đã chọn</span>}
                            </div>
                        </div>
                        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isTopicOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    <AnimatePresence>
                        {isTopicOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-[320px] overflow-y-auto custom-scrollbar"
                            >
                                <button 
                                    onClick={() => { updateFilters('all', currentTag); setIsTopicOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${currentTopic === 'all' ? 'bg-green-50 border-[#ea980c] text-[#14532d]' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span className="text-[14px] font-bold">Tất cả chủ đề</span>
                                </button>
                                {topics.map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => { updateFilters(t, currentTag); setIsTopicOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${currentTopic === t ? 'bg-green-50 border-[#ea980c] text-[#14532d]' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <span className="text-[14px] font-bold">{t}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
				</div>
			</div>

			{/* Tag Chips */}
			<div>
				<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Lọc theo tag đã chọn</label>
				<div className="flex flex-nowrap overflow-x-auto gap-2 pb-3 custom-scrollbar">
					{[
						{ id: 'all', label: 'Tất cả trạng thái', icon: '🌈', activeClass: 'bg-slate-800 text-white' },
						{ id: 'bookmarked', label: '⭐ Câu đã lưu', icon: '⭐', activeClass: 'bg-[#ea980c] text-white' },
						{ id: 'hard', label: '● Từ khó', icon: '●', activeClass: 'bg-rose-600 text-white' },
						{ id: 'learned', label: '✓ Đã thuộc', icon: '✓', activeClass: 'bg-green-600 text-white' }
					].map(tag => (
						<button 
							key={tag.id}
							onClick={() => updateFilters(currentTopic, tag.id)}
							className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 whitespace-nowrap shadow-sm border flex items-center gap-2 ${currentTag === tag.id ? tag.activeClass + ' border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
						>
							{tag.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
