'use client'

import { useEffect, useState } from 'react'

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
}

const formatStudyTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function ToeicWarriorLeaderboard() {
  const [warriors, setWarriors] = useState<WarriorStats[]>([])
  const [loading, setLoading] = useState(true)

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
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {w.image ? (
                          <img src={w.image} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold text-xs">
                            {w.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="text-primary-900 font-normal text-[13px]">{w.name}</div>
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
