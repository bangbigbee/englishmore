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
  teacherComment: string
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
        const data = await res.json().catch(() => ({ error: 'Could not load homework.' }))
        throw new Error(data.error || 'Could not load homework.')
      }

      const data = (await res.json()) as HomeworkSummaryResponse
      const rows = Array.isArray(data.allHomework) ? data.allHomework : []

      setSummary(data)
      setNotesByHomework(
        Object.fromEntries(rows.map((row) => [row.id, row.note || '']))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load homework.')
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
      setError('The note cannot be empty.')
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
        throw new Error(data.error || 'Could not save the homework.')
      }

      setSuccess(isUpdate ? 'Submitted homework updated.' : 'Homework submitted successfully.')
      await fetchHomework()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the homework.')
    } finally {
      setSavingId(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading My Homework...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#ecfeff] via-white to-[#f0fdf4]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">My Homework</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">Track pending homework, submitted work, and updates to previous submissions.</p>
            <p className="mt-1 text-sm font-semibold text-[#14532d]">Course: {summary?.courseTitle || 'No active course yet'}</p>
          </div>
          <Link href="/" className="brand-cta brand-cta-outline">
            <span>Back to home</span>
            <span aria-hidden="true" className="brand-cta-arrow">→</span>
          </Link>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-[#14532d]/30 bg-[#14532d]/10 px-4 py-3 text-[#14532d]">{success}</div>}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total homework</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{summary?.totalHomework || 0}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-700">Pending</p>
            <p className="mt-2 text-3xl font-black text-amber-800">{pendingHomework.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Submitted</p>
            <p className="mt-2 text-3xl font-black text-emerald-800">{submittedHomework.length}</p>
          </div>
        </section>

        {!summary?.hasActiveCourse ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">You do not have an active course for homework yet.</p>
            <Link href="/courses" className="mt-4 inline-flex rounded bg-[#14532d] px-4 py-2 text-white hover:bg-[#166534]">Browse courses</Link>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-amber-800">Pending Homework</h2>
              <div className="mt-4 space-y-4">
                {pendingHomework.length === 0 && (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">You have submitted all required homework.</p>
                )}

                {pendingHomework.map((item) => (
                  <article key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">Due: {new Date(item.dueDate).toLocaleDateString('en-GB')}</p>
                    {item.description && <p className="mt-2 text-sm text-slate-700">{item.description}</p>}
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-white/80 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Conversation</p>
                      <div className="mt-3 flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-amber-100 px-3 py-2 text-sm text-amber-950 shadow-sm">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">You</p>
                          <p className="mt-1 text-amber-900">Start the conversation by sending your homework message below.</p>
                        </div>
                      </div>
                    </div>
                    <label className="mt-4 block text-sm font-semibold text-slate-700">Your message</label>
                    <textarea
                      value={notesByHomework[item.id] || ''}
                      onChange={(e) => setNotesByHomework((current) => ({ ...current, [item.id]: e.target.value }))}
                      rows={4}
                      placeholder="Write your homework message..."
                      className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => submitOrUpdateHomework(item.id, false)}
                      disabled={savingId === item.id}
                      className="mt-3 rounded bg-[#14532d] px-4 py-2 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-50"
                    >
                      {savingId === item.id ? 'Sending...' : 'Send message'}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-emerald-800">Submitted Homework</h2>
              <div className="mt-4 space-y-4">
                {submittedHomework.length === 0 && (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">You have not submitted any homework yet.</p>
                )}

                {submittedHomework.map((item) => (
                  <article key={item.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">Submitted at: {item.submittedAt ? new Date(item.submittedAt).toLocaleString('en-GB') : 'N/A'}</p>
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/85 p-3 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Conversation</p>
                      <div className="mt-3 space-y-3">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-100 px-3 py-2 text-sm text-emerald-950 shadow-sm">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">You</p>
                            <p className="mt-1 whitespace-pre-wrap text-emerald-900">{item.note || 'No message yet.'}</p>
                          </div>
                        </div>

                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-950 shadow-sm">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">Teacher</p>
                            <p className="mt-1 whitespace-pre-wrap text-blue-900">{item.teacherComment || 'The teacher has not replied yet.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <label className="mt-4 block text-sm font-semibold text-slate-700">Your next message</label>
                    <textarea
                      value={notesByHomework[item.id] || ''}
                      onChange={(e) => setNotesByHomework((current) => ({ ...current, [item.id]: e.target.value }))}
                      rows={4}
                      placeholder="Write your next message..."
                      className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => submitOrUpdateHomework(item.id, true)}
                      disabled={savingId === item.id}
                      className="mt-3 rounded bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {savingId === item.id ? 'Sending...' : 'Send message'}
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
