'use client';

import { useState, useEffect } from 'react';
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
    const currentQ = searchParams.get('q') || '';
    
    const [searchQuery, setSearchQuery] = useState(currentQ);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (searchParams.get('q') || '')) {
                updateFilters(currentTopic, currentTag, searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, currentTopic, currentTag, searchParams]);

	const updateFilters = (newTopic: string, newTag: string, newQ: string = currentQ) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', 'vocabulary-bank');
		
		if (newTopic === 'all') params.delete('topic');
		else params.set('topic', newTopic);
		
		if (newTag === 'all') params.delete('tag');
		else params.set('tag', newTag);
		
        if (!newQ.trim()) params.delete('q');
        else params.set('q', newQ.trim());

		router.push(`?${params.toString()}`, { scroll: false });
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
		<div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Bar & Topic Dropdown Wrap */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-2xl">
                    {/* Search Bar */}
                    <div className="relative w-full sm:flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm từ vựng, tiếng Việt..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 sm:text-sm transition-all shadow-sm"
                        />
                    </div>

                    {/* Topic Dropdown */}
                    <div className="relative z-30 w-full sm:w-[220px] shrink-0">
                        <div className="relative">
                            <button 
                                onClick={() => setIsTopicOpen(!isTopicOpen)}
                                className="w-full flex items-center justify-between gap-2 px-3.5 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary-900/30 hover:shadow-md transition-all group active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className="w-5 h-5 rounded-[6px] bg-primary-50 text-primary-900 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                    </span>
                                    <span className="text-[13px] font-bold text-slate-700 truncate w-full">{currentTopic === 'all' ? 'Tất cả chủ đề' : currentTopic}</span>
                                </div>
                                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isTopicOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            <AnimatePresence>
                                {isTopicOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-1 max-h-[320px] overflow-y-auto custom-scrollbar z-50 w-[280px]"
                                    >
                                        <button 
                                            onClick={() => { updateFilters('all', currentTag, searchQuery); setIsTopicOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-4 ${currentTopic === 'all' ? 'bg-primary-50 border-[#ea980c] text-primary-900' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <span className="text-[13px] font-bold">Tất cả chủ đề</span>
                                        </button>
                                        {topics.map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => { updateFilters(t, currentTag, searchQuery); setIsTopicOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-4 ${currentTopic === t ? 'bg-primary-50 border-[#ea980c] text-primary-900' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <span className="text-[13px] font-bold truncate">{t}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Reset Progress Button with Dropdown */}
                <div className="relative flex justify-start sm:justify-end shrink-0">
                    <button 
                        onClick={() => setIsResetMenuOpen(!isResetMenuOpen)}
                        disabled={isResetting}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all font-bold text-[12px] sm:text-[13px] border border-slate-200/50 shadow-sm group whitespace-nowrap"
                    >
                        <svg className={`w-4 h-4 text-primary-900 transition-transform duration-500 ${isResetting ? 'animate-spin' : (isResetMenuOpen ? 'rotate-180' : 'group-hover:rotate-180')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
                                    <button onClick={() => handleReset('learned')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary-500" /> Xóa "Đã thuộc"
                                    </button>
                                    <button onClick={() => handleReset('hard')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Xóa "Từ khó"
                                    </button>
                                    <button onClick={() => handleReset('bookmarked')} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-secondary-500 transition-colors flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-secondary-500" /> Xóa "Đã lưu"
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
				<div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 custom-scrollbar">
					{[
						{ id: 'all', label: 'Tất cả trạng thái', icon: '🌈', activeClass: 'bg-slate-800 text-white border-slate-800' },
						{ id: 'bookmarked', label: '⭐ Câu đã lưu', icon: '⭐', activeClass: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
						{ id: 'hard', label: '❌ Từ khó', icon: '❌', activeClass: 'bg-rose-50 text-rose-600 border-rose-200' },
						{ id: 'learned', label: '✓ Đã thuộc', icon: '✓', activeClass: 'bg-primary-50 text-primary-700 border-primary-200' }
					].map(tag => (
						<button 
							key={tag.id}
							onClick={() => updateFilters(currentTopic, tag.id, searchQuery)}
							className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0 whitespace-nowrap border ${currentTag === tag.id ? tag.activeClass + ' shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
						>
							{tag.label}
						</button>
					))}
				</div>
			</div>

		</div>
	);
}
