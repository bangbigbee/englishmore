import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Bài Test Năng Lực - ToeicMore',
};

export default function PlacementTestIntroPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-50 to-transparent rounded-tr-full opacity-50 pointer-events-none" />

                <div className="p-8 sm:p-12 relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-slate-800 mb-4">
                        Bài Test Đánh Giá Năng Lực
                    </h1>
                    <p className="text-slate-500 font-medium text-[15px] max-w-lg mb-8 leading-relaxed">
                        Bài test ngắn này giúp ToeicMore xác định chính xác trình độ hiện tại của bạn, từ đó thiết kế một Lộ trình học tập cá nhân hóa và phù hợp nhất.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                            <span className="text-2xl mb-1">⏱️</span>
                            <span className="font-bold text-slate-800">5 Phút</span>
                            <span className="text-[12px] text-slate-400 font-medium">Thời gian làm bài</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                            <span className="text-2xl mb-1">🎯</span>
                            <span className="font-bold text-slate-800">15 Câu</span>
                            <span className="text-[12px] text-slate-400 font-medium">Đánh giá toàn diện</span>
                        </div>
                    </div>

                    <div className="w-full max-w-md flex flex-col gap-3">
                        <Link 
                            href="/toeic-practice/placement-test/take"
                            className="w-full flex items-center justify-center gap-2 bg-[#581c87] hover:bg-[#6b21a8] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                        >
                            <span>Bắt đầu làm bài ngay</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        
                        <Link 
                            href="/toeic-practice?tab=roadmap"
                            className="w-full text-center text-[14px] font-bold text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors py-2"
                        >
                            Để sau, quay lại Lộ trình
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
