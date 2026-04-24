'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Question {
    id: string;
    order: number;
    category: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    imageUrl?: string;
    passage?: string;
}

export default function PlacementTestTakePage() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch('/api/toeic/placement-test');
                const data = await res.json();
                if (data.success && data.parts) {
                    const allQs: Question[] = [];
                    data.parts.forEach((p: any) => {
                        allQs.push(...p.questions);
                    });
                    setQuestions(allQs);
                }
            } catch (err) {
                toast.error('Không thể tải bài test. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (loading) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (id: string, option: string) => {
        setAnswers(prev => ({ ...prev, [id]: option }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/toeic/placement-test/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, totalQuestions: questions.length })
            });
            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem('toeicLevel', data.level);
                localStorage.setItem('toeicPlacementScore', `${data.totalCorrect}/${data.totalQuestions}`);
                router.push('/toeic-practice/placement-test/result');
            } else {
                toast.error('Có lỗi xảy ra khi nộp bài');
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error('Lỗi kết nối khi nộp bài');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Đang chuẩn bị bài test...</div>;
    }

    const answeredCount = Object.keys(answers).length;
    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-lg hidden sm:block">Đánh Giá Năng Lực Nhanh (3 Phút)</span>
                        <span className="font-black text-slate-800 text-lg sm:hidden">Test Năng Lực</span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                            <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm sm:text-base">{formatTime(timeLeft)}</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#581c87] hover:bg-[#6b21a8] text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-xl text-sm sm:text-base font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Đang chấm...' : 'Nộp bài'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl w-full mx-auto p-4 py-8">
                {questions.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
                        Chưa có câu hỏi nào được thiết lập. Hãy báo quản trị viên!
                    </div>
                ) : (
                    <div className="space-y-8">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col gap-1 items-center justify-start mt-0.5">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                {idx + 1}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                                                {q.category?.toLowerCase().includes('beginner') ? 'Mức: Dễ' : 
                                                 q.category?.toLowerCase().includes('intermediate') ? 'Mức: Vừa' : 
                                                 q.category?.toLowerCase().includes('advanced') ? 'Mức: Khó' : q.category}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            {q.passage && (
                                                <div className="mb-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100 text-sm text-slate-700 leading-relaxed font-serif italic whitespace-pre-wrap">
                                                    {q.passage}
                                                </div>
                                            )}
                                            {q.imageUrl && (
                                                <div className="mb-4">
                                                    <img src={q.imageUrl} alt="Question visual" className="max-h-64 rounded-xl border border-slate-200 object-contain mx-auto" />
                                                </div>
                                            )}
                                            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                                                {q.question || "Chọn đáp án đúng nhất điền vào chỗ trống:"}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['A', 'B', 'C', 'D'].map((opt) => {
                                        const optionText = q[`option${opt}` as keyof Question];
                                        if (!optionText) return null; // In case Part 2 only has A, B, C
                                        const isSelected = answers[q.id] === opt;
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleAnswer(q.id, opt)}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                                                    isSelected 
                                                        ? 'border-amber-500 bg-amber-50 shadow-sm' 
                                                        : 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/50'
                                                }`}
                                            >
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                                    isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {opt}
                                                </span>
                                                <span className={`font-semibold text-sm ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                                                    {String(optionText)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
