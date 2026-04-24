'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const PROGRESS_TABS = [
	{ id: 'reports-vocabulary', label: 'Tiến độ từ vựng', icon: '📊' },
	{ id: 'reports-grammar', label: 'Tiến độ ngữ pháp', icon: '📈' },
	{ id: 'reports-listening', label: 'Tiến độ luyện nghe', icon: '📻' },
	{ id: 'reports-reading', label: 'Tiến độ luyện đọc', icon: '📉' },
	{ id: 'reports-actual-test', label: 'Tiến độ luyện đề', icon: '🏆' },
];

const BANK_TABS = [
	{ id: 'vocabulary-bank', label: 'Sổ Tay Từ Vựng', icon: '📔', subMenus: [
        { id: 'all', label: 'Tất cả từ', param: 'tag' },
        { id: 'bookmarked', label: 'Đã lưu', param: 'tag' },
        { id: 'hard', label: 'Từ khó', param: 'tag' },
        { id: 'learned', label: 'Đã thuộc', param: 'tag' }
    ] },
	{ id: 'grammar-bank', label: 'Sổ Tay Ngữ Pháp', icon: '📝', subMenus: [
        { id: 'mistakes', label: 'Câu làm sai', param: 'filter' },
        { id: 'bookmarks', label: 'Câu đã lưu', param: 'filter' }
    ] },
	{ id: 'listening-bank', label: 'Sổ Tay Luyện Nghe', icon: '🎧', subMenus: [
        { id: 'mistakes', label: 'Câu làm sai', param: 'filter' },
        { id: 'bookmarks', label: 'Câu đã lưu', param: 'filter' }
    ] },
	{ id: 'reading-bank', label: 'Sổ Tay Luyện Đọc', icon: '📖', subMenus: [
        { id: 'mistakes', label: 'Câu làm sai', param: 'filter' },
        { id: 'bookmarks', label: 'Câu đã lưu', param: 'filter' }
    ] },
	{ id: 'actual-test-bank', label: 'Sổ Tay Luyện Đề', icon: '🎓', subMenus: [
        { id: 'mistakes', label: 'Câu làm sai', param: 'filter' },
        { id: 'bookmarks', label: 'Câu đã lưu', param: 'filter' },
        { id: 'history', label: 'Lịch sử Luyện đề', param: 'filter' }
    ] },
];

