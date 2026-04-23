import React from 'react';

export default function ToeicRoadmapTab({ level, onPracticeClick, onTabClick }: { level: string | null, onPracticeClick: (path: string) => void, onTabClick: (tab: string) => void }) {
    
    // If we don't have a level yet, show a placeholder asking them to set it.
    if (!level) {
        return (
            <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🗺️</span>
                </div>
                <h2 className="text-2xl font-black text-[#14532d] mb-4">Lộ Trình Học Tập Cá Nhân Hóa</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8">
                    Vui lòng chọn trình độ hiện tại của bạn ở màn hình chào mừng để chúng tôi thiết kế lộ trình học tập phù hợp nhất dành riêng cho bạn.
                </p>
                <button 
                    onClick={() => {
                        localStorage.removeItem('toeicLevel');
                        window.location.reload();
                    }}
                    className="bg-[#14532d] hover:bg-[#166534] text-amber-400 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
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
        tasks: { title: string, type: string, actionText: string, path?: string, tab?: string }[]
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
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            tasks: [
                { title: 'Học 10 từ vựng chủ đề Office', type: 'Từ vựng', actionText: 'Học ngay', tab: 'vocabulary' },
                { title: 'Ngữ pháp: Thì hiện tại đơn', type: 'Ngữ pháp', actionText: 'Luyện tập', path: '/toeic-practice/grammar/thi-hien-tai-don' },
                { title: 'Luyện nghe Part 1 (Tranh ảnh)', type: 'Listening', actionText: 'Nghe thử', path: '/toeic-practice/actual-test' }
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
            color: 'text-blue-700',
            bg: 'bg-blue-50',
            tasks: [
                { title: 'Từ vựng: Marketing & Sales', type: 'Từ vựng', actionText: 'Học ngay', tab: 'vocabulary' },
                { title: 'Ngữ pháp: Câu Điều Kiện', type: 'Ngữ pháp', actionText: 'Luyện tập', path: '/toeic-practice/grammar/cau-dieu-kien' },
                { title: 'Luyện nghe Part 3 (Hội thoại ngắn)', type: 'Listening', actionText: 'Luyện nghe', path: '/toeic-practice/actual-test' }
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
                { title: 'Giải Full Test ETS 2024', type: 'Luyện Đề', actionText: 'Thi Thử', tab: 'actual-test' },
                { title: 'Speed Challenge Từ Vựng', type: 'Thử thách', actionText: 'Đua Top', tab: 'home' },
                { title: 'Ôn tập Part 7 (Đoạn kép)', type: 'Reading', actionText: 'Làm bài', path: '/toeic-practice/actual-test' }
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
                <h3 className="text-lg font-black text-[#14532d] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Nhiệm vụ hôm nay
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentRoadmap.tasks.map((task, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#14532d]/30 transition-all group flex flex-col">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{task.type}</div>
                            <h4 className="font-bold text-slate-800 mb-4 group-hover:text-[#14532d] transition-colors">{task.title}</h4>
                            <button
                                onClick={() => {
                                    if (task.tab) {
                                        onTabClick(task.tab);
                                    } else if (task.path) {
                                        onPracticeClick(task.path);
                                    }
                                }}
                                className="mt-auto w-full py-2.5 rounded-xl bg-slate-50 text-[#14532d] font-bold text-sm border border-slate-200 group-hover:bg-[#14532d] group-hover:text-amber-400 group-hover:border-[#14532d] transition-all cursor-pointer"
                            >
                                {task.actionText} &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-[#14532d]/5 rounded-2xl p-6 border border-[#14532d]/10 text-center text-sm font-medium text-slate-600 mt-8">
                Đây là phiên bản Lộ trình học (Phase 1). ToeicMore sẽ tiếp tục cập nhật hệ thống bài test Mini 3 phút để tự động đưa ra lộ trình chính xác hơn trong thời gian tới!
            </div>
        </div>
    );
}
