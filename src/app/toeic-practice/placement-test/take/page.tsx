'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PlacementTestTakePage() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
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
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Giả lập nộp bài
        setTimeout(() => {
            // Lưu kết quả giả lập vào localStorage hoặc chuyển hướng
            localStorage.setItem('toeicLevel', 'INTERMEDIATE');
            router.push('/toeic-practice/placement-test/result');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-black text-slate-800 text-lg">Bài Test Đánh Giá Năng Lực</span>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">ToeicMore</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-700">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(timeLeft)}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#581c87] hover:bg-[#6b21a8] text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang nộp...
                                </>
                            ) : (
                                "Nộp bài"
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center py-20">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">Giao diện làm bài Test đang được xây dựng</h2>
                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                        Ở đây sẽ hiển thị các câu hỏi của bài Test Năng Lực (khoảng 25 câu).<br/>
                        Bạn có thể giả lập hoàn thành bài Test bằng cách bấm nút "Nộp bài" ở góc trên bên phải nhé!
                    </p>
                </div>
            </main>
        </div>
    );
}
