'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const PartDirectionAudio = ({ src }: { src: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSkip = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = audioRef.current.duration || 0;
            setIsPlaying(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} className="hidden" />
            
            <button 
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
                {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                )}
                <span>{isPlaying ? 'Tạm Dừng' : 'Nghe Hướng Dẫn'}</span>
            </button>

            {isPlaying && (
                <button 
                    type="button"
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    <span>SKIP</span>
                </button>
            )}
        </div>
    );
};

const PracticeAudioPlayer = ({ src, isPractice }: { src: string, isPractice: boolean }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleSeek = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds;
        }
    };

    return (
        <div className="flex flex-row items-center gap-3 w-full max-w-xl">
            {isPractice && (
                <button type="button" onClick={() => handleSeek(-3)} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors flex-shrink-0" title="Tua lùi 3 giây">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" /></svg>
                </button>
            )}
            <audio ref={audioRef} src={src} controls className="w-full h-11 flex-1" />
            {isPractice && (
                <button type="button" onClick={() => handleSeek(3)} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors flex-shrink-0" title="Tua tới 3 giây">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            )}
        </div>
    );
};

function TakeTestContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const testId = params.testId as string;
    const mode = searchParams.get('mode') || 'practice';
    const partsParam = searchParams.get('parts') || '';

    const timeParam = searchParams.get('time') || '120';
    const initialTimeSeconds = Math.max(1, parseInt(timeParam) * 60);

    const [testData, setTestData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(initialTimeSeconds);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [playQueue, setPlayQueue] = useState<any[]>([]);
    const [currentAudioIdx, setCurrentAudioIdx] = useState(0);
    const globalAudioRef = useRef<HTMLAudioElement>(null);

    const isActual = mode === 'actual';

    useEffect(() => {
        if (!testData || !testData.parts) return;
        const queue: any[] = [];
        testData.parts.filter((p: any) => selectedPartsList.includes(p.part) && [1, 2, 3, 4].includes(p.part)).forEach((partInfo: any) => {
            if (partInfo.directionAudioUrl) {
                queue.push({ type: 'direction', title: `Hướng dẫn Part ${partInfo.part}`, src: partInfo.directionAudioUrl });
            }
            partInfo.questions.forEach((q: any, qIdx: number) => {
                if (q.audioUrl) {
                    const getPartStartNumber = (part: number) => {
                         switch (part) { case 1: return 1; case 2: return 7; case 3: return 32; case 4: return 71; default: return 1; }
                    };
                    queue.push({ type: 'question', title: `Câu ${getPartStartNumber(partInfo.part) + qIdx}`, src: q.audioUrl });
                }
            });
        });
        setPlayQueue(queue);
    }, [testData]);

    const handleGlobalAudioEnded = () => {
        if (currentAudioIdx < playQueue.length - 1) {
            setTimeout(() => {
                setCurrentAudioIdx(prev => prev + 1);
            }, 1000); // 1s pause between questions
        }
    };

    useEffect(() => {
        if (isActual && isFullscreen && playQueue.length > 0 && globalAudioRef.current) {
            globalAudioRef.current.play().catch(e => console.error("Auto-play error:", e));
        }
    }, [currentAudioIdx, isFullscreen, playQueue, isActual]);

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

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const res = await fetch('/api/toeic/grammar/bookmark');
                if (res.ok) {
                    const data = await res.json();
                    const bMap: Record<string, boolean> = {};
                    data.forEach((id: string) => { bMap[id] = true; });
                    setBookmarkedIds(bMap);
                }
            } catch (e) {
                console.error('Failed to fetch bookmarks', e);
            }
        };
        fetchBookmarks();
    }, []);

    const toggleBookmark = async (questionId: string) => {
        const current = !!bookmarkedIds[questionId];
        const next = !current;
        setBookmarkedIds(prev => ({ ...prev, [questionId]: next }));
        
        try {
            const res = await fetch('/api/toeic/grammar/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, isBookmarked: next })
            });
            if (!res.ok) {
                throw new Error('Failed');
            }
        } catch (e) {
            setBookmarkedIds(prev => ({ ...prev, [questionId]: current }));
            alert('Cần nâng cấp gói để lưu câu hỏi này. Tính năng Sổ tay tuỳ thuộc vào gói truy cập (PRO/ULTRA).');
        }
    };

    useEffect(() => {
        if (!isFullscreen && isActual) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert("Đã hết thời gian làm bài!");
                    return 0; // TODO: Trigger auto-submit
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFullscreen, isActual]);

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

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!confirm('Bạn có chắc chắn muốn nộp bài?')) return;
        setIsSubmitting(true);
        try {
            const body = {
                answers,
                isActual,
                initialTimeSeconds,
                timeLeft,
            };
            const res = await fetch(`/api/toeic/actual-test/${testId}/submit`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                exitFullscreen();
                alert('Nộp bài thành công! Kết quả đã được lưu vào Lịch sử thi trong Sổ Tay Luyện Đề.');
                router.push(`/toeic-progress?tab=actual-test-bank&filter=history`);
            } else {
                alert('Có lỗi xảy ra: ' + data.error);
                setIsSubmitting(false);
            }
        } catch (e) {
            console.error(e);
            alert('Lỗi mạng khi nộp bài');
            setIsSubmitting(false);
        }
    };

    const getPartFromNumber = (n: number) => {
        if (n >= 1 && n <= 6) return 1;
        if (n >= 7 && n <= 31) return 2;
        if (n >= 32 && n <= 70) return 3;
        if (n >= 71 && n <= 100) return 4;
        if (n >= 101 && n <= 130) return 5;
        if (n >= 131 && n <= 146) return 6;
        if (n >= 147 && n <= 200) return 7;
        return 1;
    };

    return (
        <div className={`fixed inset-0 z-[9999] ${isActual ? 'bg-black text-white' : 'bg-slate-50 text-slate-800'}`}>
            {!isFullscreen && isActual ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6 px-4">
                    <svg className="w-20 h-20 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white mb-2">Chế độ thi thử yêu cầu toàn màn hình</h2>
                        <p className="text-slate-400">Bạn không được phép thoát màn hình trong suốt {timeParam} phút. (Tự động tính dựa trên số part)</p>
                    </div>
                    <button onClick={enterFullscreen} className="px-10 py-4 bg-[#4c1d95] hover:bg-purple-900 border border-purple-800 text-amber-400 font-bold rounded-2xl text-xl animate-bounce shadow-[0_0_20px_rgba(76,29,149,0.5)]">
                        Bắt Đầu Tính Giờ
                    </button>
                    <button onClick={() => router.push(`/toeic-practice/actual-test/${testId}`)} className="text-slate-500 hover:text-white underline">
                        Thoát
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-screen overflow-hidden">
                    {/* Header Room */}
                    <div className={`flex flex-row items-center justify-between px-2 py-3 md:p-4 gap-1 md:gap-4 ${isActual ? 'bg-slate-900 border-b border-slate-800' : 'bg-white shadow-sm'}`}>
                        <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                            <h1 className="font-black text-sm md:text-xl max-w-[60px] md:max-w-none truncate" title={testData.title}>{testData.title}</h1>
                            <span className={`px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-bold whitespace-nowrap ${isActual ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-100 text-blue-700'}`}>
                                {isActual ? 'THI THỬ' : 'LUYỆN TẬP'}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 md:gap-4 flex-1 justify-end">
                            {/* Answer Sheet Toggle for Mobile */}
                            <button 
                                onClick={() => setIsSheetOpen(!isSheetOpen)} 
                                className={`lg:hidden px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold flex items-center gap-1 md:gap-2 whitespace-nowrap flex-shrink-0 ${isActual ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-700'}`}
                            >
                                <svg className="w-3 h-3 md:w-5 md:h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                {isSheetOpen ? 'Đóng Phiếu' : 'Phiếu trả lời'}
                            </button>

                            {/* Running Timer */}
                            <div className={`font-mono text-[11px] md:text-xl font-bold px-1.5 py-1 md:px-4 md:py-2 rounded-lg transition-colors duration-500 whitespace-nowrap flex-shrink-0 ${timeLeft <= 60 ? 'bg-red-600 animate-pulse text-white' : (isActual ? 'bg-slate-800 text-rose-500' : 'bg-slate-800 text-slate-200')}`}>
                                {formatTime(timeLeft)}
                            </div>

                            <button onClick={() => {
                                exitFullscreen();
                                router.push(`/toeic-practice/actual-test/${testId}`);
                            }} className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold whitespace-nowrap flex-shrink-0 ${isActual ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                Thoát
                            </button>
                        </div>
                    </div>

                    {/* Global Audio Indicator for Actual Test */}
                    {isActual && playQueue.length > 0 && (
                        <>
                            <audio ref={globalAudioRef} onEnded={handleGlobalAudioEnded} src={playQueue[currentAudioIdx]?.src} className="hidden" />
                            {/* Mobile Indicator - Second line */}
                            <div className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-indigo-900/50 border-b border-indigo-500/30">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-indigo-200 truncate">
                                    Đang phát: <span className="font-bold text-white max-w-[200px] truncate">{playQueue[currentAudioIdx]?.title}</span>
                                </span>
                            </div>
                            {/* Desktop Indicator - Absolute center */}
                            <div className="hidden md:flex absolute top-4 right-1/2 translate-x-1/2 items-center gap-2 px-4 py-1.5 bg-indigo-900/50 rounded-lg border border-indigo-500/30 z-10 pointer-events-none">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-indigo-200">
                                    Đang phát âm thanh: <span className="font-bold text-white">{playQueue[currentAudioIdx]?.title}</span>
                                </span>
                            </div>
                        </>
                    )}

                    {/* Content Room */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Main Stage */}
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar relative">
                            {/* Mobile Backdrop Overlay */}
                            {isSheetOpen && (
                                <div 
                                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
                                    onClick={() => setIsSheetOpen(false)}
                                />
                            )}
                            {testData.parts.filter((p: any) => selectedPartsList.includes(p.part)).map((partInfo: any, pIdx: number) => {
                                const getPartStartNumber = (part: number) => {
                                    switch (part) {
                                        case 1: return 1;
                                        case 2: return 7;
                                        case 3: return 32;
                                        case 4: return 71;
                                        case 5: return 101;
                                        case 6: return 131;
                                        case 7: return 147;
                                        default: return 1;
                                    }
                                };
                                const startNumber = getPartStartNumber(partInfo.part);

                                return (
                                <div key={pIdx} className="mb-12">
                                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <h2 className="text-xl font-black text-indigo-900 mb-2 md:mb-0">Part {partInfo.part}</h2>
                                        {!isActual && partInfo.directionAudioUrl && (
                                            <div className="mt-4 md:mt-0">
                                                <PartDirectionAudio src={partInfo.directionAudioUrl} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-10">
                                        {partInfo.questions.map((q: any, qIdx: number) => (
                                            <div key={q.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative group">
                                                {/* Bookmark Button for Reading Parts in Practice Mode */}
                                                {!isActual && partInfo.part >= 5 && partInfo.part <= 7 && (
                                                    <button
                                                        onClick={() => toggleBookmark(q.id)}
                                                        className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-10 border ${bookmarkedIds[q.id] ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' : 'bg-white border-transparent text-slate-300 hover:text-amber-400 hover:bg-slate-50'}`}
                                                        title={bookmarkedIds[q.id] ? "Đã lưu vào Sổ tay" : "Lưu vào Sổ tay"}
                                                    >
                                                        <svg className={`w-6 h-6 ${bookmarkedIds[q.id] ? 'fill-amber-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                    </button>
                                                )}
                                                
                                                <div className="flex flex-col lg:flex-row gap-6">
                                                    
                                                    {/* Left Column: Media (Image, Passage) */}
                                                    {(q.imageUrl || q.passage) && (
                                                        <div className="lg:w-1/2 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                                                            {q.imageUrl && (
                                                                <img src={q.imageUrl} alt="Question Context" className="w-[80%] max-w-[400px] rounded-xl shadow-sm cursor-pointer hover:opacity-95 transition-opacity" />
                                                            )}
                                                            {q.passage && (
                                                                <div className="prose prose-sm prose-slate max-w-none bg-slate-50 p-4 rounded-xl border border-slate-100" dangerouslySetInnerHTML={{ __html: q.passage }} />
                                                            )}
                                                            {!isActual && q.audioUrl && (
                                                                <div className="mt-auto pt-4">
                                                                    <PracticeAudioPlayer src={q.audioUrl} isPractice={true} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Right Column: Question & Options */}
                                                    <div className="flex-1 flex flex-col">
                                                        <div className="flex gap-4 mb-5">
                                                            <span className="w-8 h-8 rounded-full bg-slate-100 flex flex-shrink-0 items-center justify-center font-bold text-slate-500 shadow-sm">
                                                                {startNumber + qIdx}
                                                            </span>
                                                            <div className="flex-1">
                                                                {/* Audio fallback if no media column exists */}
                                                                {!isActual && !(q.imageUrl || q.passage) && q.audioUrl && (
                                                                     <div className="mb-4">
                                                                         <PracticeAudioPlayer src={q.audioUrl} isPractice={true} />
                                                                     </div>
                                                                )}
                                                                {q.question && partInfo.part !== 1 && partInfo.part !== 2 && (
                                                                    <div className="text-lg font-bold text-slate-800 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question }} />
                                                                )}
                                                                {(partInfo.part === 1 || partInfo.part === 2) && (
                                                                    <div className="text-lg font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
                                                                        Nghe đoạn audio và chọn đáp án chính xác nhất:
                                                                    </div>
                                                                )}
                                                                {!q.question && partInfo.part !== 1 && partInfo.part !== 2 && (q.imageUrl || q.passage) && (
                                                                    <div className="text-lg font-bold text-slate-800 whitespace-pre-wrap">Dựa vào ngữ liệu, hãy chọn đáp án đúng nhất:</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 mt-4">
                                                            {['A', 'B', 'C', 'D'].map((opt) => {
                                                                if (!q[`option${opt}`]) return null;
                                                                const isSelected = answers[startNumber + qIdx] === opt;
                                                                return (
                                                                    <div key={opt} onClick={() => setAnswers(prev => ({ ...prev, [startNumber + qIdx]: opt }))} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
                                                                        <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-500 group-hover:border-blue-500 group-hover:text-blue-600'}`}>
                                                                            {opt}
                                                                        </div>
                                                                        {partInfo.part !== 1 && partInfo.part !== 2 && (
                                                                            <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-slate-700'}`} dangerouslySetInnerHTML={{ __html: q[`option${opt}`] }} />
                                                                        )}
                                                                        {(partInfo.part === 1 || partInfo.part === 2) && (
                                                                            <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>Option {opt}</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                            {testData.parts.filter((p: any) => selectedPartsList.includes(p.part)).length === 0 && (
                                <div className="text-center py-20 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-3xl">
                                    Không có dữ liệu cho các Part được chọn.
                                </div>
                            )}
                        </div>

                        {/* Answer Sheet Sidebar */}
                        <div className={`
                            absolute lg:relative right-0 top-0 bottom-0 z-50 transform transition-transform duration-300 w-80 max-w-[85vw] border-l p-4 flex flex-col shadow-2xl lg:shadow-none
                            ${isSheetOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                            ${isActual ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                        `}>
                            {/* Close overlay on mobile */}
                            <button onClick={() => setIsSheetOpen(false)} className={`lg:hidden absolute top-4 right-4 p-2 rounded-full ${isActual ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h3 className="font-bold text-lg mb-4 text-center pr-8 lg:pr-0">Phiếu Trả Lời</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Real Sheet based on state */}
                                    {Array.from({length: 200}).map((_, i) => {
                                        const qNum = i + 1;
                                        const partOfQ = getPartFromNumber(qNum);
                                        const isEnabled = isActual || selectedPartsList.includes(partOfQ);
                                        const answeredOpt = answers[qNum];

                                        return (
                                            <div key={i} className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-all ${isEnabled ? (isActual ? 'border-slate-700/50 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50') : (isActual ? 'opacity-20 border-slate-800 pointer-events-none grayscale' : 'opacity-30 border-slate-100 pointer-events-none grayscale')}`}>
                                                <span className={`font-bold w-6 text-right mr-2 ${isActual ? 'text-slate-400' : 'text-slate-500'}`}>{qNum}.</span>
                                                <div className="flex gap-1.5">
                                                    {['A', 'B', 'C', 'D'].map(opt => {
                                                        const isSelected = answeredOpt === opt;
                                                        return (
                                                            <div 
                                                                key={opt} 
                                                                onClick={() => isEnabled && setAnswers(prev => ({ ...prev, [qNum]: opt }))}
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border cursor-pointer transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white font-bold scale-110 shadow-sm' : (isActual ? 'border-slate-600 text-slate-500 hover:border-blue-400 hover:text-blue-400' : 'border-slate-300 text-slate-400 hover:border-blue-300 hover:bg-blue-50')}`}
                                                            >
                                                                {opt}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-4 mt-auto">
                                <button disabled={isSubmitting} onClick={handleSubmit} className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg">
                                    {isSubmitting ? 'ĐANG NỘP...' : 'NỘP BÀI'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TakeTestPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4"><div className="w-8 h-8 md:w-12 md:h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div><div className="text-slate-500 font-medium">Đang thiết lập phòng thi...</div></div>}>
            <TakeTestContent />
        </Suspense>
    );
}
