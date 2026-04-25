import { ROADMAP_TEMPLATES } from '@/lib/roadmapTemplates';
import { useRouter } from 'next/navigation';

export default function ToeicRoadmapTab({ level, score, onPracticeClick, onTabClick }: { level: string | null, score: string | null, onPracticeClick: (path: string) => void, onTabClick: (tab: string) => void }) {
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
                        window.dispatchEvent(new Event('openToeicOnboarding'));
                    }}
                    className="bg-[#581c87] hover:bg-[#6b21a8] text-purple-100 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                    Đánh giá lại trình độ
                </button>
            </div>
        );
    }

    let currentPoints = 350;
    if (score) {
        const parts = score.split('/');
        if (parts.length === 2) {
            const percentage = parseInt(parts[0]) / parseInt(parts[1]);
            currentPoints = Math.round(percentage * 990);
            if (currentPoints < 10) currentPoints = 10;
        }
    }

    const templateLevel = level || 'BEGINNER';
    const template = ROADMAP_TEMPLATES[templateLevel] || ROADMAP_TEMPLATES['BEGINNER'];

    let finalTargetScore = template.targetScore || 450;
    if (currentPoints >= finalTargetScore) {
        if (currentPoints < 850) finalTargetScore = 850;
        else if (currentPoints < 900) finalTargetScore = 900;
        else if (currentPoints < 950) finalTargetScore = 950;
        else finalTargetScore = 990;
    }

    const mapTaskType = (type: string) => {
        switch(type) {
            case 'GRAMMAR': return 'Ngữ pháp';
            case 'VOCAB': return 'Từ vựng';
            case 'LISTENING': return 'Nghe hiểu';
            case 'READING': return 'Đọc hiểu';
            case 'TEST': return 'Luyện Đề';
            case 'REVIEW': return 'Chữa đề';
            case 'PRONUNCIATION': return 'Phát âm';
            default: return 'Thử thách';
        }
    };

    const mapActionText = (type: string) => {
        switch(type) {
            case 'GRAMMAR': return 'Luyện tập';
            case 'VOCAB': return 'Học ngay';
            case 'LISTENING': return 'Bắt đầu';
            case 'READING': return 'Luyện tập';
            case 'TEST': return 'Thi Thử';
            case 'REVIEW': return 'Xem lại';
            default: return 'Bắt đầu';
        }
    };

    const dynamicTasks = (template.phases[0]?.tasks || []).slice(0, 3).map((t: any) => ({
        title: t.title,
        type: mapTaskType(t.taskType),
        actionText: mapActionText(t.taskType),
        path: t.referencePath
    }));

    const roadmapData: Record<string, {
        title: string,
        subtitle: string,
        icon: React.ReactNode,
        color: string,
        bg: string,
        tasks: { title: string, type: string, actionText: string, path?: string, tab?: string, isPremium?: boolean }[]
    }> = {
        'BEGINNER': {
            title: `Lộ trình Xóa Mù (Mục tiêu ${finalTargetScore}+)`,
            subtitle: 'Mục tiêu: Xây dựng nền tảng từ vựng và ngữ pháp cơ bản, làm quen Part 1 & 2.',
            icon: (
                <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 20h10" />
                    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                </svg>
            ),
            color: 'text-[#581c87]',
            bg: 'bg-purple-50',
            tasks: dynamicTasks
        },
        'INTERMEDIATE': {
            title: `Lộ trình Bứt Phá (Mục tiêu ${finalTargetScore}+)`,
            subtitle: 'Mục tiêu: Tăng tốc Part 3, 4, 7, mở rộng vốn từ vựng nâng cao.',
            icon: (
                <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
            ),
            color: 'text-[#581c87]',
            bg: 'bg-purple-50',
            tasks: dynamicTasks
        },
        'ADVANCED': {
            title: `Lộ trình Master (Mục tiêu ${finalTargetScore}+)`,
            subtitle: 'Mục tiêu: Giải đề cường độ cao, tối ưu thời gian, vượt qua bẫy.',
            icon: (
                <svg className="w-[1em] h-[1em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            ),
            color: 'text-[#581c87]',
            bg: 'bg-purple-50',
            tasks: dynamicTasks
        }
    };

    const currentRoadmap = roadmapData[level] || roadmapData['BEGINNER'];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className={`rounded-3xl p-8 mb-8 border shadow-sm relative overflow-hidden ${currentRoadmap.bg} border-white`}>
                <div className={`absolute -right-4 -top-4 text-[120px] opacity-[0.03] pointer-events-none rotate-12 flex items-center justify-center ${currentRoadmap.color}`}>
                    {currentRoadmap.icon}
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`text-3xl drop-shadow-sm flex items-center justify-center ${currentRoadmap.color}`}>{currentRoadmap.icon}</span>
                        <h2 className={`text-2xl font-black ${currentRoadmap.color}`}>{currentRoadmap.title}</h2>
                    </div>
                    <p className="text-[15px] font-medium text-slate-700">
                        {currentRoadmap.subtitle}
                    </p>
                    
                    {score && (
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <span className="text-sm font-semibold text-slate-700 bg-white/80 px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center">
                                Điểm thi đầu vào: <span className="font-black text-[#581c87] ml-2 text-lg">{score}</span>
                            </span>
                            
                            <button 
                                onClick={() => router.push('/toeic-practice/roadmap')}
                                className="relative overflow-hidden group bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold shadow-[0_0_15px_rgba(88,28,135,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 blur-sm opacity-40 group-hover:opacity-60 transition-opacity" />
                                <span className="relative flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Lộ Trình Của Tôi
                                    <span className="text-amber-400 ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </span>
                            </button>
                        </div>
                    )}

                    <div className="mt-5">
                        <button 
                            onClick={() => {
                                window.dispatchEvent(new Event('openToeicOnboarding'));
                            }}
                            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#581c87] underline underline-offset-4 transition-colors cursor-pointer"
                        >
                            Đánh giá lại trình độ
                        </button>
                    </div>
                </div>
            </div>

            {/* Tasks */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-[#581c87] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Nhiệm vụ hôm nay
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentRoadmap.tasks.map((task, idx) => (
                        <div key={idx} className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all group flex flex-col relative overflow-hidden hover:border-[#581c87]/30 hover:shadow-md`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {task.type}
                                </div>
                            </div>
                            
                            <h4 className="font-bold mb-4 text-slate-800 transition-colors group-hover:text-[#581c87]">
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
                                className="mt-auto w-full py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer bg-slate-50 text-[#581c87] border-slate-200 group-hover:bg-[#581c87] group-hover:text-purple-50 group-hover:border-[#581c87] flex items-center justify-center gap-1.5"
                            >
                                {task.actionText} {task.isPremium ? <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> : <>&rarr;</>}
                            </button>

                            {task.isPremium && (
                                <div className="absolute top-3 right-3 text-[9px] font-bold tracking-widest bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                    PRO
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Upsell / Value Proposition Footer */}
            <div className="mt-8 text-center">
                <button 
                    onClick={() => router.push('/toeic-practice/upgrade')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#581c87] hover:text-purple-800 transition-colors cursor-pointer group"
                >
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Nâng cấp ULTRA để tiết kiệm thời gian học, mở khóa tính năng giải thích chi tiết và nâng cao.
                    <span className="group-hover:translate-x-1 transition-transform ml-0.5">&rarr;</span>
                </button>
            </div>
        </div>
    );
}