export default function ProgressNavigation({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabChange = (newTab: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('tab', newTab);
        
        // Remove existing sub-menu params when changing main tab
        params.delete('filter');
        params.delete('tag');
        
        router.push(`/toeic-progress?${params.toString()}`);
    };

    const handleSubMenuChange = (tabId: string, param: string, value: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('tab', tabId);
        
        if (param === 'filter') {
            params.set('filter', value);
            params.delete('tag');
        } else if (param === 'tag') {
            if (value === 'all') {
                params.delete('tag');
            } else {
                params.set('tag', value);
            }
            params.delete('filter');
        }
        
        router.push(`/toeic-progress?${params.toString()}`);
    };

    return (
        <div className="w-full">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col gap-1.5 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm sticky top-24 z-20">
                <div className="mb-2 px-3">
                    {activeTab?.startsWith('reports') && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3 mt-2">Tiến độ luyện đề</h3>
                            <div className="flex flex-col gap-1">
                                {PROGRESS_TABS.map((t) => (
                                    <button
                                        key={t.id}
                                        className={`flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer group ${
                                            activeTab === t.id 
                                            ? 'bg-purple-50 text-[#581c87] shadow-sm relative ring-1 ring-purple-100' 
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                        onClick={() => handleTabChange(t.id)}
                                    >
                                        {activeTab === t.id && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#ea980c] rounded-r-full" />
                                        )}
                                        <span className={`w-[24px] h-[24px] shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 ${activeTab === t.id ? 'bg-white shadow-sm scale-110' : 'bg-slate-50 text-slate-400 group-hover:scale-110'}`}>
                                            <span className="text-[12px]">{t.icon}</span>
                                        </span>
                                        <span className="flex-1 truncate text-[13px] leading-none pt-0.5">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab?.includes('-bank') && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3 mt-2">Sổ tay của tôi</h3>
                            <div className="flex flex-col gap-1">
                                {BANK_TABS.map((t) => (
                                    <div key={t.id} className="flex flex-col">
                                        <button
                                            className={`flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer group ${
                                                activeTab === t.id 
                                                ? 'bg-purple-50 text-[#581c87] shadow-sm relative ring-1 ring-purple-100' 
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                            onClick={() => handleTabChange(t.id)}
                                        >
                                            {activeTab === t.id && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#ea980c] rounded-r-full" />
                                            )}
                                            <span className={`w-[24px] h-[24px] shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 ${activeTab === t.id ? 'bg-white shadow-sm scale-110' : 'bg-slate-50 text-slate-400 group-hover:scale-110'}`}>
                                                <span className="text-[12px]">{t.icon}</span>
                                            </span>
                                            <span className="flex-1 truncate text-[13px] leading-none pt-0.5">{t.label}</span>
                                        </button>
                                        
                                        {activeTab === t.id && t.subMenus && (
                                            <div className="flex flex-col gap-1 mt-1 pl-11 relative">
                                                <div className="absolute left-6 top-0 bottom-3 w-px bg-slate-200"></div>
                                                {t.subMenus.map(sub => {
                                                    const isActive = sub.param === 'filter' 
                                                        ? (searchParams?.get('filter') || 'mistakes') === sub.id 
                                                        : (searchParams?.get('tag') || 'all') === sub.id;
                                                    return (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => handleSubMenuChange(t.id, sub.param, sub.id)}
                                                            className={`flex items-center justify-start gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all text-left cursor-pointer relative ${
                                                                isActive
                                                                ? 'text-[#581c87] bg-purple-50/50'
                                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div className={`absolute left-[-20px] top-1/2 -translate-y-1/2 w-3 h-px ${isActive ? 'bg-[#581c87]' : 'bg-slate-200'}`}></div>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                                sub.id === 'mistakes' || sub.id === 'hard' ? 'bg-rose-500' :
                                                                sub.id === 'bookmarks' || sub.id === 'bookmarked' ? 'bg-[#ea980c]' :
                                                                sub.id === 'learned' ? 'bg-purple-500' :
                                                                sub.id === 'history' ? 'bg-purple-500' : 'bg-slate-400'
                                                            }`}></div>
                                                            {sub.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="py-2 px-3">
                    <div className="h-px bg-slate-100 w-full" />
                </div>

                {/* Desktop "Quay lại luyện tập" */}
                <Link href="/toeic-practice" className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-slate-800 group">
                    <span className="w-[28px] h-[28px] shrink-0 rounded-lg flex items-center justify-center transition-all duration-300 bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:-translate-x-1">
                        <svg className="w-4 h-4 text-[#581c87]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </span>
                    <span className="text-[14px] leading-none pt-0.5">Về ToeicMore</span>
                </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center justify-between w-full mb-6">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-700 font-bold active:scale-[0.98] transition-transform w-full"
                >
                    <svg className="w-5 h-5 text-[#581c87] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <span className="truncate flex-1 text-left text-[15px]">
                        {([...PROGRESS_TABS, ...BANK_TABS].find(t => t.id === activeTab)?.label || 'Chọn mục')}
                    </span>
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {/* Mobile Drawer Menu */}
            <div className={`fixed inset-0 z-[100] isolate transition md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isMobileMenuOpen}>
				<button type="button" onClick={() => setIsMobileMenuOpen(false)} className={`absolute inset-0 z-0 bg-slate-950/40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
				<aside className={`absolute left-0 top-0 z-10 flex h-screen w-[min(20rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
					<div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
						<div className="font-black text-slate-800 text-lg flex items-center gap-2 tracking-tight text-left">
							<span className="w-8 h-8 rounded-[10px] flex items-center justify-center font-bold text-lg bg-[#581c87] text-white">📈</span>
							Tiến Độ & Sổ Tay
						</div>
						<button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
						</button>
					</div>

					<nav className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {activeTab?.startsWith('reports') && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">TIẾN ĐỘ LUYỆN ĐỀ</h4>
                                <div className="space-y-1">
                                    {PROGRESS_TABS.map((t) => (
                                        <button
                                            key={t.id}
                                            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-left cursor-pointer ${activeTab === t.id ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-[0_4px_12px_rgba(88, 28, 135,0.05)] relative z-10' : 'text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
                                            onClick={() => {
                                                handleTabChange(t.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${activeTab === t.id ? 'bg-white shadow-sm' : 'bg-slate-100/80 text-slate-400'}`}>
                                                <div className="scale-[0.8]">{t.icon}</div>
                                            </span>
                                            <span className="flex-1 truncate text-[14px]">{t.label}</span>
                                            {activeTab === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab?.includes('-bank') && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">SỔ TAY CỦA TÔI</h4>
                                <div className="space-y-1">
                                    {BANK_TABS.map((t) => (
                                        <div key={t.id} className="flex flex-col gap-1">
                                            <button
                                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-left cursor-pointer ${activeTab === t.id ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-[0_4px_12px_rgba(88, 28, 135,0.05)] relative z-10' : 'text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
                                                onClick={() => {
                                                    handleTabChange(t.id);
                                                    if (!t.subMenus) {
                                                        setIsMobileMenuOpen(false);
                                                    }
                                                }}
                                            >
                                                <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${activeTab === t.id ? 'bg-white shadow-sm' : 'bg-slate-100/80 text-slate-400'}`}>
                                                    <div className="scale-[0.8]">{t.icon}</div>
                                                </span>
                                                <span className="flex-1 truncate text-[14px]">{t.label}</span>
                                                {activeTab === t.id && !t.subMenus && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0" />}
                                            </button>
                                            
                                            {activeTab === t.id && t.subMenus && (
                                                <div className="flex flex-col gap-1 pl-12 mt-1 relative">
                                                    <div className="absolute left-[34px] top-0 bottom-4 w-px bg-slate-200"></div>
                                                    {t.subMenus.map(sub => {
                                                        const isActive = sub.param === 'filter' 
                                                            ? (searchParams?.get('filter') || 'mistakes') === sub.id 
                                                            : (searchParams?.get('tag') || 'all') === sub.id;
                                                        return (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => {
                                                                    handleSubMenuChange(t.id, sub.param, sub.id);
                                                                    setIsMobileMenuOpen(false);
                                                                }}
                                                                className={`flex items-center justify-start gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all text-left cursor-pointer relative ${
                                                                    isActive
                                                                    ? 'text-[#581c87] bg-purple-50/50 ring-1 ring-purple-100'
                                                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <div className={`absolute left-[-14px] top-1/2 -translate-y-1/2 w-3 h-px ${isActive ? 'bg-[#581c87]' : 'bg-slate-200'}`}></div>
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    sub.id === 'mistakes' || sub.id === 'hard' ? 'bg-rose-500' :
                                                                    sub.id === 'bookmarks' || sub.id === 'bookmarked' ? 'bg-[#ea980c]' :
                                                                    sub.id === 'learned' ? 'bg-purple-500' :
                                                                    sub.id === 'history' ? 'bg-purple-500' : 'bg-slate-400'
                                                                }`}></div>
                                                                {sub.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

						<div className="py-4">
							<div className="h-px bg-slate-100 w-full" />
						</div>

						<Link href="/toeic-practice" className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900">
							<span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors bg-slate-100/80 text-slate-400">
								<svg className="w-5 h-5 text-[#581c87]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
							</span>
							<span className="flex-1 truncate text-[15px]">Quay lại ToeicMore</span>
						</Link>
					</nav>
				</aside>
			</div>
        </div>
    )
}
