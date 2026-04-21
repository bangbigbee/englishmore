'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TakeTestPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const testId = params.testId as string;
    const mode = searchParams.get('mode') || 'practice';
    const partsParam = searchParams.get('parts') || '';

    const [testData, setTestData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/toeic/actual-test/${testId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTestData(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId]);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        setIsFullscreen(true);
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        setIsFullscreen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-pulse font-bold text-xl">Đang nạp dữ liệu kỳ thi...</div>
            </div>
        );
    }

    if (!testData || testData.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="text-rose-500 font-medium text-lg">Lỗi tải đề thi.</div>
                <button onClick={() => router.push('/toeic-practice')} className="px-6 py-2 bg-slate-200 rounded-xl font-bold">Quay lại</button>
            </div>
        );
    }

    const selectedPartsList = partsParam.split(',').filter(Boolean).map(Number);
    const isActual = mode === 'actual';

    return (
        <div className={`fixed inset-0 z-[9999] ${isActual ? 'bg-black text-white' : 'bg-slate-50 text-slate-800'}`}>
            {!isFullscreen && isActual ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6 px-4">
                    <svg className="w-20 h-20 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white mb-2">Chế độ thi thật yêu cầu toàn màn hình</h2>
                        <p className="text-slate-400">Bạn không được phép thoát màn hình trong suốt 120 phút.</p>
                    </div>
                    <button onClick={enterFullscreen} className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xl animate-bounce">
                        Bắt Đầu Tính Giờ
                    </button>
                    <button onClick={() => router.push(`/toeic-practice/actual-test/${testId}`)} className="text-slate-500 hover:text-white underline">
                        Thoát
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-screen overflow-hidden">
                    {/* Header Room */}
                    <div className={`flex items-center justify-between p-4 ${isActual ? 'bg-slate-900 border-b border-slate-800' : 'bg-white shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <h1 className="font-black text-xl">{testData.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActual ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-100 text-blue-700'}`}>
                                {isActual ? 'THI THẬT' : 'LUYỆN TẬP'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Timer Placeholder */}
                            <div className={`font-mono text-xl font-bold bg-slate-800 px-4 py-2 rounded-lg ${isActual ? 'text-rose-500' : 'text-slate-200'}`}>
                                120:00
                            </div>
                            <button onClick={() => {
                                exitFullscreen();
                                router.push(`/toeic-practice/actual-test/${testId}`);
                            }} className={`px-4 py-2 rounded-xl text-sm font-bold ${isActual ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                Thoát
                            </button>
                        </div>
                    </div>

                    {/* Content Room */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Main Stage */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            {testData.parts.filter((p: any) => selectedPartsList.includes(p.part)).map((partInfo: any, pIdx: number) => (
                                <div key={pIdx} className="mb-12">
                                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
                                        <h2 className="text-xl font-black text-indigo-900">Part {partInfo.part}</h2>
                                    </div>
                                    <div className="space-y-10">
                                        {partInfo.questions.map((q: any, qIdx: number) => (
                                            <div key={q.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex gap-4">
                                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                                        {qIdx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        {q.imageUrl && (
                                                            <div className="mb-4">
                                                                <img src={q.imageUrl} alt="Question Context" className="max-w-full lg:max-w-[70%] rounded-xl cursor-pointer shadow-sm hover:opacity-90 transition-opacity" />
                                                            </div>
                                                        )}
                                                        {/* In actual listening test, audio is usually a single global track. But for now we show individual tracks if present */}
                                                        {q.audioUrl && (
                                                            <div className="mb-4">
                                                                <audio src={q.audioUrl} controls className="w-full max-w-sm h-10" />
                                                            </div>
                                                        )}
                                                        {q.question && (
                                                            <div className="text-lg font-bold text-slate-800 mb-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.question }} />
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                                q[`option${opt}`] ? (
                                                                    <div key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors group">
                                                                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-blue-600">
                                                                            {opt}
                                                                        </div>
                                                                        <span className="text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: q[`option${opt}`] }} />
                                                                    </div>
                                                                ) : null
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {testData.parts.filter((p: any) => selectedPartsList.includes(p.part)).length === 0 && (
                                <div className="text-center py-20 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-3xl">
                                    Không có dữ liệu cho các Part được chọn.
                                </div>
                            )}
                        </div>

                        {/* Answer Sheet Sidebar */}
                        <div className={`w-80 border-l p-4 flex flex-col ${isActual ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <h3 className="font-bold text-lg mb-4 text-center">Phiếu Trả Lời</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Dummy Sheet */}
                                    {Array.from({length: 200}).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-700/30 text-sm">
                                            <span className="font-bold w-6">{i + 1}.</span>
                                            <div className="flex gap-1">
                                                {['A', 'B', 'C', 'D'].map(opt => (
                                                    <div key={opt} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${isActual ? 'border-slate-600 text-slate-500' : 'border-slate-300 text-slate-400'}`}>{opt}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 mt-auto">
                                <button className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg">
                                    NỘP BÀI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
