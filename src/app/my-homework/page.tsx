'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface HomeworkRow {
  id: string
  title: string
  description: string | null
  attachmentUrl: string | null
  dueDate: string
  submitted: boolean
  submittedAt: string | null
  note: string
  teacherComment: string
  messages?: HomeworkMessage[]
}

interface HomeworkMessage {
  id: string
  senderRole: 'student' | 'teacher'
  content: string
  createdAt: string
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
  const [expandedDetailByHomework, setExpandedDetailByHomework] = useState<Record<string, boolean>>({})

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
      const res = await fetch('/api/member/homework-summary?markAsRead=1')
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Could not load homework.' }))
        throw new Error(data.error || 'Could not load homework.')
      }

      const data = (await res.json()) as HomeworkSummaryResponse
      const rows = Array.isArray(data.allHomework) ? data.allHomework : []

      setSummary(data)
      setNotesByHomework(
        Object.fromEntries(rows.map((row) => [row.id, '']))
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
      setNotesByHomework((current) => ({ ...current, [homeworkId]: '' }))
      await fetchHomework()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the homework.')
    } finally {
      setSavingId(null)
    }
  }

  const toggleHomeworkDetail = (homeworkId: string) => {
    setExpandedDetailByHomework((current) => ({
      ...current,
      [homeworkId]: !current[homeworkId]
    }))
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

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-700">Pending Homework</p>
            <p className="mt-2 text-3xl font-black text-amber-800">{pendingHomework.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Submitted Homework</p>
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
              <div className="space-y-4">
                {pendingHomework.length === 0 && (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">You have submitted all required homework.</p>
                )}

                {pendingHomework.map((item) => (
                  <article key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">Due: <span className="font-medium text-amber-800">{new Date(item.dueDate).toLocaleDateString('en-GB')}</span></p>
                    {item.description && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleHomeworkDetail(item.id)}
                          className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          Detail
                          <span aria-hidden="true">{expandedDetailByHomework[item.id] ? '−' : '+'}</span>
                        </button>
                        {expandedDetailByHomework[item.id] && (
                          <div className="mt-2 rounded-lg border border-amber-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-1">Assignment Description</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {item.attachmentUrl && (
                      <div className="mt-2">
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                          </svg>
                          Download attachment
                        </a>
                      </div>
                    )}
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
                      {savingId === item.id ? 'Sending...' : 'Submit'}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                {submittedHomework.length === 0 && (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">You have not submitted any homework yet.</p>
                )}

                {submittedHomework.map((item) => (
                  <article key={item.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">Submitted: <span className="font-medium text-emerald-800">{item.submittedAt ? new Date(item.submittedAt).toLocaleString('en-GB') : 'N/A'}</span></p>
                    {item.description && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleHomeworkDetail(item.id)}
                          className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                        >
                          Detail
                          <span aria-hidden="true">{expandedDetailByHomework[item.id] ? '−' : '+'}</span>
                        </button>
                        {expandedDetailByHomework[item.id] && (
                          <div className="mt-2 rounded-lg border border-emerald-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">Assignment Description</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {item.attachmentUrl && (
                      <div className="mt-2">
                        <a
                          href={item.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                          </svg>
                          Download attachment
                        </a>
                      </div>
                    )}
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/85 p-3 shadow-sm">
                      <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
                        {(item.messages || []).map((message) => (
                          <div key={message.id} className={`flex ${message.senderRole === 'student' ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                                message.senderRole === 'student'
                                  ? 'rounded-br-md bg-emerald-100 text-emerald-950'
                                  : 'rounded-bl-md border border-blue-200 bg-blue-50 text-blue-950'
                              }`}
                            >
                              <p
                                className={`text-[11px] font-bold uppercase tracking-wide ${
                                  message.senderRole === 'student' ? 'text-emerald-700' : 'text-blue-700'
                                }`}
                              >
                                {message.senderRole === 'student' ? 'You' : 'Teacher'}
                              </p>
                              <p
                                className={`mt-1 whitespace-pre-wrap ${
                                  message.senderRole === 'student' ? 'text-emerald-900' : 'text-blue-900'
                                }`}
                              >
                                {message.content}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">{new Date(message.createdAt).toLocaleString('en-GB')}</p>
                            </div>
                          </div>
                        ))}
                        {(item.messages || []).length === 0 && (
                          <p className="text-sm text-slate-600">No messages yet.</p>
                        )}
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
                      {savingId === item.id ? 'Sending...' : 'Send'}
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
