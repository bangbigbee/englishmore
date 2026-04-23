'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function PartFilterBank({ type, activePart }: { type: 'reading' | 'listening' | 'actual-test' | 'grammar', activePart?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    let parts = [];
    if (type === 'listening') parts = [1, 2, 3, 4];
    else if (type === 'reading') parts = [5, 6, 7];
    else if (type === 'grammar') parts = [5];
    else parts = [1, 2, 3, 4, 5, 6, 7];

    if (parts.length <= 1) return null; // No need to show filter for grammar which only has Part 5

    const handlePartClick = useCallback((part: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (activePart === String(part)) {
            params.delete('part');
        } else {
            params.set('part', String(part));
        }
        router.push(`?${params.toString()}`, { scroll: false });
    }, [activePart, searchParams, router]);

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-bold text-slate-500 mr-2">Lọc theo Part:</span>
            {parts.map(p => {
                const isActive = activePart === String(p);
                return (
                    <button
                        key={p}
                        onClick={() => handlePartClick(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                            isActive 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                    >
                        Part {p}
                    </button>
                );
            })}
        </div>
    );
}
