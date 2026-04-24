'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ZoomableImage from '@/components/ZoomableImage';

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
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
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

const cleanAIFiller = (text: string) => {
    if (!text) return text;
    return text.replace(/Dưới đây là.*?yêu cầu[:.]?\s*/gi, '')
               .replace(/Dưới đây là nội dung trích xuất.*?[:.]\s*/gi, '')
               .replace(/Dưới đây là nội dung.*?[:.]\s*/gi, '')
               .trim();
};

const extractSpecificExplanation = (text: string, qNum: number) => {
    if (!text) return text;
    
    let cleanedText = cleanAIFiller(text);
    let explanationPart = cleanedText;

    const giathichMatch = cleanedText.match(/(\[Giải thích(?: chi tiết)?\])([\s\S]*)/i);
    if (giathichMatch && giathichMatch[2]) {
        explanationPart = giathichMatch[2];
    }

    const regex = new RegExp(`(?:Câu\\s*)?${qNum}[:.](.*?)(?=(?:<[^>]+>|\\s)*(?:Câu\\s*)?\\d{2,3}[:.]|$)`, 'is');
    const match = explanationPart.match(regex);

    if (match) {
        let extracted = match[1].trim();
        return `<strong>Câu ${qNum}:</strong> ` + extracted;
    }

    // If specific question not found, just return the whole explanation part (it might be a single question explanation)
    return explanationPart.trim() || cleanedText;
};

