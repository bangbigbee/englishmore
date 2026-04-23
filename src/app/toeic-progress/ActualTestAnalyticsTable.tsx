'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface RecordStat {
    id: string;
    testId: string;
    title: string | null;
    mode: string;
    duration: number;
    scoreListening: number | null;
    scoreReading: number | null;
    correctAnswers: number;
    totalQuestions: number;
    partStats: Record<string, { correct: number, total: number }> | null;
    createdAt: Date;
}

export default function ActualTestAnalyticsTable({ records }: { records: RecordStat[] }) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [filterMode, setFilterMode] = useState<string>('all');
    const [filterTest, setFilterTest] = useState<string>('all');

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filters
    const testNamesMap = useMemo(() => {
        const map = new Map<string, string>();
        records.forEach(r => {
            if (r.testId && r.title && !map.has(r.title)) {
                map.set(r.title, r.title);
            }
        });
        return Array.from(map.values());
    }, [records]);

    const filteredRecords = useMemo(() => {
        let result = records;
        if (filterMode !== 'all') {
            result = result.filter(r => r.mode === filterMode);
        }
        if (filterTest !== 'all') {
            result = result.filter(r => r.title === filterTest);
        }
        return result;
    }, [records, filterMode, filterTest]);

    // Simple Sparkline Data
    const actualTestsOnly = useMemo(() => [...records].filter(r => r.mode === 'actual').reverse(), [records]); // chronological order
    
    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 mb-1 tracking-tight">Tổng Lượt Làm Bài</div>
                    <div className="text-3xl font-black text-slate-800">{records.length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 mb-1 tracking-tight">Lượt Thi Thử (Lấy Điểm)</div>
                    <div className="text-3xl font-black text-orange-600">{records.filter(r => r.mode === 'actual').length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 mb-1 tracking-tight">Đỉnh Điểm Thi Thử</div>
                    <div className="text-3xl font-black text-emerald-600">
                        {Math.max(...records.filter(r => r.mode === 'actual').map(r => (r.scoreListening || 0) + (r.scoreReading || 0)), 0)}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 mb-1 tracking-tight">Trung bình TG/Đề</div>
                    <div className="text-3xl font-black text-blue-600">
                        {records.length > 0 ? Math.floor(records.reduce((acc, r) => acc + r.duration, 0) / records.length / 60) : 0} <span className="text-lg">phút</span>
                    </div>
                </div>
            </div>

            {/* PROGRESS CHART (DOM CSS based) */}
            {actualTestsOnly.length > 1 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden hidden md:block">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Mức tăng trưởng điểm qua các bài Thi Thử</h3>
                    <div className="h-40 w-full flex items-end justify-between gap-2 overflow-x-auto pb-4">
                        {actualTestsOnly.map((r, i) => {
                            const score = (r.scoreListening || 0) + (r.scoreReading || 0);
                            const maxScore = 990;
                            const heightPct = Math.max((score / maxScore) * 100, 5); // min 5%
                            
                            return (
                                <div key={r.id + i} className="flex flex-col items-center flex-1 min-w-[40px] group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 flex flex-col items-center rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                        <span className="font-bold">{score} / 990 pts</span>
                                        <span className="text-[10px] text-slate-300">{new Date(r.createdAt).toLocaleDateString('vi', {day: '2-digit', month: '2-digit'})}</span>
                                    </div>
                                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 mb-2">{score}</div>
                                    <div className="w-full sm:w-10 bg-orange-100 rounded-t-md overflow-hidden relative" style={{ height: `${heightPct}%`, minHeight: '20px' }}>
                                        <div className="absolute bottom-0 w-full bg-orange-500 rounded-t-sm transition-all duration-500" style={{ height: '100%' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 md:px-6 md:py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <h2 className="text-xl font-black text-slate-800 shrink-0">Bảng Phân Tích Chi Tiết</h2>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select 
                            value={filterTest} 
                            onChange={(e) => setFilterTest(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 flex-1 md:w-48 appearance-none"
                        >
                            <option value="all">Tất cả đề thi</option>
                            {testNamesMap.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select 
                            value={filterMode} 
                            onChange={(e) => setFilterMode(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 flex-1 md:w-40 appearance-none"
                        >
                            <option value="all">Mọi Chế độ</option>
                            <option value="actual">Chỉ Thi Thử</option>
                            <option value="practice">Chỉ Luyện Tập</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-4 px-4 font-bold">Ngày Làm</th>
                                <th className="py-4 px-4 font-bold">Tên Đề</th>
                                <th className="py-4 px-4 font-bold text-center">Parts Đã Làm</th>
                                <th className="py-4 px-4 font-bold text-center">Chế Độ</th>
                                <th className="py-4 px-4 font-bold text-center">TG Dùng</th>
                                <th className="py-4 px-4 font-bold text-center">Số Câu</th>
                                <th className="py-4 px-4 font-bold text-right">Tổng Điểm</th>
                                <th className="py-4 px-4 font-bold text-center w-24">Tuỳ Chọn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">Không tìm thấy bản ghi nào khớp lọc.</td>
                                </tr>
                            ) : filteredRecords.map((r) => {
                                const isExpanded = expandedRows[r.id];
                                const scoreCombo = (r.scoreListening || 0) + (r.scoreReading || 0);

                                let partsTakenStr = 'N/A';
                                if (r.partStats) {
                                    const parts = Object.keys(r.partStats).map(k => k.replace('part', '')).sort((a, b) => Number(a) - Number(b));
                                    if (parts.length === 7) {
                                        partsTakenStr = 'Tất cả';
                                    } else if (parts.length > 0) {
                                        partsTakenStr = `Part ${parts.join(', ')}`;
                                    }
                                }

                                return (
                                    <React.Fragment key={r.id}>
                                        <tr 
                                            onClick={() => toggleRow(r.id)}
                                            className={`cursor-pointer hover:bg-slate-50 transition-colors group ${isExpanded ? 'bg-slate-50' : 'bg-white'}`}
                                        >
                                            <td className="py-4 px-4 font-medium text-slate-600">
                                                {new Date(r.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-800 truncate max-w-[200px]" title={r.title || r.testId}>
                                                {r.title || r.testId}
                                            </td>
                                            <td className="py-4 px-4 text-center text-slate-500 text-xs font-bold">
                                                {partsTakenStr}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${r.mode === 'actual' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {r.mode === 'actual' ? 'THI THỬ' : 'LUYỆN TẬP'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center font-medium">
                                                {Math.floor(r.duration / 60)}m {r.duration % 60}s
                                            </td>
                                            <td className="py-2 px-4 text-center font-medium">
                                                <div className="flex flex-col items-center justify-center gap-0.5">
                                                    <div>
                                                        <span className={r.correctAnswers > 0 ? "text-emerald-600" : ""}>{r.correctAnswers}</span><span className="text-slate-400">/{r.totalQuestions}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold transition-opacity whitespace-nowrap">
                                                        Xem chi tiết
                                                        <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right font-black text-base">
                                                {r.mode === 'actual' ? (
                                                    <span className="text-orange-600">{scoreCombo} <span className="text-xs font-medium text-slate-400">pts</span></span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Link
                                                    href={`/toeic-practice/actual-test/${r.testId}/review/${r.id}`}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Review
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={8} className="py-5 px-4 border-b-2 border-slate-100">
                                                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                                                        <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                                            {r.partStats ? (
                                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                                                    {[1,2,3,4,5,6,7].map(part => {
                                                                        const block = r.partStats?.[`part${part}`];
                                                                        if (!block) return null;
                                                                        const pct = Math.round((block.correct / block.total) * 100) || 0;
                                                                        let colorClass = 'bg-slate-100 text-slate-600';
                                                                        if (pct >= 80) colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                                                        else if (pct >= 50) colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
                                                                        else if (pct > 0) colorClass = 'bg-rose-100 text-rose-700 border-rose-200';

                                                                        return (
                                                                            <div key={part} className={`flex flex-col p-2.5 rounded-xl border items-center justify-center ${colorClass}`}>
                                                                                <div className="text-[10px] font-black tracking-wider uppercase mb-1 opacity-70">
                                                                                    {part <= 4 ? `L-Part ${part}` : `R-Part ${part}`}
                                                                                </div>
                                                                                <div className="text-base font-black flex items-baseline gap-1">
                                                                                    {block.correct} <span className="text-[11px] font-semibold opacity-60">/ {block.total}</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="text-slate-500 text-sm italic py-4 px-2 tracking-tight">
                                                                    Bản ghi cũ không lưu trữ chỉ số phụ cho từng Part. Hệ thống sẽ tự động tổng hợp những thông số này khi bạn làm bài ở cơ chế mới!
                                                                </div>
                                                            )}
                                                        </div>

                                                        {r.mode === 'actual' && (
                                                            <div className="lg:w-[320px] shrink-0 w-full bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 flex justify-between items-center shadow-sm">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-bold text-orange-600/80 mb-1">SCORE PBT</span>
                                                                    <span className="text-sm font-bold text-orange-900">List: <span className="text-orange-600">{r.scoreListening || 0}</span></span>
                                                                    <span className="text-sm font-bold text-orange-900">Read: <span className="text-orange-600">{r.scoreReading || 0}</span></span>
                                                                </div>
                                                                <div className="text-3xl font-black text-orange-600">{scoreCombo}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
