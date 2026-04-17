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
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-100/80 p-1.5 rounded-xl w-fit border border-slate-200/50">
            <button 
                onClick={() => setFilter('mistakes')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${filter === 'mistakes' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
                <span>🔥</span> Câu Làm Sai
            </button>
            <button 
                onClick={() => setFilter('bookmarks')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${filter === 'bookmarks' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
                <span>⭐</span> Đã Lưu (Bookmarks)
            </button>
        </div>
    )
}