function ReviewTestContent() {
    const params = useParams();
    const router = useRouter();

    const testId = params.testId as string;
    const recordId = params.recordId as string;

    const [testData, setTestData] = useState<any>(null);
    const [recordData, setRecordData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const recRes = await fetch(`/api/toeic/actual-test/record/${recordId}`);
                if (!recRes.ok) throw new Error('Record fetch failed');
                const recJson = await recRes.json();
                if (!recJson.success) throw new Error('Record not found');
                setRecordData(recJson.record);
                setAnswers(recJson.record.answersData || {});

                const testRes = await fetch(`/api/toeic/actual-test/${testId}`);
                if (testRes.ok) {
                    const data = await testRes.json();
                    setTestData(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [testId, recordId]);

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
            } catch (e) {}
        };
        if (status === 'authenticated') fetchBookmarks();
    }, [status]);

    const toggleBookmark = async (questionId: string) => {
        if (status !== 'authenticated') return;
        const current = !!bookmarkedIds[questionId];
        const next = !current;
        setBookmarkedIds(prev => ({ ...prev, [questionId]: next }));
        try {
            await fetch('/api/toeic/grammar/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, isBookmarked: next })
            });
        } catch (e) {
            setBookmarkedIds(prev => ({ ...prev, [questionId]: current }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
                <div className="animate-pulse font-bold text-xl text-purple-600">Đang tải dữ liệu Review...</div>
            </div>
        );
    }

    if (!testData || testData.error || !recordData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="text-rose-500 font-medium text-lg">Lỗi tải dữ liệu. Bạn hãy tải lại trang nhé.</div>
                <button onClick={() => router.push('/toeic-progress?tab=actual-test-bank&filter=history')} className="px-6 py-2 bg-slate-200 rounded-xl font-bold">Thoát</button>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
        <div className="fixed inset-0 z-[9999] bg-slate-50 text-slate-800">
            <div className="flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <div className="flex flex-row items-center justify-between px-2 py-3 md:p-4 gap-1 md:gap-4 bg-white shadow-sm border-b border-purple-100">
                    <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                        <h1 className="font-black text-sm md:text-xl max-w-[200px] md:max-w-none truncate text-purple-900" title={testData.title}>REVIEW: {testData.title}</h1>
                        <span className="px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-bold whitespace-nowrap bg-purple-100 text-purple-700">
                            XEM CHỮA LỖI
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-4 flex-1 justify-end">
                        <button onClick={() => setIsSheetOpen(!isSheetOpen)} className="lg:hidden px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold flex items-center gap-1 md:gap-2 whitespace-nowrap flex-shrink-0 bg-purple-100 text-purple-700">
                            <svg className="w-3 h-3 md:w-5 md:h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            {isSheetOpen ? 'Đóng Phiếu' : 'Bảng Check'}
                        </button>
                        <div className="hidden md:flex font-mono text-[11px] md:text-sm font-bold px-1.5 py-1 md:px-4 md:py-2 rounded-lg bg-orange-100 text-orange-800 whitespace-nowrap flex-shrink-0">
                            Đã dùng: {formatTime(recordData.duration)} | Điểm: {recordData.correctAnswers}/{recordData.totalQuestions}
                        </div>
                        <button onClick={() => router.push(`/toeic-progress?tab=actual-test-bank&filter=history`)} className="px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold whitespace-nowrap flex-shrink-0 bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">
                            Đóng Review
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Stage */}
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar relative">
                        {isSheetOpen && (
                            <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsSheetOpen(false)}/>
                        )}
                        {testData.parts.map((partInfo: any, pIdx: number) => {
                            const getPartStartNumber = (part: number) => {
                                switch (part) { case 1: return 1; case 2: return 7; case 3: return 32; case 4: return 71; case 5: return 101; case 6: return 131; case 7: return 147; default: return 1; }
                            };
                            const startNumber = getPartStartNumber(partInfo.part);

                            return (
                                <div key={pIdx} id={`part-${partInfo.part}`} className="mb-12">
                                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <h2 className="text-xl font-black text-purple-900 mb-2 md:mb-0">Part {partInfo.part}</h2>
                                        {partInfo.directionAudioUrl && (
                                            <div className="mt-4 md:mt-0">
                                                <PartDirectionAudio src={partInfo.directionAudioUrl} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-10">
                                        {partInfo.questions.map((q: any, qIdx: number) => {
                                            const qNum = startNumber + qIdx;
                                            const uAnswer = answers[qNum];
                                            const cAnswer = q.correctOption;
                                            const isQCorrect = !!uAnswer && uAnswer === cAnswer;
                                            const isQWrong = !!uAnswer && uAnswer !== cAnswer;

                                            return (
                                            <div key={q.id} id={`q-${qNum}`} className={`p-6 rounded-2xl border-2 relative group transition-all ${isQWrong ? 'bg-rose-50/30 border-rose-200' : isQCorrect ? 'bg-purple-50/20 border-purple-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                                                <div className="absolute top-4 left-4">
                                                    {isQCorrect && <div className="text-[10px] font-black text-purple-600 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full scale-105 shadow-sm">LÀM ĐÚNG</div>}
                                                    {isQWrong && <div className="text-[10px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full scale-105 shadow-sm">LÀM SAI</div>}
                                                    {!uAnswer && <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">BỎ TRỐNG</div>}
                                                </div>

                                                <button
                                                    onClick={() => toggleBookmark(q.id)}
                                                    className={`absolute top-4 right-4 py-1.5 px-2.5 rounded-xl transition-all z-10 border flex items-center justify-center gap-1.5 ${bookmarkedIds[q.id] ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-sm' : 'bg-white border-amber-200 text-amber-500 hover:bg-amber-50'}`}
                                                    title={bookmarkedIds[q.id] ? "Đã lưu" : "Bookmark"}
                                                >
                                                    <svg className={`w-5 h-5 ${bookmarkedIds[q.id] ? 'fill-amber-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                    <span className="hidden md:inline text-sm font-bold tracking-tight">{bookmarkedIds[q.id] ? "Đã lưu" : "Bookmark"}</span>
                                                </button>
                                                
                                                <div className="flex flex-col lg:flex-row gap-6 mt-6">
                                                    {/* Left Media */}
                                                    {(q.imageUrl || q.passage) && (
                                                        <div className="lg:w-1/2 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                                                            {q.imageUrl && <ZoomableImage src={q.imageUrl} alt="Tài liệu" />}
                                                            {q.passage && <div className="prose prose-sm prose-slate max-w-none bg-white p-4 rounded-xl border border-slate-200 shadow-sm" dangerouslySetInnerHTML={{ __html: q.passage }} />}
                                                            {q.audioUrl && (
                                                                <div className="mt-auto pt-4">
                                                                    <PracticeAudioPlayer src={q.audioUrl} isPractice={true} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Right Q&A */}
                                                    <div className="flex-1 flex flex-col">
                                                        <div className="flex gap-4 mb-5">
                                                            <span className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-white shadow-sm ${isQCorrect ? 'bg-purple-500' : isQWrong ? 'bg-rose-500' : 'bg-slate-300'}`}>
                                                                {qNum}
                                                            </span>
                                                            <div className="flex-1">
                                                                {!(q.imageUrl || q.passage) && q.audioUrl && (
                                                                    <div className="mb-4">
                                                                        <PracticeAudioPlayer src={q.audioUrl} isPractice={true} />
                                                                    </div>
                                                                )}
                                                                {q.question && partInfo.part !== 1 && partInfo.part !== 2 && (
                                                                    <div className="text-lg font-bold text-slate-800 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question }} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Options */}
                                                        <div className="flex flex-col gap-3 mt-4">
                                                            {['A', 'B', 'C', 'D'].map((opt) => {
                                                                if (!q[`option${opt}`]) return null;
                                                                const isChosen = uAnswer === opt;
                                                                const isCorrectOpt = cAnswer === opt;
                                                                
                                                                let optColorClass = 'border-slate-200 bg-white opacity-80'; // default unselected
                                                                if (isCorrectOpt) {
                                                                    optColorClass = 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20 shadow-sm opacity-100';
                                                                } else if (isChosen && !isCorrectOpt) {
                                                                    optColorClass = 'border-rose-400 bg-rose-50 ring-1 ring-rose-400/20 opacity-100';
                                                                }

                                                                let badgeClass = 'border-slate-300 text-slate-400';
                                                                if (isCorrectOpt) badgeClass = 'border-purple-500 bg-purple-500 text-white shadow-sm';
                                                                else if (isChosen) badgeClass = 'border-rose-500 bg-rose-500 text-white';

                                                                return (
                                                                    <div key={opt} className={`flex justify-between items-center p-3.5 rounded-xl border transition-all ${optColorClass}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${badgeClass}`}>
                                                                                {opt}
                                                                            </div>
                                                                            {partInfo.part !== 1 && partInfo.part !== 2 ? (
                                                                                <span className={`font-medium ${isCorrectOpt ? 'text-purple-800 font-bold' : (isChosen ? 'text-rose-700 line-through' : 'text-slate-600')}`} dangerouslySetInnerHTML={{ __html: q[`option${opt}`] }} />
                                                                            ) : (
                                                                                <span className={`font-medium ${isCorrectOpt ? 'text-purple-800 font-bold' : (isChosen ? 'text-rose-700 line-through' : 'text-slate-600')}`}>Option {opt}</span>
                                                                            )}
                                                                        </div>
                                                                        {isChosen && !isCorrectOpt && <span className="text-[10px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded uppercase">Your Answer</span>}
                                                                        {isCorrectOpt && <span className="text-[10px] font-black text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded uppercase">Valid Answer</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* EXPLANATION REVEAL */}
                                                        {(q.explanation || q.translation) && (
                                                            <div className="mt-8 bg-purple-50/70 border-l-4 border-l-purple-400 border border-purple-100 rounded-lg p-5 shadow-sm">
                                                                <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                                                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                                                                    Giải Thích Chi Tiết
                                                                </h4>
                                                                {q.translation && cleanAIFiller(q.translation) && (
                                                                    <div className="mb-4">
                                                                        <strong className="text-slate-800 text-sm block mb-1">Dịch nghĩa:</strong>
                                                                        <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanAIFiller(q.translation) }} />
                                                                    </div>
                                                                )}
                                                                {q.explanation && cleanAIFiller(q.explanation) && (
                                                                    <div>
                                                                        <strong className="text-slate-800 text-sm block mb-1">Phân tích:</strong>
                                                                        <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: extractSpecificExplanation(cleanAIFiller(q.explanation), qNum) }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Review Answer Sheet Sidebar */}
                    <div className={`absolute lg:relative right-0 top-0 bottom-0 z-50 transform transition-transform duration-300 w-[340px] max-w-[90vw] bg-white border-l border-slate-200 p-4 flex flex-col shadow-2xl lg:shadow-none ${isSheetOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                        <button onClick={() => setIsSheetOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="font-bold text-lg mb-2 text-center text-purple-900 border-b pb-3">Bảng Check Đáp Án</h3>
                        <div className="flex gap-4 justify-center py-2 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-lg mb-4">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Đúng</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Sai</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Bỏ trống</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <div className="grid grid-cols-2 gap-2">
                                {Array.from({length: 200}).map((_, i) => {
                                    const qNum = i + 1;
                                    const answeredOpt = answers[qNum];
                                    
                                    // Try to find correct answer in testData
                                    let cAnswer = undefined;
                                    const partOfQ = getPartFromNumber(qNum);
                                    for(const p of testData.parts) {
                                        if (p.part === partOfQ) {
                                            const getStartNumber = (part: number) => {
                                                switch (part) { case 1: return 1; case 2: return 7; case 3: return 32; case 4: return 71; case 5: return 101; case 6: return 131; case 7: return 147; default: return 1; }
                                            };
                                            const startN = getStartNumber(p.part);
                                            const idx = qNum - startN;
                                            if (idx >= 0 && idx < p.questions.length) {
                                                cAnswer = p.questions[idx].correctOption;
                                            }
                                            break;
                                        }
                                    }

                                    const isEnabled = cAnswer !== undefined; // Exists in test
                                    const isBlank = isEnabled && !answeredOpt;
                                    const isCorrect = isEnabled && answeredOpt === cAnswer;
                                    const isWrong = isEnabled && answeredOpt && answeredOpt !== cAnswer;
                                    const isIncorrectOrBlank = isWrong || isBlank;

                                    return (
                                        <a href={`#q-${qNum}`} onClick={() => {if(window.innerWidth < 1024) setIsSheetOpen(false)}} key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-sm transition-all ${isEnabled ? 'bg-slate-50 hover:border-purple-300' : 'opacity-20 pointer-events-none grayscale'}`}>
                                            <span className={`font-bold w-6 text-right mr-1 sm:mr-1.5 ${isCorrect ? 'text-purple-500' : isIncorrectOrBlank ? 'text-rose-500' : 'text-slate-400'}`}>{qNum}.</span>
                                            <div className="flex gap-1 shrink-0">
                                                {['A', 'B', 'C', 'D'].map(opt => {
                                                    const isSelected = answeredOpt === opt;
                                                    const isCorrectOpt = cAnswer === opt;

                                                    let badgeStyle = 'border-slate-300 text-slate-400 bg-white';
                                                    if (isCorrectOpt) badgeStyle = 'border-purple-500 bg-purple-500 text-white font-bold scale-110';
                                                    else if (isSelected && !isCorrectOpt) badgeStyle = 'border-rose-500 bg-rose-500 text-white scale-110';

                                                    return (
                                                        <div key={opt} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all ${badgeStyle}`}>
                                                            {opt}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReviewTestPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <ReviewTestContent />
        </Suspense>
    );
}
