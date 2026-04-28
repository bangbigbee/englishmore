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
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 relative bg-primary-950/40 rounded-3xl my-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary-300 to-primary-100 tracking-tight mb-3 inline-block">
          Bảng Vinh Danh Chiến Binh ToeicMore
        </h2>
        <p className="text-primary-200/80 max-w-2xl mx-auto text-sm sm:text-base">
          Những học viên kiên trì và bền bỉ nhất trên hành trình chinh phục TOEIC.
        </p>
      </div>

      <div className="bg-primary-900/60 md:rounded-3xl shadow-xl shadow-primary-900/20 border border-primary-800 overflow-hidden backdrop-blur-sm">
        {/* Desktop / Tablet View */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-primary-200 uppercase bg-primary-950/60 border-b border-primary-800 font-semibold">
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
            <tbody className="divide-y divide-primary-800/50">
              {warriors.map((w, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={w.id} 
                  className="hover:bg-primary-800/40 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm bg-primary-800 text-primary-200 group-hover:bg-primary-700 group-hover:text-white transition-all shadow-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-800 border-2 border-primary-700 shadow-sm ring-2 ring-transparent group-hover:ring-primary-300 transition-all">
                        {w.image ? (
                          <img src={w.image} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-300 font-bold">
                            {w.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-primary-50">{w.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      <span>{w.toeicStars}</span>
                      <span className="text-xs">⭐</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-semibold text-primary-100 bg-primary-800 px-2.5 py-1 rounded-md text-xs border border-primary-700/50">{formatStudyTime(w.totalStudySeconds)}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-primary-200 font-medium whitespace-nowrap">
                    {w.grammarAnswers > 0 ? w.grammarAnswers : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-primary-200 font-medium whitespace-nowrap">
                    {w.listeningAnswers > 0 ? w.listeningAnswers : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-primary-200 font-medium whitespace-nowrap">
                    {w.readingAnswers > 0 ? w.readingAnswers : '-'}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="font-bold text-primary-50 bg-primary-700 px-2.5 py-1 rounded-md text-xs border border-primary-600">
                      {w.learnedVocab}
                    </span>
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
