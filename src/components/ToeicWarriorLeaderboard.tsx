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
            className="flex items-center gap-4 bg-white dark:bg-[#1a1f2e] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group"
          >
            {/* Rank Icon */}
            <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl flex items-center justify-center text-white
              ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-500/20' : 
                idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg shadow-slate-400/20' : 
                idx === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 shadow-lg shadow-orange-500/20' : 
                'bg-slate-100 dark:bg-slate-800 text-slate-400 font-black text-lg'}`}
            >
              {idx === 0 ? (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 14l2-9h14l2 9-5-2-4 5-4-5-5 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21h14" /></svg>
              ) : idx === 1 || idx === 2 ? (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              ) : (
                <span>#{idx + 1}</span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div 
                className="flex items-center gap-2 mb-1 cursor-pointer"
                onClick={() => togglePrivacy(w.id)}
                title={session?.user?.id === w.id ? (w.isAnonymousLeaderboard ? 'Nhấn để công khai danh tính' : 'Nhấn để ẩn danh tính') : ''}
              >
                <h4 className="text-[16px] sm:text-[17px] font-bold text-slate-900 dark:text-white truncate">
                  {w.isAnonymousLeaderboard ? w.name.split(' ')[0] + ' ***' : w.name}
                </h4>
                {session?.user?.id === w.id && (
                  <div className={`flex shrink-0 items-center justify-center p-1 rounded-full transition-colors ${w.isAnonymousLeaderboard ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'}`}>
                    {w.isAnonymousLeaderboard ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px] mb-2.5">
                <span className="text-orange-500">🔥</span>
                <span>{w.currentStreak > 0 ? `${w.currentStreak} ngày streak` : 'Chưa có streak'}</span>
              </div>

              {/* Combined Stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Số câu: <strong className="font-bold text-slate-900 dark:text-white">{w.practiceAnswers > 0 ? w.practiceAnswers.toLocaleString() : '0'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Số từ: <strong className="font-bold text-slate-900 dark:text-white">{w.learnedVocab > 0 ? w.learnedVocab.toLocaleString() : '0'}</strong></span>
                </div>
              </div>
            </div>

            {/* Stars/XP */}
            <div className="shrink-0 flex flex-col items-end pr-2">
              <span className="text-[17px] sm:text-[19px] font-black text-sky-500 drop-shadow-sm leading-none mb-1">
                {w.toeicStars.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                XP
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
