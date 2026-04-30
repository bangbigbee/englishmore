'use client';

export default function VocabularyHeatmap({ heatmap }: { heatmap: any[] }) {
    if (!heatmap || heatmap.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="text-xl">🔥</span> Nhịp độ học tập (14 ngày qua)
                </h3>
            </div>
            <div className="flex justify-between items-end gap-1.5 sm:gap-2">
                {heatmap.map((d: any, i: number) => {
                    let colorClass = "bg-slate-100";
                    if (d.count > 0) colorClass = "bg-primary-200";
                    if (d.count >= 10) colorClass = "bg-primary-400";
                    if (d.count >= 30) colorClass = "bg-primary-600";
                    if (d.count >= 50) colorClass = "bg-primary-800";

                    const isToday = i === heatmap.length - 1; // last array item

                    return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                            <div className="text-[10px] text-slate-400 font-bold hidden sm:block truncate opacity-60">
                                {d.dayLabel}
                            </div>
                            
                            <div 
                                className={`w-full max-w-[28px] aspect-square rounded-md ${colorClass} transition-transform hover:scale-110 cursor-pointer ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                                title={`${d.dateLabel}: Tâm đắc ${d.count} từ vựng`}
                            />
                            
                            {/* Tooltip on mobile */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none z-10">
                                {d.dateLabel}: {d.count} từ
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
                <span>Nhẹ</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-200"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-600"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-800"></div>
                </div>
                <span>Căng</span>
            </div>
        </div>
    );
}
