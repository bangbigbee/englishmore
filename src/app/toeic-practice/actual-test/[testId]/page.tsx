'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ActualTestLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.testId as string;

    const [testData, setTestData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'practice' | 'actual'>('practice');
    const [selectedParts, setSelectedParts] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

    const DEFAULT_TIMES: Record<number, number> = {
        1: 4, 2: 10, 3: 17, 4: 15, 5: 12, 6: 8, 7: 55
    };
    const [customTimeMinutes, setCustomTimeMinutes] = useState(0);
    const [isTimeCustomized, setIsTimeCustomized] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/toeic/actual-test/${testId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTestData(data);
                    // Pre-select all available parts
                    const availableParts = data.parts.map((p: any) => p.part).filter(Boolean);
                    setSelectedParts(availableParts);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    useEffect(() => {
        if (!isTimeCustomized) {
            if (mode === 'practice') {
                const sum = selectedParts.reduce((acc, part) => acc + (DEFAULT_TIMES[part] || 0), 0);
                setCustomTimeMinutes(sum);
            } else {
                setCustomTimeMinutes(120);
            }
        }
    }, [selectedParts, mode, isTimeCustomized]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500 font-medium animate-pulse">Đang tải cấu trúc đề thi...</div>
            </div>
        );
    }

    if (!testData || testData.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="text-rose-500 font-medium text-lg">Không tìm thấy đề thi.</div>
                <button onClick={() => router.push('/toeic-practice')} className="px-6 py-2 bg-slate-200 rounded-xl font-bold">Quay lại</button>
            </div>
        );
    }

    const availableParts = testData.parts.map((p: any) => p.part).filter(Boolean) as number[];

    const togglePart = (partId: number) => {
        setSelectedParts(prev => 
            prev.includes(partId) ? prev.filter(p => p !== partId) : [...prev, partId].sort()
        );
    };

    const handleStart = () => {
        if (mode === 'practice' && selectedParts.length === 0) {
            alert('Vui lòng chọn ít nhất 1 part để luyện tập!');
            return;
        }

        const query = new URLSearchParams();
        query.set('mode', mode);
        query.set('time', customTimeMinutes.toString());
        if (mode === 'practice') {
            query.set('parts', selectedParts.join(','));
        } else {
            // Actual test mode forces all parts and 120 mins
            query.set('parts', availableParts.join(','));
            query.set('time', '120');
        }

        router.push(`/toeic-practice/actual-test/${testId}/take?${query.toString()}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 md:py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/toeic-practice" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Quay lại danh sách
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
                    <div className="text-center mb-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mb-4">
                            {testData.collection}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">{testData.title}</h1>
                        <p className="mt-4 text-slate-500 font-medium">Đề gồm {availableParts.length} parts hiện có.</p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-10">
                        {/* Mode Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('practice')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${mode === 'practice' ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-blue-200'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`text-xl font-bold ${mode === 'practice' ? 'text-blue-700' : 'text-slate-700'}`}>Luyện Tập</h3>
                                    {mode === 'practice' && <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                </div>
                                <p className={`text-sm ${mode === 'practice' ? 'text-blue-600/80' : 'text-slate-500'}`}>
                                    Không giới hạn thời gian. Có thể tua audio, xem giải thích, và chọn từng Part cụ thể.
                                </p>
                            </button>

                            <button
                                onClick={() => setMode('actual')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${mode === 'actual' ? 'border-rose-500 bg-rose-50 ring-4 ring-rose-500/10' : 'border-slate-200 hover:border-rose-200'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`text-xl font-bold ${mode === 'actual' ? 'text-rose-700' : 'text-slate-700'}`}>Thi Thật</h3>
                                    {mode === 'actual' && <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                                </div>
                                <p className={`text-sm ${mode === 'actual' ? 'text-rose-600/80' : 'text-slate-500'}`}>
                                    Trải nghiệm thi như thật (120 phút). Full màn hình. Không tua audio. Làm liên tục Part 1-7.
                                </p>
                            </button>
                        </div>

                        {/* Part Selection for Practice Mode */}
                        {mode === 'practice' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-slate-800">Các Part muốn luyện tập:</h4>
                                    <button 
                                        onClick={() => selectedParts.length === availableParts.length ? setSelectedParts([]) : setSelectedParts([...availableParts])}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 underline"
                                    >
                                        {selectedParts.length === availableParts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả (Tick All)'}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {availableParts.map(partId => (
                                        <button
                                            key={partId}
                                            onClick={() => togglePart(partId)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedParts.includes(partId) ? 'bg-[#14532d] text-white border-[#14532d]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#14532d]'}`}
                                        >
                                            Part {partId}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <label className="font-bold text-slate-800">Thời gian làm bài (phút):</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={customTimeMinutes}
                                            onChange={(e) => {
                                                setIsTimeCustomized(true);
                                                setCustomTimeMinutes(Number(e.target.value) || 1);
                                            }}
                                            className="w-28 px-4 py-2 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-blue-500 font-bold text-slate-700 bg-white shadow-sm" 
                                        />
                                        <button 
                                            onClick={() => setIsTimeCustomized(false)}
                                            className={`text-sm font-medium transition-colors ${isTimeCustomized ? 'text-blue-600 hover:text-blue-700 underline' : 'text-slate-400'}`}
                                            disabled={!isTimeCustomized}
                                        >
                                            {isTimeCustomized ? 'Khôi phục thời gian chuẩn (Tự tính)' : 'Hệ thống tự tính dựa vào số part đã chọn'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-6 text-center">
                            <button
                                onClick={handleStart}
                                className={`px-10 py-4 rounded-2xl font-black text-white text-lg transition-all active:scale-95 shadow-xl ${mode === 'actual' ? 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/20' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20'}`}
                            >
                                {mode === 'actual' ? 'VÀO PHÒNG THI' : 'BẮT ĐẦU LUYỆN TẬP'}
                            </button>
                            {mode === 'actual' && (
                                <p className="mt-4 text-sm text-rose-500 font-medium">Bấm để hệ thống chuyển sang chế độ Toàn Màn Hình.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
