'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function QuestionBankFilter() {
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
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shrink-0 whitespace-nowrap ${filter === 'mistakes' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
                <span className="text-rose-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </span>
                Câu làm sai
            </button>
            <button 
                onClick={() => setFilter('bookmarks')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 shrink-0 whitespace-nowrap ${filter === 'bookmarks' ? 'bg-white text-[#ea980c] shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
                <span>⭐</span> Câu đã lưu
            </button>
        </div>
    )
}
