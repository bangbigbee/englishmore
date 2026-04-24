import React from 'react';
import { useRouter } from 'next/navigation';

export default function ToeicRoadmapTab({ level, onPracticeClick, onTabClick }: { level: string | null, onPracticeClick: (path: string) => void, onTabClick: (tab: string) => void }) {
    const router = useRouter();
    // If we don't have a level yet, show a placeholder asking them to set it.
    if (!level) {
        return (
            <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🗺️</span>
                </div>
                <h2 className="text-2xl font-black text-[#581c87] mb-4">Lộ Trình Học Tập Cá Nhân Hóa</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8">
                    Vui lòng chọn trình độ hiện tại của bạn ở màn hình chào mừng để chúng tôi thiết kế lộ trình học tập phù hợp nhất dành riêng cho bạn.
                </p>
                <button 
                    onClick={() => {
                        localStorage.removeItem('toeicLevel');
                        window.location.reload();
                    }}
                    className="bg-[#581c87] hover:bg-[#6b21a8] text-amber-400 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                    Đánh giá lại trình độ
                </button>
            </div>
        );
    }

    const roadmapData: Record<string, {
        title: string,
        subtitle: string,
        icon: React.ReactNode,
        color: string,
        bg: string,
        tasks: { title: string, type: string, actionText: string, path?: string, tab?: string, isPremium?: boolean }[]
    }> = {
        'BEGINNER': {
            title: 'Lộ trình Xóa Mù (Mất gốc)',
            subtitle: 'Mục tiêu: Xây dựng nền tảng từ vựng và ngữ pháp cơ bản, làm quen Part 1 & 2.',
            icon: (
                <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 20h10" />
                    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
            ),
            color: 'text-purple-700',
            bg: 'bg-purple-50',
            tasks: [
                { title: 'Học 10 từ vựng chủ đề Office', type: 'Từ vựng (Miễn phí)', actionText: 'Học ngay', tab: 'vocabulary' },
                { title: 'Ngữ pháp: Thì hiện tại đơn', type: 'Ngữ pháp (Miễn phí)', actionText: 'Luyện tập', path: '/toeic-practice/grammar/thi-hien-tai-don' },
                { title: 'Thi Đánh Giá Chặng & Vá Lỗi Bằng AI', type: 'Diagnostic (PRO)', actionText: 'Mở khóa phân tích AI', isPremium: true, path: '/toeic-practice/upgrade' }
            ]
        },
        'INTERMEDIATE': {
            title: 'Lộ trình Bứt Phá (Cơ bản)',
            subtitle: 'Mục tiêu: Tăng tốc Part 3, 4, 7, mở rộng vốn từ vựng nâng cao.',
            icon: (
                <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
            ),
            color: 'text-purple-700',
            bg: 'bg-purple-50',
            tasks: [
                { title: 'Từ vựng: Marketing & Sales', type: 'Từ vựng (Miễn phí)', actionText: 'Học ngay', tab: 'vocabulary' },
                { title: 'Ngữ pháp: Câu Điều Kiện', type: 'Ngữ pháp (Miễn phí)', actionText: 'Luyện tập', path: '/toeic-practice/grammar/cau-dieu-kien' },
                { title: 'Phân tích lỗi sai thường gặp Part 3', type: 'Deep Dive (PRO)', actionText: 'Mở khóa Video giải thích', isPremium: true, path: '/toeic-practice/upgrade' }
            ]
        },
        'ADVANCED': {
            title: 'Lộ trình Master (Mục tiêu 800+)',
            subtitle: 'Mục tiêu: Giải đề cường độ cao, tối ưu thời gian, vượt qua bẫy.',
            icon: (
                <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            ),
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            tasks: [
                { title: 'Giải Full Test ETS 2024', type: 'Luyện Đề (Miễn phí)', actionText: 'Thi Thử', tab: 'actual-test' },
                { title: 'Speed Challenge Từ Vựng', type: 'Thử thách (Miễn phí)', actionText: 'Đua Top', tab: 'home' },
                { title: 'Vá lỗ hổng dạng câu Suy luận khó', type: 'Diagnostic (PRO)', actionText: 'Nhận bài tập AI thiết kế', isPremium: true, path: '/toeic-practice/upgrade' }
            ]
        }
    };

    const currentRoadmap = roadmapData[level] || roadmapData['BEGINNER'];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className={`rounded-3xl p-8 mb-8 border shadow-sm relative overflow-hidden ${currentRoadmap.bg} border-white`}>
                <div className="absolute -right-4 -top-4 text-[120px] opacity-10 pointer-events-none rotate-12 flex items-center justify-center text-current">
                    {currentRoadmap.icon}
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl drop-shadow-sm flex items-center justify-center text-current">{currentRoadmap.icon}</span>
                        <h2 className={`text-2xl font-black ${currentRoadmap.color}`}>{currentRoadmap.title}</h2>
                    </div>
                    <p className={`text-[15px] font-medium opacity-80 ${currentRoadmap.color}`}>
                        {currentRoadmap.subtitle}
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                        <button 
                            onClick={() => {
                                localStorage.removeItem('toeicLevel');
                                window.location.reload();
                            }}
                            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer"
                        >
                            Đổi lộ trình
                        </button>
                    </div>
                </div>
            </div>

            {/* Tasks */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-[#581c87] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Nhiệm vụ hôm nay
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentRoadmap.tasks.map((task, idx) => (
                        <div key={idx} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all group flex flex-col relative overflow-hidden ${task.isPremium ? 'border-amber-200 hover:border-amber-400 hover:shadow-md' : 'border-slate-200 hover:border-[#581c87]/30 hover:shadow-md'}`}>
                            {task.isPremium && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 opacity-50 rounded-bl-full pointer-events-none" />
                            )}
                            
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${task.isPremium ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full' : 'text-slate-400'}`}>
                                    {task.type}
                                </div>
                                {task.isPremium && (
                                    <span className="text-amber-500 text-sm" title="Tính năng PRO">👑</span>
                                )}
                            </div>
                            
                            <h4 className={`font-bold mb-4 transition-colors ${task.isPremium ? 'text-slate-800 group-hover:text-amber-700' : 'text-slate-800 group-hover:text-[#581c87]'}`}>
                                {task.title}
                            </h4>
                            
                            <button
                                onClick={() => {
                                    if (task.path) {
                                        router.push(task.path);
                                    } else if (task.tab) {
                                        onTabClick(task.tab);
                                    }
                                }}
                                className={`mt-auto w-full py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                                    task.isPremium 
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-500 hover:shadow-lg hover:-translate-y-0.5 shadow-amber-500/25'
                                        : 'bg-slate-50 text-[#581c87] border-slate-200 group-hover:bg-[#581c87] group-hover:text-amber-400 group-hover:border-[#581c87]'
                                }`}
                            >
                                {task.isPremium ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                        {task.actionText} 
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                ) : (
                                    <>{task.actionText} &rarr;</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Upsell / Value Proposition Footer */}
            <div className="bg-gradient-to-r from-[#581c87]/5 to-purple-100/30 rounded-2xl p-6 border border-[#581c87]/10 flex flex-col sm:flex-row items-center gap-6 mt-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-purple-100">
                    <span className="text-3xl">💎</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-base font-black text-[#581c87] mb-1.5">Học không giới hạn với ToeicMore PRO</h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
                        Lộ trình bài tập cơ bản là hoàn toàn miễn phí trọn đời! Tuy nhiên, nếu bạn muốn tiết kiệm thời gian, mở khóa <strong className="text-amber-600">Giải thích chi tiết (Explanation)</strong> cho từng câu sai, và xem <strong className="text-amber-600">Phân tích điểm yếu AI</strong>, hãy nâng cấp tài khoản nhé.
                    </p>
                    <button 
                        onClick={() => router.push('/toeic-practice/upgrade')}
                        className="inline-flex items-center gap-2 text-[13px] font-bold text-[#581c87] hover:text-[#6b21a8] transition-colors group cursor-pointer"
                    >
                        Xem đặc quyền PRO/ULTRA 
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
