'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function QuestionBankFilter({ showHistory = false }: { showHistory?: boolean }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    
    // Default to 'mistakes' to align with user's request
    const filter = searchParams.get('filter') || 'mistakes'

    // Support multiple parts
    const currentPartsStr = searchParams.get('part') || '';
    const currentParts = currentPartsStr ? currentPartsStr.split(',').map(Number) : [];

    const setFilter = (newFilter: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('filter', newFilter)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const togglePart = (partNum: number) => {
        const params = new URLSearchParams(searchParams.toString());
        let newParts = [...currentParts];
        if (newParts.includes(partNum)) {
            newParts = newParts.filter(p => p !== partNum);
        } else {
            newParts.push(partNum);
        }
        if (newParts.length > 0) {
            params.set('part', newParts.join(','));
        } else {
            params.delete('part');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-nowrap overflow-x-auto gap-2 bg-slate-100/80 p-1.5 rounded-xl w-full sm:w-fit border border-slate-200/50 custom-scrollbar pb-2.5 sm:pb-1.5">
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

            {/* Multiple Choice Parts Filter */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-sm font-bold text-black mr-2">Lọc theo Part:</span>
                {[1, 2, 3, 4, 5, 6, 7].map(partNum => (
                    <label key={partNum} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${currentParts.includes(partNum) ? 'bg-[#14532d] border-[#14532d]' : 'border-slate-300 bg-white group-hover:border-[#14532d]/50'}`}>
                            {currentParts.includes(partNum) && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-bold text-black">Part {partNum}</span>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={currentParts.includes(partNum)} 
                            onChange={() => togglePart(partNum)}
                        />
                    </label>
                ))}
            </div>
        </div>
    )
}
