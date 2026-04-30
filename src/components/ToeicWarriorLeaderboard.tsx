'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface WarriorStats {
  id: string
  name: string
  image: string | null
  toeicStars: number
  totalStudySeconds: number
  currentStreak: number
  learnedVocab: number
  practiceAnswers: number
  isAnonymousLeaderboard: boolean
}

const formatStudyTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function ToeicWarriorLeaderboard() {
  const { data: session } = useSession()
  const [warriors, setWarriors] = useState<WarriorStats[]>([])
  const [loading, setLoading] = useState(true)

  const togglePrivacy = async (warriorId: string) => {
    if (session?.user?.id !== warriorId) return;
    const loadingToast = toast.loading('Đang cập nhật...');
    try {
      const res = await fetch('/api/user/toggle-leaderboard-privacy', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWarriors(prev => prev.map(w => w.id === warriorId ? { ...w, isAnonymousLeaderboard: data.isAnonymousLeaderboard } : w));
        toast.success(data.isAnonymousLeaderboard ? 'Đã bật chế độ ẩn danh' : 'Đã tắt chế độ ẩn danh', { id: loadingToast });
      } else {
        toast.error('Có lỗi xảy ra', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Lỗi kết nối', { id: loadingToast });
    }
  }

  useEffect(() => {
    fetch('/api/toeic/leaderboard/warriors', { cache: 'no-store' })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setWarriors(res.data)
        } else {
          toast.error('Không thể tải Bảng Xếp Hạng')
        }
      })
      .catch(() => toast.error('Lỗi kết nối khi tải BXH'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse flex items-center space-x-2 text-primary-200">
          <div className="w-6 h-6 border-4 border-primary-800 border-t-primary-400 rounded-full animate-spin"></div>
          <span className="font-medium text-sm">Đang tải Bảng Xếp Hạng...</span>
        </div>
      </div>
    )
  }

  if (warriors.length === 0) return null

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center text-center gap-1 mb-8">
        <h3 className="text-2xl font-black bg-gradient-to-r from-primary-700 to-secondary-500 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-1.5 dark:from-primary-300 dark:to-secondary-400">
          Bảng Vinh Danh Chiến Binh ToeicMore
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-2xl mx-auto">
          Những học viên kiên trì và bền bỉ nhất trên hành trình chinh phục TOEIC.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {warriors.map((w, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={w.id} 
            className="flex items-center gap-4 bg-primary-50/40 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/30 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group"
          >
            {/* Rank Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center">
              {idx === 0 ? <span className="text-[34px] drop-shadow-md" title="Top 1">🥇</span> : 
               idx === 1 ? <span className="text-[34px] drop-shadow-md" title="Top 2">🥈</span> : 
               idx === 2 ? <span className="text-[34px] drop-shadow-md" title="Top 3">🥉</span> : 
               <span className="font-semibold text-primary-900/40 dark:text-primary-100/30 text-lg">#{idx + 1}</span>}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div 
                className="flex items-center gap-3 mb-1 cursor-pointer"
                onClick={() => togglePrivacy(w.id)}
                title={session?.user?.id === w.id ? (w.isAnonymousLeaderboard ? 'Nhấn để công khai danh tính' : 'Nhấn để ẩn danh tính') : ''}
              >
                <div className={`relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 transition-all ${session?.user?.id === w.id ? 'group-hover:ring-2 group-hover:ring-primary-500' : ''}`}>
                  {!w.isAnonymousLeaderboard && w.image ? (
                    <img src={w.image} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[13px] uppercase">
                      {w.isAnonymousLeaderboard ? w.name.split(' ')[0].charAt(0) : w.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="text-[16px] sm:text-[17px] font-bold text-primary-900 dark:text-white truncate">
                  {w.isAnonymousLeaderboard ? w.name.split(' ')[0] + ' ***' : w.name}
                </h4>
                {session?.user?.id === w.id && (
                  <div className={`flex shrink-0 items-center justify-center p-1 rounded-full transition-colors ${w.isAnonymousLeaderboard ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-500'}`}>
                    {w.isAnonymousLeaderboard ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-primary-600/80 dark:text-primary-300/70 text-[13px] mb-2.5">
                <span className="text-orange-500">🔥</span>
                <span>{w.currentStreak > 0 ? `Chuỗi ${w.currentStreak} ngày chuyên cần` : 'Chưa có chuỗi ngày'}</span>
              </div>

              {/* Combined Stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300" title="Số câu đã làm">
                  <svg className="w-4 h-4 text-[#ea980c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <strong className="font-bold text-primary-900 dark:text-white">{w.practiceAnswers > 0 ? w.practiceAnswers.toLocaleString() : '0'}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300" title="Số từ vựng">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <strong className="font-bold text-primary-900 dark:text-white">{w.learnedVocab > 0 ? w.learnedVocab.toLocaleString() : '0'}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300" title="Thời gian học">
                  <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong className="font-bold text-primary-900 dark:text-white">{formatStudyTime(w.totalStudySeconds)}</strong>
                </div>
              </div>
            </div>

            {/* Stars/XP */}
            <div className="shrink-0 flex items-center gap-1.5 pr-2">
              <span className="text-[19px] sm:text-[22px] font-black text-[#ea980c] drop-shadow-sm leading-none">
                {w.toeicStars.toLocaleString()}
              </span>
              <span className="text-[18px] sm:text-[20px] drop-shadow-sm leading-none mt-[-2px]">
                ⭐
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
