'use client';

export default function VocabularyHeatmap({ heatmap }: { heatmap: any[] }) {
    if (!heatmap || heatmap.length === 0) return null;

    return (
        <div className="bg-white dark:bg-primary-950/20 rounded-2xl border border-slate-200 dark:border-primary-500/20 shadow-sm p-6 overflow-hidden w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-xl">🔥</span> Nhịp độ học tập 14 ngày qua
                </h3>
            </div>
            <div className="flex justify-between items-end gap-1.5 sm:gap-2">
                {heatmap.map((d: any, i: number) => {
                    let colorClass = "bg-slate-100 dark:bg-slate-800/80";
                    if (d.count > 0) colorClass = "bg-primary-200 dark:bg-primary-900/60";
                    if (d.count >= 10) colorClass = "bg-primary-400 dark:bg-primary-700/80";
                    if (d.count >= 30) colorClass = "bg-primary-600 dark:bg-primary-500";
                    if (d.count >= 50) colorClass = "bg-primary-800 dark:bg-primary-400";

                    const isToday = i === heatmap.length - 1; // last array item

                    return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold hidden sm:block truncate opacity-60 group-hover:opacity-100 transition-opacity">
                                {d.dayLabel}
                            </div>
                            
                            <div 
                                className={`w-full max-w-[28px] aspect-square rounded-md ${colorClass} transition-transform hover:scale-110 cursor-pointer ${isToday ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-primary-950' : ''}`}
                            />
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg pointer-events-none z-10 shadow-lg flex flex-col gap-1 items-start">
                                <span className="text-slate-300 dark:text-slate-300 mb-0.5 self-center">{d.dateLabel}</span>
                                <span className="flex items-center gap-1.5"><span className="text-yellow-400 text-sm leading-none drop-shadow-sm">⚡</span> Số câu: <strong className="text-white">{d.quizCount || 0}</strong></span>
                                <span className="flex items-center gap-1.5"><span className="text-emerald-400 text-sm leading-none drop-shadow-sm">🔖</span> Số từ: <strong className="text-white">{d.vocabCount || 0}</strong></span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Nhẹ</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800/80"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-200 dark:bg-primary-900/60"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-400 dark:bg-primary-700/80"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-600 dark:bg-primary-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-primary-800 dark:bg-primary-400"></div>
                </div>
                <span>Căng</span>
            </div>
        </div>
    );
}
