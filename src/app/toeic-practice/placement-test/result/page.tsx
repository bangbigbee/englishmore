'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PlacementTestResultPage() {
    const [level, setLevel] = useState<string>('BEGINNER');

    useEffect(() => {
        const storedLevel = localStorage.getItem('toeicLevel');
        if (storedLevel) {
            setLevel(storedLevel);
        } else {
            // Default mock level if none found
            localStorage.setItem('toeicLevel', 'INTERMEDIATE');
            setLevel('INTERMEDIATE');
        }
    }, []);

    const levelDetails: Record<string, { title: string, desc: string, color: string, bg: string }> = {
        'BEGINNER': {
            title: 'Lộ trình Xóa Mù (Mất gốc)',
            desc: 'Bạn cần xây dựng lại nền tảng từ vựng và ngữ pháp cơ bản nhất.',
            color: 'text-primary-700',
            bg: 'bg-primary-100',
        },
        'INTERMEDIATE': {
            title: 'Lộ trình Bứt Phá (Cơ bản)',
            desc: 'Bạn đã có nền tảng tốt. Cần tập trung vào chiến thuật làm bài và tăng cường nghe hiểu.',
            color: 'text-blue-700',
            bg: 'bg-blue-100',
        },
        'ADVANCED': {
            title: 'Lộ trình Master (800+)',
            desc: 'Năng lực xuất sắc! Bạn đã sẵn sàng để luyện giải đề cường độ cao và tối ưu thời gian.',
            color: 'text-secondary-700',
            bg: 'bg-secondary-100',
        }
    };

    const currentLevel = levelDetails[level] || levelDetails['BEGINNER'];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

                <div className="p-8 sm:p-12 relative z-10 flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                        className="w-24 h-24 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
                    >
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>

                    <h1 className="text-3xl font-black text-slate-800 mb-2">
                        Hoàn thành bài Test!
                    </h1>
                    <p className="text-slate-500 font-medium mb-8">
                        Tuyệt vời! Hệ thống đã phân tích kết quả bài làm của bạn.
                    </p>

                    <div className={`w-full p-6 rounded-2xl border mb-8 ${currentLevel.bg} border-white shadow-sm`}>
                        <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">Đề xuất lộ trình</div>
                        <h2 className={`text-2xl font-black mb-2 ${currentLevel.color}`}>
                            {currentLevel.title}
                        </h2>
                        <p className={`font-medium opacity-80 ${currentLevel.color}`}>
                            {currentLevel.desc}
                        </p>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                        <Link 
                            href="/toeic-practice/roadmap"
                            className="w-full flex items-center justify-center gap-2 bg-primary-900 hover:bg-primary-800 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                        >
                            <span>Khám phá Lộ trình của bạn</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
