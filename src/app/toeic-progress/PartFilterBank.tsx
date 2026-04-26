'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PartFilterBank({ type, activePart }: { type: 'reading' | 'listening' | 'actual-test' | 'grammar', activePart?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    let parts = [];
    if (type === 'listening') parts = [1, 2, 3, 4];
    else if (type === 'reading') parts = [5, 6, 7];
    else if (type === 'grammar') parts = [5];
    else parts = [1, 2, 3, 4, 5, 6, 7];

    if (parts.length <= 1) return null; // No need to show filter for grammar which only has Part 5

    const [selectedParts, setSelectedParts] = useState<string[]>([]);

    useEffect(() => {
        setSelectedParts(activePart ? activePart.split(',').filter(Boolean) : []);
    }, [activePart]);

    const handlePartClick = (part: number) => {
        const strPart = String(part);
        let newParts = [...selectedParts];
        if (newParts.includes(strPart)) {
            newParts = newParts.filter(p => p !== strPart);
        } else {
            newParts.push(strPart);
        }
        setSelectedParts(newParts);

        const params = new URLSearchParams(searchParams.toString());
        if (newParts.length > 0) {
            params.set('part', newParts.join(','));
        } else {
            params.delete('part');
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-3 border border-slate-200 rounded-xl shadow-sm w-fit select-none">
            <span className="text-sm font-bold text-slate-800 mr-2 cursor-default">Lọc theo Part:</span>
            {parts.map(p => {
                const isActive = selectedParts.includes(String(p));
                return (
                    <label key={p} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isActive 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-slate-300 bg-white group-hover:border-primary-400'
                        }`}>
                            {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm font-bold text-slate-800 transition-colors">
                            Part {p}
                        </span>
                        {/* Hidden input to handle click logic easily without breaking state */}
                        <input 
                            type="checkbox" 
                            name="part-filter" 
                            className="hidden" 
                            checked={isActive} 
                            onChange={() => handlePartClick(p)} 
                        />
                    </label>
                );
            })}
        </div>
    );
}
