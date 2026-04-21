'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function QuestionBankFilter({ showHistory = false }: { showHistory?: boolean }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    
    // Default to 'mistakes' to align with user's request
    const filter = searchParams.get('filter') || 'mistakes'

    const setFilter = (newFilter: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('filter', newFilter)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex flex-nowrap overflow-x-auto gap-2 mb-6 bg-slate-100/80 p-1.5 rounded-xl w-full sm:w-fit border border-slate-200/50 custom-scrollbar pb-2.5 sm:pb-1.5">
            <button 
                onClick={() => setFilter('mistakes')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shrink-0 whitespace-nowrap ${filter === 'mistakes' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.4)]" />
                Câu làm sai
            </button>
            <button 
                onClick={() => setFilter('bookmarks')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shrink-0 whitespace-nowrap ${filter === 'bookmarks' ? 'bg-white text-[#ea980c] shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
                <span>⭐</span> Câu đã lưu
            </button>
            {showHistory && (
                <button 
                    onClick={() => setFilter('history')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shrink-0 whitespace-nowrap ${filter === 'history' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Lịch sử thi
                </button>
            )}
        </div>
    )
}
