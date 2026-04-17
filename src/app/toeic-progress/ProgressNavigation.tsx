'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const TABS = [
	{ id: 'vocabulary-bank', label: 'Sổ Từ Vựng', icon: '📔' },
	{ id: 'grammar', label: 'Sổ Ngữ Pháp', icon: '📝' },
	{ id: 'reading', label: 'Sổ Luyện Đọc', icon: '📖' },
	{ id: 'listening', label: 'Sổ Luyện Nghe', icon: '🎧' },
	{ id: 'actual-test', label: 'Luyện Đề', icon: '🎓' },
	{ id: 'reports', label: 'Báo Cáo Tiến Độ', icon: '📈' },
];

export default function ProgressNavigation({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabChange = (newTab: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('tab', newTab);
        router.push(`/toeic-progress?${params.toString()}`);
    };

    return (
        <div className="w-full relative z-20">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col gap-1.5 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm sticky top-24">
                <div className="px-3 pt-2 pb-5 mb-2 border-b border-slate-100 flex items-center gap-3">
                    <span className="w-[32px] h-[32px] shrink-0 rounded-[10px] bg-green-50 text-[#14532d] flex items-center justify-center shadow-inner">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </span>
					<h2 className="font-black text-slate-800 text-[17px] tracking-tight">Tiến Độ Của Bạn</h2>
                </div>
                
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`flex items-center justify-start gap-3.5 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer group ${
                            activeTab === t.id 
                            ? 'bg-green-50 text-[#14532d] shadow-sm relative' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                        onClick={() => handleTabChange(t.id)}
                    >
                        {activeTab === t.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#ea980c] rounded-r-full" />
                        )}
                        <span className={`w-[28px] h-[28px] shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 ${activeTab === t.id ? 'bg-white shadow-sm scale-110' : 'bg-slate-100 text-slate-400 group-hover:scale-105 group-hover:bg-white group-hover:shadow-sm'}`}>
                            <span className="text-[13px]">{t.icon}</span>
                        </span>
                        <span className="flex-1 truncate text-[14px] leading-none pt-0.5">{t.label}</span>
                    </button>
                ))}

                <div className="py-2 px-3">
                    <div className="h-px bg-slate-100 w-full" />
                </div>

                {/* Desktop "Quay lại luyện tập" */}
                <Link href="/toeic-practice" className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer text-slate-500 hover:bg-slate-50 hover:text-slate-800 group">
                    <span className="w-[28px] h-[28px] shrink-0 rounded-lg flex items-center justify-center transition-all duration-300 bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:-translate-x-1">
                        <svg className="w-4 h-4 text-[#14532d]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
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
                    <svg className="w-5 h-5 text-[#14532d] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <span className="truncate flex-1 text-left text-[15px]">{TABS.find(t => t.id === activeTab)?.label || 'Chọn mục'}</span>
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {/* Mobile Drawer Menu */}
            <div className={`fixed inset-0 z-[100] isolate transition md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isMobileMenuOpen}>
				<button type="button" onClick={() => setIsMobileMenuOpen(false)} className={`absolute inset-0 z-0 bg-slate-950/40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
				<aside className={`absolute left-0 top-0 z-10 flex h-screen w-[min(20rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
					<div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
						<h2 className="font-black text-slate-800 text-lg flex items-center gap-2 tracking-tight">
							<span className="w-8 h-8 rounded-[10px] bg-green-100 text-[#14532d] flex items-center justify-center font-bold text-lg">📈</span>
							Tiến Độ Của Bạn
						</h2>
						<button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
						</button>
					</div>

					<nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
						<div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#14532d]/40 px-2">Phân hệ thống kê</div>
						{TABS.map((t) => (
							<button
								key={t.id}
								className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer ${activeTab === t.id ? 'bg-green-50 text-green-700 border border-green-200 shadow-[0_4px_12px_rgba(20,83,45,0.05)] relative z-10' : 'text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
								onClick={() => {
									handleTabChange(t.id);
									setIsMobileMenuOpen(false);
								}}
							>
								<span className={`w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors ${activeTab === t.id ? 'bg-white shadow-sm' : 'bg-slate-100/80 text-slate-400 group-hover:bg-slate-200/80'}`}>
									<div className="scale-[0.8]">{t.icon}</div>
								</span>
								<span className="flex-1 truncate text-[15px]">{t.label}</span>
								{activeTab === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0 shadow-[0_0_8px_rgba(234,152,12,0.6)]" />}
							</button>
						))}

						<div className="py-4">
							<div className="h-px bg-slate-100 w-full" />
						</div>

						<Link href="/toeic-practice" className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900">
							<span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors bg-slate-100/80 text-slate-400">
								<svg className="w-5 h-5 text-[#14532d]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
							</span>
							<span className="flex-1 truncate text-[15px]">Quay lại ToeicMore</span>
						</Link>
					</nav>
				</aside>
			</div>
        </div>
    )
}
