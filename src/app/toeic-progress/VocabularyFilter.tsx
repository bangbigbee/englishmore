'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function VocabularyFilter({ topics }: { topics: string[] }) {
	const router = useRouter();
	const searchParams = useSearchParams();
    const [isTopicOpen, setIsTopicOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isResetMenuOpen, setIsResetMenuOpen] = useState(false);
	
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

    const handleReset = async (type: string = 'all') => {
        let msg = 'Bạn có chắc chắn muốn xóa toàn bộ trạng thái học tập (Đã thuộc, Từ khó, Đã lưu) không?';
        if (type === 'learned') msg = 'Bạn có chắc chắn muốn xóa trạng thái "Đã thuộc" cho tất cả từ vựng không?';
        if (type === 'hard') msg = 'Bạn có chắc chắn muốn xóa trạng thái "Từ khó" cho tất cả từ vựng không?';
        if (type === 'bookmarked') msg = 'Bạn có chắc chắn muốn xóa trạng thái "Đã lưu" cho tất cả từ vựng không?';

        if (!confirm(msg + ' Hành động này không thể hoàn tác.')) {
            return;
        }

        setIsResetMenuOpen(false);
        setIsResetting(true);
        try {
            const res = await fetch(`/api/toeic/vocabulary/tags?type=${type}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.refresh();
                window.location.reload();
            } else {
                alert('Có lỗi xảy ra khi đặt lại tiến độ. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Reset error:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsResetting(false);
        }
    };

	return (
		<div className="space-y-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Topic Dropdown */}
                <div className="relative z-30 w-full sm:max-w-md">
                    <div className="relative">
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
                                    className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-[320px] overflow-y-auto custom-scrollbar z-50"
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

                {/* Reset Progress Button with Dropdown */}
                <div className="relative flex justify-end">
                    <button 
                        onClick={() => setIsResetMenuOpen(!isResetMenuOpen)}
                        disabled={isResetting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded-2xl transition-all font-bold text-[13px] border border-slate-200/50 group whitespace-nowrap"
                    >
                        <svg className={`w-4 h-4 transition-transform duration-500 ${isResetting ? 'animate-spin' : (isResetMenuOpen ? 'rotate-180' : 'group-hover:rotate-180')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span>{isResetting ? 'Đang xử lý...' : 'Làm mới lộ trình'}</span>
                    </button>

                    <AnimatePresence>
                        {isResetMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsResetMenuOpen(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                                    className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                                >
                                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Tùy chọn đặt lại</div>
                                    <button onClick={() => handleReset('learned')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 transition-colors flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500" /> Xóa "Đã thuộc"
                                    </button>
                                    <button onClick={() => handleReset('hard')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Xóa "Từ khó"
                                    </button>
                                    <button onClick={() => handleReset('bookmarked')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-500 transition-colors flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Xóa "Đã lưu"
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button onClick={() => handleReset('all')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Đặt lại toàn bộ
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

			{/* Tag Chips */}
			<div>
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
