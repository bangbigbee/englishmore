'use client'
import { useEffect, useState } from 'react'
import VocabularyHeatmap from '@/components/VocabularyHeatmap'

export default function ProgressView() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user/progress-stats')
        if (!res.ok) throw new Error('Failed to fetch progress stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="text-center py-8 text-slate-500">Đang tải tiến độ...</div>
  if (error) return <div className="text-center py-8 text-rose-600">{error}</div>
  if (!stats) return null

  const { vocabulary, grammar, reading, listening, actualTest } = stats

  return (
    <div className="space-y-8 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vocabulary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-600 mb-3">Từ vựng</h3>
          <p className="text-3xl font-black text-primary-900">{vocabulary.learned}</p>
          <p className="text-sm text-slate-500">/ {vocabulary.total} từ</p>
          <p className="mt-2 text-sm text-primary-600">Hoàn thành {vocabulary.completionRate}%</p>
        </div>
        {/* Grammar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-600 mb-3">Ngữ pháp</h3>
          <p className="text-2xl font-bold text-primary-900">Đúng: {grammar.correct}</p>
          <p className="text-sm text-slate-500">Sai: {grammar.incorrect}</p>
        </div>
        {/* Reading */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-600 mb-3">Đọc</h3>
          <p className="text-2xl font-bold text-primary-900">Đúng: {reading.correct}</p>
          <p className="text-sm text-slate-500">Sai: {reading.incorrect}</p>
        </div>
        {/* Listening */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-600 mb-3">Nghe</h3>
          <p className="text-2xl font-bold text-primary-900">Đúng: {listening.correct}</p>
          <p className="text-sm text-slate-500">Sai: {listening.incorrect}</p>
        </div>
        {/* Actual Test */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-600 mb-3">Đề thực tế</h3>
          <p className="text-2xl font-bold text-primary-900">Đúng: {actualTest.correct}</p>
          <p className="text-sm text-slate-500">Sai: {actualTest.incorrect}</p>
        </div>
      </div>

      {vocabulary?.heatmap && (
        <VocabularyHeatmap heatmap={vocabulary.heatmap} />
      )}
    </div>
  )
}
