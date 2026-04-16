'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const TABS = [
	{ id: 'vocabulary-bank', label: 'Sổ Từ Vựng', icon: '📔' },
	{ id: 'grammar', label: 'Ngữ Pháp', icon: '📝' },
	{ id: 'vocabulary', label: 'Từ Vựng', icon: '🎯' },
	{ id: 'listening', label: 'Listening', icon: '🎧' },
	{ id: 'reading', label: 'Reading', icon: '📖' },
	{ id: 'actual-test', label: 'Luyện Đề', icon: '🎓' },
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
        <div className="flex justify-between items-center mb-6 md:mb-10 pb-0 md:pb-4 border-b border-transparent md:border-slate-200/60">
            {/* Desktop Tabs */}
            <div className="hidden md:flex gap-8 pr-4 overflow-x-auto scrollbar-hide">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap`}
                        onClick={() => handleTabChange(t.id)}
                    >
                        <span className={`text-xl transition-transform duration-300 ${activeTab === t.id ? "scale-110" : "opacity-60 scale-100 group-hover:opacity-100"}`}>
                            {t.icon}
                        </span>
                        <span className={`text-sm font-bold tracking-tight transition-all pb-1 border-b-2 ${
                            activeTab === t.id 
                                ? "text-[#14532d] border-[#ea980c]" 
                                : "text-slate-400 border-transparent group-hover:text-slate-600"
                        }`}>
                            {t.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center justify-between w-full">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 font-bold active:scale-[0.98] transition-transform w-full"
                >
                    <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <span className="truncate">{TABS.find(t => t.id === activeTab)?.label || 'Chọn mục'}</span>
                </button>
            </div>

            {/* Desktop "Quay lại luyện tập" */}
            <Link href="/toeic-practice" className="hidden md:flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap shrink-0 ml-auto">
                <span className="transition-transform duration-300 opacity-60 scale-100 group-hover:opacity-100 group-hover:-translate-x-1">
                    <svg className="w-[18px] h-[18px] text-[#14532d]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </span>
                <span className="text-sm font-bold tracking-tight transition-all text-slate-400 group-hover:text-[#14532d]">
                    Về ToeicMore
                </span>
            </Link>

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
						<div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#14532d]/40 px-2">Báo Cáo Thống Kê</div>
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
								<span className="flex-1 truncate truncate text-[15px]">{t.label}</span>
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
