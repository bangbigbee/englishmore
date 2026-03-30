'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface HomeworkRow {
  id: string
  title: string
  description: string | null
  dueDate: string
  submitted: boolean
  submittedAt: string | null
  note: string
}

interface HomeworkSummaryResponse {
  hasActiveCourse: boolean
  courseId?: string
  courseTitle: string
  totalHomework: number
  submittedHomework: number
  allHomework?: HomeworkRow[]
}

export default function MyHomeworkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [summary, setSummary] = useState<HomeworkSummaryResponse | null>(null)
  const [notesByHomework, setNotesByHomework] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/admin')
        return
      }

      if (session?.user?.role === 'user') {
        router.push('/courses')
        return
      }

      void fetchHomework()
    }
  }, [status, session?.user?.role, router])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/member/homework-summary')
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Không thể tải bài tập' }))
        throw new Error(data.error || 'Không thể tải bài tập')
      }

      const data = (await res.json()) as HomeworkSummaryResponse
      const rows = Array.isArray(data.allHomework) ? data.allHomework : []

      setSummary(data)
      setNotesByHomework(
        Object.fromEntries(rows.map((row) => [row.id, row.note || '']))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài tập')
    } finally {
      setLoading(false)
    }
  }

  const allHomework = useMemo(() => summary?.allHomework || [], [summary])
  const pendingHomework = useMemo(() => allHomework.filter((row) => !row.submitted), [allHomework])
  const submittedHomework = useMemo(() => allHomework.filter((row) => row.submitted), [allHomework])

  const submitOrUpdateHomework = async (homeworkId: string, isUpdate: boolean) => {
    const note = String(notesByHomework[homeworkId] || '').trim()
    if (!note) {
      setError('Ghi chú không được để trống')
      return
    }

    try {
      setSavingId(homeworkId)
      setError('')
      setSuccess('')

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeworkId, description: note })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lưu bài tập')
      }

      setSuccess(isUpdate ? 'Đã cập nhật bài tập đã nộp.' : 'Đã nộp bài tập thành công.')
      await fetchHomework()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu bài tập')
    } finally {
      setSavingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Đang tải My Homework...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#ecfeff] via-white to-[#f0fdf4]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">My Homework</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">Theo dõi bài cần làm, bài đã nộp và chỉnh sửa bài đã nộp của bạn.</p>
            <p className="mt-1 text-sm font-semibold text-[#14532d]">Khóa học: {summary?.courseTitle || 'Chưa có khóa học active'}</p>
          </div>
          <Link href="/" className="brand-cta brand-cta-outline">
            <span>Về trang chủ</span>
            <span aria-hidden="true" className="brand-cta-arrow">→</span>
          </Link>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-[#14532d]/30 bg-[#14532d]/10 px-4 py-3 text-[#14532d]">{success}</div>}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tổng bài tập</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{summary?.totalHomework || 0}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-700">Đang cần làm</p>
            <p className="mt-2 text-3xl font-black text-amber-800">{pendingHomework.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Đã nộp</p>
            <p className="mt-2 text-3xl font-black text-emerald-800">{submittedHomework.length}</p>
          </div>
        </section>

        {!summary?.hasActiveCourse ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">Bạn chưa có khóa học active để làm homework.</p>
            <Link href="/courses" className="mt-4 inline-flex rounded bg-[#14532d] px-4 py-2 text-white hover:bg-[#166534]">Đăng ký khóa học</Link>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-amber-800">Bài tập đang cần làm</h2>
              <div className="mt-4 space-y-4">
                {pendingHomework.length === 0 && (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">Bạn đã nộp hết bài tập cần làm.</p>
                )}

                {pendingHomework.map((item) => (
                  <article key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">Hạn nộp: {new Date(item.dueDate).toLocaleDateString('vi-VN')}</p>
                    {item.description && <p className="mt-2 text-sm text-slate-700">{item.description}</p>}
                    <label className="mt-3 block text-sm font-semibold text-slate-700">Ghi chú</label>
                    <textarea
                      value={notesByHomework[item.id] || ''}
                      onChange={(e) => setNotesByHomework((current) => ({ ...current, [item.id]: e.target.value }))}
                      rows={4}
                      placeholder="Nhập nội dung bài làm của bạn..."
                      className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => submitOrUpdateHomework(item.id, false)}
                      disabled={savingId === item.id}
                      className="mt-3 rounded bg-[#14532d] px-4 py-2 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-50"
                    >
                      {savingId === item.id ? 'Đang nộp...' : 'Nộp bài'}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-emerald-800">Bài tập đã nộp</h2>
              <div className="mt-4 space-y-4">
                {submittedHomework.length === 0 && (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">Bạn chưa nộp bài tập nào.</p>
                )}

                {submittedHomework.map((item) => (
                  <article key={item.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">Nộp lúc: {item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                    <label className="mt-3 block text-sm font-semibold text-slate-700">Ghi chú đã nộp (có thể chỉnh sửa)</label>
                    <textarea
                      value={notesByHomework[item.id] || ''}
                      onChange={(e) => setNotesByHomework((current) => ({ ...current, [item.id]: e.target.value }))}
                      rows={4}
                      placeholder="Cập nhật ghi chú bài làm..."
                      className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => submitOrUpdateHomework(item.id, true)}
                      disabled={savingId === item.id}
                      className="mt-3 rounded bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {savingId === item.id ? 'Đang cập nhật...' : 'Cập nhật bài đã nộp'}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
