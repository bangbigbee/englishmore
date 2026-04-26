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
  learnedVocab: number
  grammarAnswers: number
  listeningAnswers: number
  readingAnswers: number
}

const formatStudyTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}g ${m}p`
}

export default function ToeicWarriorLeaderboard() {
  const [warriors, setWarriors] = useState<WarriorStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/toeic/leaderboard/warriors')
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
        <div className="animate-pulse flex items-center space-x-2 text-slate-400">
          <div className="w-6 h-6 border-4 border-slate-300 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="font-medium text-sm">Đang tải Bảng Xếp Hạng...</span>
        </div>
      </div>
    )
  }

  if (warriors.length === 0) return null

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">
          Bảng vinh danh Chiến Binh <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">ToeicMore</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
          Những học viên kiên trì và bền bỉ nhất trên hành trình chinh phục TOEIC.
        </p>
      </div>

      <div className="bg-white md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Desktop / Tablet View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 font-semibold">
              <tr>
                <th scope="col" className="px-6 py-5 rounded-tl-3xl">Hạng</th>
                <th scope="col" className="px-6 py-5">Chiến Binh</th>
                <th scope="col" className="px-6 py-5 text-center">Toeic Stars</th>
                <th scope="col" className="px-6 py-5 text-center">Thời Gian Học</th>
                <th scope="col" className="px-6 py-5 text-center">Ngữ Pháp</th>
                <th scope="col" className="px-6 py-5 text-center">Nghe</th>
                <th scope="col" className="px-6 py-5 text-center">Đọc</th>
                <th scope="col" className="px-6 py-5 text-center rounded-tr-3xl">Từ Đã Thuộc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warriors.map((w, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={w.id} 
                  className="hover:bg-primary-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-primary-100 transition-all">
                        {w.image ? (
                          <img src={w.image} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                            {w.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-slate-800">{w.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-100/50">
                      <span>{w.toeicStars}</span>
                      <span className="text-xs">⭐</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs">{formatStudyTime(w.totalStudySeconds)}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 font-medium whitespace-nowrap">
                    {w.grammarAnswers > 0 ? w.grammarAnswers : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 font-medium whitespace-nowrap">
                    {w.listeningAnswers > 0 ? w.listeningAnswers : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 font-medium whitespace-nowrap">
                    {w.readingAnswers > 0 ? w.readingAnswers : '-'}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md text-xs">
                      {w.learnedVocab}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {warriors.map((w, idx) => (
            <motion.div 
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 hover:bg-primary-50/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm bg-slate-100 text-slate-600 shrink-0 shadow-sm border border-slate-200/50">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </div>
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm ring-2 ring-transparent">
                  {w.image ? (
                    <img src={w.image} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                      {w.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="font-bold text-slate-800 flex-1 truncate text-base">{w.name}</div>
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-100/50 shrink-0">
                  <span className="text-sm">{w.toeicStars}</span>
                  <span className="text-xs">⭐</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="flex flex-col p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider mb-1">Thời Gian</span>
                  <span className="font-black text-slate-700">{formatStudyTime(w.totalStudySeconds)}</span>
                </div>
                <div className="flex flex-col p-2.5 bg-primary-50/50 rounded-xl border border-primary-100/50">
                  <span className="text-primary-600 font-medium text-[11px] uppercase tracking-wider mb-1">Từ Vựng</span>
                  <span className="font-black text-primary-700">{w.learnedVocab} từ</span>
                </div>
                <div className="flex flex-col p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider mb-1">Ngữ Pháp</span>
                  <span className="font-bold text-slate-700">{w.grammarAnswers > 0 ? w.grammarAnswers : '-'}</span>
                </div>
                <div className="flex flex-col p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider mb-1">Nghe & Đọc</span>
                  <span className="font-bold text-slate-700">{(w.listeningAnswers + w.readingAnswers) > 0 ? (w.listeningAnswers + w.readingAnswers) : '-'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
