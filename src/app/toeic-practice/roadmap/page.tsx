"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RoadmapPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractName, setContractName] = useState("");
  const [studyPace, setStudyPace] = useState(30);

  useEffect(() => {
    setMounted(true);
    
    // Fetch actual roadmap data
    const fetchRoadmap = async () => {
      try {
        const storedLevel = localStorage.getItem('toeicLevel') || 'BEGINNER';
        const res = await fetch(`/api/toeic/roadmap?level=${storedLevel}`);
        const data = await res.json();
        if (data.success && data.roadmap) {
          // Transform data slightly to match our UI expectations
          const baseRatio = data.roadmap.targetScore ? (data.roadmap.currentScore / data.roadmap.targetScore) * 100 : 0;
          
          const skillsArr = [
            { name: "Grammar & Vocab", score: Math.min(100, Math.max(0, Math.round(baseRatio) + 10)), color: "from-blue-500 to-cyan-400", desc: "Ngữ pháp và Từ vựng" },
            { name: "Listening", score: Math.min(100, Math.max(0, Math.round(baseRatio) - 5)), color: "from-purple-500 to-pink-500", desc: "Kỹ năng Nghe Hiểu" },
            { name: "Reading", score: Math.min(100, Math.max(0, Math.round(baseRatio))), color: "from-orange-400 to-red-500", desc: "Kỹ năng Đọc Hiểu" },
            { name: "Pronunciation", score: Math.min(100, Math.max(0, Math.round(baseRatio) - 10)), color: "from-amber-400 to-orange-500", desc: "Kỹ năng Phát Âm" },
          ];

          const highestSkill = skillsArr.reduce((prev, current) => (prev.score > current.score) ? prev : current);
          const lowestSkill = skillsArr.reduce((prev, current) => (prev.score < current.score) ? prev : current);

          const transformed = {
            currentScore: data.roadmap.currentScore,
            targetScore: data.roadmap.targetScore,
            skills: skillsArr,
            highestSkill,
            lowestSkill,
            phases: data.roadmap.phases.map((p: any, index: number) => ({
              id: p.id,
              title: p.title,
              weekNumber: p.weekNumber || index + 1,
              objective: p.objectiveOutput,
              expectedScoreUp: p.expectedScoreUp,
              // Giả lập trạng thái khóa/mở: Tuần 1, 2, 3 luôn mở, từ tuần 4 trở đi bị làm mờ
              isUnlocked: index < 3 || data.roadmap.isUltraUnlocked,
              tasks: p.dailyTasks.map((t: any) => ({
                day: t.dayNumber,
                title: t.title,
                type: t.taskType,
                stars: t.rewardStars,
                done: t.status === "COMPLETED",
                path: t.referencePath
              }))
            }))
          };
          setRoadmapData(transformed);
          if (data.isGuest) {
            setIsGuest(true);
          }
          
          const hasSigned = localStorage.getItem('toeicRoadmapContractSigned');
          if (!hasSigned) {
            setShowContractModal(true);
          }
        } else {
          // Fallback if no roadmap generated yet
          toast("Chưa có lộ trình, hãy làm bài đánh giá năng lực trước nhé!");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoadmap();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_15px_#a855f7]"></div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Đang đồng bộ Bản Đồ Sao...</h2>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-xl max-w-lg">
          <div className="text-6xl mb-6">🗺️</div>
          <h2 className="text-3xl font-bold text-white mb-4">Chưa có Lộ Trình</h2>
          <p className="text-slate-400 mb-8">Bạn cần hoàn thành bài Đánh giá năng lực trước để chúng tôi có thể thiết kế Lộ trình độc bản dành riêng cho bạn.</p>
          <button onClick={() => router.push('/toeic-practice')} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans overflow-x-hidden relative selection:bg-purple-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      {isGuest && (
        <div className="relative z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 text-center font-bold text-sm shadow-lg">
          🚀 Bạn đang xem bản xem trước lộ trình! Hãy <Link href="/login" className="underline decoration-2 underline-offset-2 hover:text-black transition-colors">Đăng nhập / Đăng ký</Link> để lưu lộ trình này vĩnh viễn nhé.
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* STREAK & MOTIVATION BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group hover:border-orange-500/40 transition-colors"
        >
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors" />
          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse">
              🔥
            </div>
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-1">
                Chuỗi học: 3 ngày liên tiếp
                <span className="text-[10px] uppercase tracking-widest bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-black border border-orange-500/30">
                  ON FIRE
                </span>
              </h3>
              <p className="text-sm text-slate-300">
                Lộ trình đang đi đúng hướng! Duy trì chuỗi để nhận huy hiệu tuần này.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 w-full md:w-auto flex gap-3">
            <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <span className="text-xl">❄️</span> Mua Đóng Băng
            </button>
          </div>
        </motion.div>

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold tracking-widest uppercase mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Thiết kế riêng dành cho bạn
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Lộ Trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Độc Bản</span> Của Bạn
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Dựa trên bài đánh giá năng lực, chúng tôi đã thiết kế lộ trình kéo dài <strong className="text-purple-400">{roadmapData.phases.length} tuần</strong> dành riêng cho bạn để đạt mục tiêu trong thời gian ngắn nhất.
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
                <p className="text-5xl font-black text-slate-300">{roadmapData.currentScore}</p>
              </div>
              <div className="pb-2 text-purple-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div>
                <p className="text-purple-400/80 text-sm mb-1 uppercase tracking-wider font-semibold">Mục tiêu</p>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{roadmapData.targetScore}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500">
                <p className="text-emerald-100 text-sm"><strong className="text-emerald-400">💡 Điểm Sáng:</strong> Bạn có nền tảng {roadmapData.highestSkill.desc.toLowerCase()} khá ổn. Giữ vững phong độ!</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500">
                <p className="text-red-100 text-sm"><strong className="text-red-400">⚠️ Cần Cải Thiện:</strong> Cần đầu tư thêm vào {roadmapData.lowestSkill.desc} (Đang ở mức thấp nhất).</p>
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
              {roadmapData.skills.map((skill: any, index: number) => (
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
          
          {roadmapData.phases.map((phase: any, index: number) => (
            <motion.div 
              key={phase.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`relative flex flex-col md:flex-row items-center justify-between mb-24 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline Node */}
              <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 md:-translate-y-1/2 bg-[#0a0a0f] border-2 border-purple-500 text-purple-400 font-black text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full z-10 shadow-[0_0_15px_#a855f7] whitespace-nowrap">
                TUẦN {phase.weekNumber}
              </div>

              {/* Content Side */}
              <div className={`w-full pl-16 md:pl-0 md:w-[45%] ${index % 2 !== 0 ? 'md:text-left' : 'md:text-right'}`}>
                <div className={`relative bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 hover:bg-white/[0.05] transition-all duration-300
                    ${phase.isUnlocked ? 'ring-1 ring-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'overflow-hidden'}`}
                >
                  {/* Nếu bị khóa, áp dụng hiệu ứng Glassmorphism & Upsell */}
                  {!phase.isUnlocked && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-[#0a0a0f]/60 flex flex-col items-center justify-center p-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                          <svg className="w-6 h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <div className="absolute -top-2 -right-3 text-[9px] font-black bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-1.5 py-0.5 rounded shadow-sm transform rotate-6">
                            ULTRA
                          </div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-300">
                          Tính năng đang tạm khóa
                        </h4>
                      </div>
                    </div>
                  )}

                  <div className={!phase.isUnlocked ? "opacity-30 blur-sm select-none" : ""}>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold 
                        ${phase.isUnlocked ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                        {phase.title}
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Thời gian: Tuần {phase.weekNumber}
                      </div>
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
                        {phase.tasks.map((task: any, tIndex: number) => (
                          <Link href={task.path || '#'} key={tIndex} className="group relative bg-black/40 border border-white/5 p-4 rounded-xl flex gap-4 items-center hover:border-purple-500/30 transition-colors cursor-pointer block">
                            {/* Checkbox Gamification */}
                            <div className="relative flex-shrink-0">
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
                              <p className={`font-medium ${task.done ? 'text-slate-500 line-through' : 'text-slate-200'} group-hover:text-purple-300 transition-colors`}>
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

                            {/* Arrow Icon to indicate link */}
                            <div className="flex-shrink-0 text-slate-500 group-hover:text-purple-400 transition-colors transform group-hover:translate-x-1">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
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

        {/* CHỈ BÁO CÒN NHIỀU TUẦN NỮA */}
        <div className="relative flex justify-center mt-8 mb-16">
           <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 md:-ml-[1px] w-[2px] border-l-2 border-dashed border-purple-500/30" />
           <div className="bg-[#0a0a0f] border border-purple-500/30 px-6 py-3 rounded-full text-purple-400 font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)] z-10 flex items-center gap-2">
              <span className="animate-bounce">↓</span> Vẫn còn lộ trình cho các tuần tiếp theo...
           </div>
        </div>
      </main>

      {/* COMMITMENT CONTRACT MODAL */}
      <AnimatePresence>
        {showContractModal && roadmapData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                  <span className="text-3xl">📜</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Bản Cam Kết Mục Tiêu</h2>
                <p className="text-slate-400 text-sm">
                  Hãy thiết lập cường độ học phù hợp với quỹ thời gian của bạn và ký cam kết để bắt đầu hành trình.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {/* Intensity Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">Thời gian rảnh mỗi ngày của bạn:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[15, 30, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setStudyPace(mins)}
                        className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${studyPace === mins ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                      >
                        {mins} phút
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contract Text */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 font-serif italic text-slate-300 text-sm leading-relaxed relative">
                  <div className="absolute top-2 left-2 text-purple-500/20 text-4xl leading-none">"</div>
                  <p className="relative z-10 text-center">
                    Tôi cam kết sẽ dành ra ít nhất <strong className="text-purple-400 not-italic">{studyPace} phút</strong> mỗi ngày để học theo đúng lộ trình này.
                    <br/><br/>
                    Mục tiêu của tôi là đạt <strong className="text-cyan-400 not-italic">{roadmapData.targetScore} điểm TOEIC</strong>. Tôi sẽ không bỏ cuộc!
                  </p>
                  <div className="absolute bottom-2 right-2 text-purple-500/20 text-4xl leading-none rotate-180">"</div>
                </div>

                {/* Signature */}
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Chữ ký (Nhập tên của bạn):</label>
                  <input 
                    type="text" 
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                disabled={!contractName.trim()}
                onClick={() => {
                  localStorage.setItem('toeicRoadmapContractSigned', 'true');
                  localStorage.setItem('toeicRoadmapPace', studyPace.toString());
                  setShowContractModal(false);
                  toast.success(`Cảm ơn ${contractName}! Chúc bạn sớm đạt ${roadmapData.targetScore} điểm.`, { duration: 5000 });
                }}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${contractName.trim() ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                TÔI XIN CAM KẾT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
