"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Giả lập dữ liệu
const ROADMAP_DATA = {
  currentScore: 350,
  targetScore: 650,
  skills: [
    { name: "Grammar", score: 40, max: 100, color: "from-blue-500 to-cyan-400" },
    { name: "Vocabulary", score: 65, max: 100, color: "from-purple-500 to-pink-500" },
    { name: "Listening", score: 30, max: 100, color: "from-green-400 to-emerald-600" },
    { name: "Reading", score: 45, max: 100, color: "from-orange-400 to-red-500" },
  ],
  phases: [
    {
      id: 1,
      title: "Chặng 1: Xây Nền Móng",
      objective: "Nắm vững 12 thì & 300 từ vựng cốt lõi",
      expectedScoreUp: 50,
      isUnlocked: true,
      tasks: [
        { day: 1, title: "Khởi động: Thì Hiện tại đơn & Tiếp diễn", type: "GRAMMAR", stars: 10, done: true },
        { day: 1, title: "Học 20 từ vựng chủ đề Office", type: "VOCAB", stars: 15, done: false },
        { day: 2, title: "Luyện Nghe Part 1: Tranh Tả Người", type: "LISTENING", stars: 20, done: false },
      ]
    },
    {
      id: 2,
      title: "Chặng 2: Vượt Chướng Ngại Vật",
      objective: "Chinh phục Part 2 & Đọc hiểu Part 5",
      expectedScoreUp: 100,
      isUnlocked: false,
      tasks: []
    },
    {
      id: 3,
      title: "Chặng 3: Bứt Phá Giới Hạn",
      objective: "Kỹ năng làm bài Part 3, 4, 7 nâng cao",
      expectedScoreUp: 150,
      isUnlocked: false,
      tasks: []
    }
  ]
};

export default function RoadmapPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans overflow-x-hidden relative selection:bg-purple-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            Cá Nhân Hóa Trí Tuệ Nhân Tạo
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Lộ Trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Độc Bản</span> Của Bạn
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Dựa trên bài đánh giá năng lực, chúng tôi đã thiết kế một bản đồ sao dành riêng cho bạn để đạt mục tiêu trong thời gian ngắn nhất.
          </p>
        </motion.div>

        {/* BẢNG PHÂN TÍCH NĂNG LỰC */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-24"
        >
          {/* Card Điểm số */}
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-colors" />
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Dự phóng Mục Tiêu
            </h3>
            
            <div className="flex items-end gap-6 mb-8">
              <div>
                <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">Hiện tại</p>
                <p className="text-5xl font-black text-slate-300">{ROADMAP_DATA.currentScore}</p>
              </div>
              <div className="pb-2 text-purple-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div>
                <p className="text-purple-400/80 text-sm mb-1 uppercase tracking-wider font-semibold">Mục tiêu</p>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{ROADMAP_DATA.targetScore}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500">
                <p className="text-emerald-100 text-sm"><strong className="text-emerald-400">💡 Điểm Sáng:</strong> Bạn có vốn Từ Vựng khá tốt. Hãy tiếp tục phát huy!</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500">
                <p className="text-red-100 text-sm"><strong className="text-red-400">⚠️ Điểm Cần Cải Thiện:</strong> Kỹ năng Nghe Part 1 & 2 đang kéo điểm bạn xuống. Cần ưu tiên ngay.</p>
              </div>
            </div>
          </div>

          {/* Card Kỹ Năng */}
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-8">
             <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Chi tiết Kỹ năng
            </h3>
            
            <div className="space-y-6">
              {ROADMAP_DATA.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-300">{skill.name}</span>
                    <span className="text-slate-500">{skill.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + (index * 0.1) }}
                      className={`h-full rounded-full bg-gradient-to-r ${skill.color} shadow-[0_0_10px_currentColor]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ROADMAP TIMELINE */}
        <div className="relative">
          {/* Vertical Glowing Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500 via-blue-500 to-transparent opacity-30 transform md:-translate-x-1/2" />
          
          {ROADMAP_DATA.phases.map((phase, index) => (
            <motion.div 
              key={phase.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`relative flex flex-col md:flex-row items-center justify-between mb-24 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline Node */}
              <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[#0a0a0f] border-4 border-purple-500 z-10 shadow-[0_0_15px_#a855f7]" />

              {/* Content Side */}
              <div className={`w-full pl-16 md:pl-0 md:w-[45%] ${index % 2 !== 0 ? 'md:text-left' : 'md:text-right'}`}>
                <div className={`relative bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 hover:bg-white/[0.05] transition-all duration-300
                    ${phase.isUnlocked ? 'ring-1 ring-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'overflow-hidden'}`}
                >
                  {/* Nếu bị khóa, áp dụng hiệu ứng Glassmorphism & Upsell */}
                  {!phase.isUnlocked && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-[#0a0a0f]/60 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-300 p-[2px] mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <div className="w-full h-full bg-[#0a0a0f] rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">ULTRA Exclusive</h4>
                      <p className="text-sm text-slate-300 mb-6 max-w-[250px]">Nâng cấp ULTRA để mở khóa lộ trình cá nhân hóa từ chuyên gia.</p>
                      <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-0.5">
                        Nâng cấp ngay
                      </button>
                    </div>
                  )}

                  <div className={!phase.isUnlocked ? "opacity-30 blur-sm select-none" : ""}>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 
                      ${phase.isUnlocked ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                      {phase.title}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-100 mb-2">{phase.objective}</h4>
                    <p className="text-emerald-400 font-semibold mb-6 text-sm flex items-center gap-2 justify-start md:justify-end">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Dự kiến tăng +{phase.expectedScoreUp} điểm
                    </p>

                    {/* Daily Quests List */}
                    {phase.isUnlocked && phase.tasks && (
                      <div className="space-y-3 mt-6 text-left">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Nhiệm Vụ Tuần Này</div>
                        {phase.tasks.map((task, tIndex) => (
                          <div key={tIndex} className="group relative bg-black/40 border border-white/5 p-4 rounded-xl flex gap-4 items-start hover:border-purple-500/30 transition-colors cursor-pointer">
                            {/* Checkbox Gamification */}
                            <div className="mt-0.5 relative flex-shrink-0">
                              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                                ${task.done ? 'bg-purple-500 border-purple-500' : 'border-slate-600 group-hover:border-purple-400'}`}>
                                {task.done && (
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <p className={`font-medium ${task.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 uppercase">
                                  {task.type}
                                </span>
                                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                  +{task.stars} ⭐
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Empty Side for layout */}
              <div className="hidden md:block md:w-[45%]" />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
