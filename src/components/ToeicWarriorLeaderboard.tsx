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
  grammarAnswers: number
  listeningAnswers: number
  readingAnswers: number
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
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center text-center gap-1 mb-8">
        <h3 className="text-2xl font-black bg-gradient-to-r from-primary-700 to-secondary-500 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-1.5">
          Bảng Vinh Danh Chiến Binh ToeicMore
        </h3>
        <p className="text-slate-500 font-medium text-sm max-w-2xl mx-auto">
          Những học viên kiên trì và bền bỉ nhất trên hành trình chinh phục TOEIC.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-secondary-200 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-100 rounded-bl-full opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-50 rounded-tr-full opacity-50 pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10 custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-slate-100 text-primary-900/70 font-semibold">
                <th className="pb-4 px-4 text-center w-16 uppercase tracking-wider text-[11px]">Hạng</th>
                <th className="pb-4 px-4 uppercase tracking-wider text-[11px]">Chiến Binh</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Chuỗi Ngày</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Số Giờ Học</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Ngữ Pháp</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Nghe</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Đọc</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]" title="Từ Đã Thuộc">Từ Vựng</th>
                <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Stars</th>
              </tr>
            </thead>
            <tbody>
              {warriors.map((w, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={w.id} 
                  className={`border-b border-slate-50 transition-colors ${idx === 0 ? 'bg-secondary-50/30' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="py-4 px-4 text-center">
                    {idx === 0 ? <span className="text-2xl drop-shadow-sm" title="Top 1">🥇</span> : 
                     idx === 1 ? <span className="text-2xl drop-shadow-sm" title="Top 2">🥈</span> : 
                     idx === 2 ? <span className="text-2xl drop-shadow-sm" title="Top 3">🥉</span> : 
                     <span className="font-semibold text-primary-900/60">#{idx + 1}</span>}
                  </td>
                  <td className="py-4 px-4">
                    <div 
                      onClick={() => togglePrivacy(w.id)}
                      className={`flex items-center gap-3 ${session?.user?.id === w.id ? 'cursor-pointer hover:opacity-80 group relative' : ''}`}
                      title={session?.user?.id === w.id ? (w.isAnonymousLeaderboard ? 'Nhấn để công khai danh tính' : 'Nhấn để ẩn danh tính') : ''}
                    >
                      <div className={`relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 transition-all ${session?.user?.id === w.id ? 'group-hover:ring-2 group-hover:ring-primary-500' : ''}`}>
                        {!w.isAnonymousLeaderboard && w.image ? (
                          <img src={w.image} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold text-xs uppercase">
                            {w.isAnonymousLeaderboard ? w.name.split(' ')[0].charAt(0) : w.name.charAt(0)}
                          </div>
                        )}
                        {session?.user?.id === w.id && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-200 z-10 scale-75">
                            {w.isAnonymousLeaderboard ? (
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-primary-900 font-normal text-[13px]">
                        {w.isAnonymousLeaderboard ? w.name.split(' ')[0] + ' ***' : w.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-primary-900 font-normal text-[13px]">{w.currentStreak > 0 ? w.currentStreak : '-'}</span>
                      {w.currentStreak > 0 && <span className="text-[13px]" title="Chuỗi ngày học liên tục">🔥</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-primary-900 font-normal text-[13px]">{formatStudyTime(w.totalStudySeconds)}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-primary-900/80 font-normal text-[13px]">{w.grammarAnswers > 0 ? w.grammarAnswers : '-'}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-primary-900/80 font-normal text-[13px]">{w.listeningAnswers > 0 ? w.listeningAnswers : '-'}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-primary-900/80 font-normal text-[13px]">{w.readingAnswers > 0 ? w.readingAnswers : '-'}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-primary-900/80 font-normal text-[13px]">
                      {w.learnedVocab > 0 ? w.learnedVocab : '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-primary-900/80 font-normal text-[13px]">{w.toeicStars} <span className="text-[13px] opacity-80">⭐</span></span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
